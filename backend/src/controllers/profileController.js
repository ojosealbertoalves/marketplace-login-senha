// backend/src/controllers/professionalController.js - VERSÃO FINAL COM PORTFOLIO
import db from '../models/index.js';
import { deleteImage, getPublicIdFromUrl } from '../config/cloudinary.js';

// 📋 Listar todos os profissionais (FILTRANDO CLIENTES)
export const getAllProfessionals = async (req, res) => {
  try {
    const { category, city, state, search, page = 1, limit = 20 } = req.query;
    const isAuthenticated = !!req.user;

    const where = { is_active: true };
    
    const include = [
      {
        model: db.Category,
        as: 'category',
        required: false
      },
      {
        model: db.City,
        as: 'cityRelation',
        required: false
      },
      {
        model: db.Subcategory,
        as: 'subcategories',
        required: false,
        through: { attributes: [] }
      },
      {
        model: db.PortfolioItem,
        as: 'portfolio',
        required: false,
        limit: 3
      },
      {
        model: db.User,
        as: 'user',
        required: false,
        attributes: ['id', 'user_type', 'is_active', 'profile_photo']
      }
    ];

    if (category) {
      where.category_id = category;
    }

    if (city) {
      where.city_id = city;
    }

    if (state) {
      where.state = state;
    }

    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: professionals } = await db.Professional.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    const filteredProfessionals = professionals.filter(prof => {
      if (!prof.user) return true;
      return prof.user.user_type !== 'client';
    });

    const formattedProfessionals = filteredProfessionals.map(prof => {
      const professional = prof.toJSON();
      
      if (professional.user && professional.user.profile_photo) {
        professional.profile_photo = professional.user.profile_photo;
      }
      
      if (!isAuthenticated) {
        delete professional.email;
        delete professional.phone;
        delete professional.whatsapp;
        delete professional.business_address;
        delete professional.google_maps_link;
        professional.contactRestricted = true;
      }

      delete professional.user;

      return {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        photo: professional.profile_photo,
        profile_photo: professional.profile_photo,
        category: professional.category?.name || 'Não informado',
        categoryId: professional.category?.id,
        subcategories: professional.subcategories?.map(sub => sub.name) || [],
        city: professional.city || professional.cityRelation?.name || 'Não informado',
        state: professional.state || 'N/A',
        description: professional.description,
        experience: professional.experience,
        education: professional.education,
        phone: professional.phone,
        whatsapp: professional.whatsapp,
        businessAddress: professional.business_address,
        googleMapsLink: professional.google_maps_link,
        portfolio: professional.portfolio || [],
        contactRestricted: professional.contactRestricted
      };
    });

    res.json({
      success: true,
      data: formattedProfessionals,
      pagination: {
        total: filteredProfessionals.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(filteredProfessionals.length / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({
      error: 'Erro ao buscar profissionais',
      details: error.message
    });
  }
};

// 👤 Buscar profissional específico por ID
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user;

    const professional = await db.Professional.findByPk(id, {
      include: [
        {
          model: db.Category,
          as: 'category'
        },
        {
          model: db.City,
          as: 'cityRelation'
        },
        {
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] }
        },
        {
          model: db.PortfolioItem,
          as: 'portfolio'
        },
        {
          model: db.User,
          as: 'user',
          required: false,
          attributes: ['id', 'user_type', 'profile_photo']
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    if (professional.user && professional.user.user_type === 'client') {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    const profData = professional.toJSON();

    if (professional.user && professional.user.profile_photo) {
      profData.profile_photo = professional.user.profile_photo;
    }

    if (!isAuthenticated) {
      delete profData.email;
      delete profData.phone;
      delete profData.whatsapp;
      delete profData.business_address;
      delete profData.google_maps_link;
      profData.contactRestricted = true;
    }

    delete profData.user;

    console.log('✅ Profissional carregado:', profData.name);
    console.log('📸 Foto do perfil:', profData.profile_photo || 'Sem foto');

    res.json({
      success: true,
      data: profData
    });

  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      error: 'Erro ao buscar profissional',
      details: error.message
    });
  }
};

// 🔧 Atualizar perfil do profissional
export const updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const professional = await db.Professional.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'user',
          required: false
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    if (professional.user && professional.user.user_type === 'client') {
      return res.status(403).json({
        error: 'Este perfil não pode ser editado'
      });
    }

    if (userType !== 'admin' && professional.user_id !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para editar este perfil'
      });
    }

    const {
      name,
      description,
      experience,
      education,
      phone,
      whatsapp,
      business_address,
      google_maps_link,
      category_id,
      subcategories,
      city,
      state
    } = req.body;

    await professional.update({
      name,
      description,
      experience,
      education,
      phone,
      whatsapp,
      business_address,
      google_maps_link,
      category_id,
      city,
      state
    });

    if (subcategories && Array.isArray(subcategories)) {
      const subcategoryObjects = await db.Subcategory.findAll({
        where: { id: subcategories }
      });
      await professional.setSubcategories(subcategoryObjects);
    }

    console.log(`✅ Perfil profissional ${id} atualizado`);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: professional
    });

  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({
      error: 'Erro ao atualizar profissional',
      details: error.message
    });
  }
};

// 🤝 Indicar profissional
export const indicateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Indicação registrada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao indicar profissional:', error);
    res.status(500).json({
      error: 'Erro ao indicar profissional',
      details: error.message
    });
  }
};

// 📊 Estatísticas do profissional
export const getProfessionalStats = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        profileViews: 0,
        indications: 0,
        portfolioItems: 0
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      details: error.message
    });
  }
};

// 📂 Portfolio do profissional
export const getProfessionalPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolio = await db.PortfolioItem.findAll({
      where: { professional_id: id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: portfolio
    });

  } catch (error) {
    console.error('Erro ao buscar portfolio:', error);
    res.status(500).json({
      error: 'Erro ao buscar portfolio',
      details: error.message
    });
  }
};

// 📤 UPLOAD de imagens do portfolio
export const uploadPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const professional = await db.Professional.findByPk(id, {
      include: [{
        model: db.User,
        as: 'user',
        required: false
      }]
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    if (userType !== 'admin' && professional.user_id !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para adicionar imagens'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const uploadedImages = req.files.map(file => ({
      url: file.path,
      public_id: file.filename
    }));

    console.log(`📤 ${uploadedImages.length} imagens enviadas para o Cloudinary`);

    let portfolioItem = await db.PortfolioItem.findOne({
      where: { professional_id: id }
    });

    if (!portfolioItem) {
      portfolioItem = await db.PortfolioItem.create({
        professional_id: id,
        title: 'Meu Portfolio',
        description: '',
        images: uploadedImages
      });
      console.log('✅ Novo portfolio criado');
    } else {
      const currentImages = portfolioItem.images || [];
      const updatedImages = [...currentImages, ...uploadedImages];
      
      await portfolioItem.update({
        images: updatedImages
      });
      console.log('✅ Imagens adicionadas ao portfolio existente');
    }

    res.json({
      success: true,
      message: 'Imagens adicionadas com sucesso',
      data: {
        portfolio: portfolioItem,
        uploadedCount: uploadedImages.length
      }
    });

  } catch (error) {
    console.error('❌ Erro ao fazer upload de imagens:', error);
    res.status(500).json({
      error: 'Erro ao fazer upload das imagens',
      details: error.message
    });
  }
};

// 🗑️ DELETAR imagem específica do portfolio
export const deletePortfolioImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const userId = req.user.id;
    const userType = req.user.user_type;

    const professional = await db.Professional.findByPk(id, {
      include: [{
        model: db.User,
        as: 'user',
        required: false
      }]
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    if (userType !== 'admin' && professional.user_id !== userId) {
      return res.status(403).json({
        error: 'Você não tem permissão para remover imagens'
      });
    }

    const portfolioItem = await db.PortfolioItem.findOne({
      where: { professional_id: id }
    });

    if (!portfolioItem) {
      return res.status(404).json({
        error: 'Portfolio não encontrado'
      });
    }

    const currentImages = portfolioItem.images || [];
    const index = parseInt(imageIndex);

    if (index < 0 || index >= currentImages.length) {
      return res.status(400).json({
        error: 'Índice de imagem inválido'
      });
    }

    const imageToDelete = currentImages[index];
    
    console.log('🗑️ Deletando imagem:', imageToDelete);

    if (imageToDelete.public_id) {
      const deleted = await deleteImage(imageToDelete.public_id);
      if (deleted) {
        console.log('✅ Imagem deletada do Cloudinary');
      }
    } else if (imageToDelete.url) {
      const publicId = getPublicIdFromUrl(imageToDelete.url);
      if (publicId) {
        await deleteImage(publicId);
        console.log('✅ Imagem deletada do Cloudinary (extraída da URL)');
      }
    }

    const updatedImages = currentImages.filter((_, i) => i !== index);

    await portfolioItem.update({
      images: updatedImages
    });

    console.log('✅ Portfolio atualizado no banco de dados');

    res.json({
      success: true,
      message: 'Imagem removida com sucesso',
      data: {
        portfolio: portfolioItem
      }
    });

  } catch (error) {
    console.error('❌ Erro ao deletar imagem:', error);
    res.status(500).json({
      error: 'Erro ao deletar imagem',
      details: error.message
    });
  }
};

// ➕ Adicionar item ao portfolio
export const addPortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, images } = req.body;

    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    const portfolioItem = await db.PortfolioItem.create({
      professional_id: id,
      title,
      description,
      images: images || []
    });

    res.status(201).json({
      success: true,
      data: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao adicionar item ao portfolio:', error);
    res.status(500).json({
      error: 'Erro ao adicionar item',
      details: error.message
    });
  }
};

// ✏️ Atualizar item do portfolio
export const updatePortfolioItem = async (req, res) => {
  try {
    const { professionalId, itemId } = req.params;
    const { title, description, images } = req.body;

    const portfolioItem = await db.PortfolioItem.findOne({
      where: {
        id: itemId,
        professional_id: professionalId
      }
    });

    if (!portfolioItem) {
      return res.status(404).json({
        error: 'Item do portfolio não encontrado'
      });
    }

    await portfolioItem.update({
      title,
      description,
      images
    });

    res.json({
      success: true,
      data: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao atualizar item do portfolio:', error);
    res.status(500).json({
      error: 'Erro ao atualizar item',
      details: error.message
    });
  }
};

// 🗑️ Remover item do portfolio
export const deletePortfolioItem = async (req, res) => {
  try {
    const { professionalId, itemId } = req.params;

    const portfolioItem = await db.PortfolioItem.findOne({
      where: {
        id: itemId,
        professional_id: professionalId
      }
    });

    if (!portfolioItem) {
      return res.status(404).json({
        error: 'Item do portfolio não encontrado'
      });
    }

    const images = portfolioItem.images || [];
    for (const image of images) {
      if (image.public_id) {
        await deleteImage(image.public_id);
      } else if (image.url) {
        const publicId = getPublicIdFromUrl(image.url);
        if (publicId) {
          await deleteImage(publicId);
        }
      }
    }

    await portfolioItem.destroy();

    res.json({
      success: true,
      message: 'Item removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao remover item do portfolio:', error);
    res.status(500).json({
      error: 'Erro ao remover item',
      details: error.message
    });
  }
};