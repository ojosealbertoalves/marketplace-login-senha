// backend/src/controllers/professionalController.js - VERSÃO CORRIGIDA COM /ME
import db from '../models/index.js';
import { Op } from 'sequelize';

// 🆕 BUSCAR PROFISSIONAL DO USUÁRIO LOGADO (ROTA /ME)
export const getProfessionalByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 Buscando profissional para userId:', userId);

    // Buscar ou criar profissional automaticamente
    let professional = await db.Professional.findOne({
      where: { user_id: userId },
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });

    // Se não existe, criar automaticamente
    if (!professional) {
      console.log('⚠️ Profissional não encontrado, criando automaticamente...');
      
      const user = await db.User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      professional = await db.Professional.create({
        user_id: userId,
        name: user.name || user.email.split('@')[0],
        email: user.email,
        profile_photo: user.profile_photo || null,
        city: user.city || '',
        state: user.state || '',
        is_active: true
      });

      console.log('✅ Perfil profissional criado:', professional.id);

      // Recarregar com associações
      professional = await db.Professional.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: db.Subcategory,
            as: 'subcategories',
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ]
      });
    }

    // Formatar resposta
    const response = {
      id: professional.id,
      user_id: professional.user_id,
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      whatsapp: professional.whatsapp,
      profile_photo: professional.profile_photo,
      category_id: professional.category_id,
      category: professional.category,
      subcategories: professional.subcategories || [],
      city: professional.city,
      state: professional.state,
      description: professional.description,
      experience: professional.experience,
      education: professional.education,
      business_address: professional.business_address,
      google_maps_link: professional.google_maps_link,
      is_active: professional.is_active,
      created_at: professional.created_at,
      updated_at: professional.updated_at
    };

    console.log('✅ Profissional encontrado:', response.id);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados do profissional',
      message: error.message
    });
  }
};

// 📋 LISTAR TODOS OS PROFISSIONAIS
export const getAllProfessionals = async (req, res) => {
  try {
    const {
      category,
      subcategory,
      city,
      state,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { is_active: true };

    // Filtros
    if (category) where.category_id = category;
    if (city) where.city = { [Op.iLike]: `%${city}%` };
    if (state) where.state = { [Op.iLike]: `%${state}%` };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: professionals } = await db.Professional.findAndCountAll({
      where,
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name'],
          ...(subcategory && {
            where: { id: subcategory }
          })
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: professionals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao listar profissionais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar profissionais',
      message: error.message
    });
  }
};

// 🔍 BUSCAR PROFISSIONAL POR ID
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;

    const professional = await db.Professional.findOne({
      where: { id, is_active: true },
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      });
    }

    res.json({
      success: true,
      data: professional
    });

  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar profissional',
      message: error.message
    });
  }
};

// ✏️ ATUALIZAR PROFISSIONAL
export const updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      whatsapp,
      category_id,
      subcategories,
      city,
      state,
      description,
      experience,
      education,
      business_address,
      google_maps_link
    } = req.body;

    const professional = await db.Professional.findByPk(id);

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      });
    }

    // Atualizar dados básicos
    await professional.update({
      name: name || professional.name,
      email: email || professional.email,
      phone: phone !== undefined ? phone : professional.phone,
      whatsapp: whatsapp !== undefined ? whatsapp : professional.whatsapp,
      category_id: category_id || professional.category_id,
      city: city !== undefined ? city : professional.city,
      state: state !== undefined ? state : professional.state,
      description: description !== undefined ? description : professional.description,
      experience: experience !== undefined ? experience : professional.experience,
      education: education !== undefined ? education : professional.education,
      business_address: business_address !== undefined ? business_address : professional.business_address,
      google_maps_link: google_maps_link !== undefined ? google_maps_link : professional.google_maps_link
    });

    // Atualizar subcategorias se fornecidas
    if (subcategories && Array.isArray(subcategories)) {
      const subcategoryRecords = await db.Subcategory.findAll({
        where: { id: { [Op.in]: subcategories } }
      });
      await professional.setSubcategories(subcategoryRecords);
    }

    // Recarregar com associações
    const updatedProfessional = await db.Professional.findByPk(id, {
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Profissional atualizado com sucesso',
      data: updatedProfessional
    });

  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar profissional',
      message: error.message
    });
  }
};

// 📂 BUSCAR PORTFOLIO
export const getProfessionalPortfolio = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolioItems = await db.PortfolioItem.findAll({
      where: { professional_id: id },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: portfolioItems
    });

  } catch (error) {
    console.error('Erro ao buscar portfolio:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar portfolio',
      message: error.message
    });
  }
};

// ➕ ADICIONAR ITEM AO PORTFOLIO
export const addPortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      project_type,
      area,
      duration,
      completed_at,
      tags,
      images
    } = req.body;

    console.log('➕ Criando portfolio para profissional:', id);
    console.log('📋 Dados recebidos:', { title, images: images?.length });

    // ✅ GERAR ID MANUALMENTE
    const portfolioId = `port-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const portfolioItem = await db.PortfolioItem.create({
      id: portfolioId, // ✅ ID EXPLÍCITO
      professional_id: id,
      title: title || 'Sem título',
      description: description || '',
      project_type: project_type || null,
      area: area || null,
      duration: duration || null,
      completed_at: completed_at || null,
      tags: tags || [],
      images: images || []
    });

    console.log('✅ Portfolio criado com sucesso:', portfolioItem.id);

    res.json({
      success: true,
      message: 'Item adicionado ao portfolio',
      data: portfolioItem
    });

  } catch (error) {
    console.error('❌ Erro ao adicionar item ao portfolio:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro ao adicionar item ao portfolio',
      message: error.message
    });
  }
};

// ✏️ ATUALIZAR ITEM DO PORTFOLIO
export const updatePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;

    const portfolioItem = await db.PortfolioItem.findByPk(itemId);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }

    await portfolioItem.update(updateData);

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      data: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar item',
      message: error.message
    });
  }
};

// 🗑️ DELETAR ITEM DO PORTFOLIO
export const deletePortfolioItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const portfolioItem = await db.PortfolioItem.findByPk(itemId);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }

    await portfolioItem.destroy();

    res.json({
      success: true,
      message: 'Item removido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar item:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar item',
      message: error.message
    });
  }
};

// 📤 UPLOAD DE IMAGENS DO PORTFOLIO
export const uploadPortfolioImages = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado'
      });
    }

    // As URLs já vêm do multer/cloudinary configurado
    const imageUrls = req.files.map(file => file.path);

    res.json({
      success: true,
      message: `${imageUrls.length} imagem(ns) enviada(s) com sucesso`,
      data: {
        images: imageUrls,
        uploadedCount: imageUrls.length
      }
    });

  } catch (error) {
    console.error('Erro no upload de imagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer upload das imagens',
      message: error.message
    });
  }
};

// 🗑️ DELETAR IMAGEM DO PORTFOLIO
export const deletePortfolioImage = async (req, res) => {
  try {
    const { id, imageIndex } = req.params;

    const professional = await db.Professional.findByPk(id);

    if (!professional || !professional.portfolio_images) {
      return res.status(404).json({
        success: false,
        error: 'Portfolio não encontrado'
      });
    }

    const images = [...professional.portfolio_images];
    const index = parseInt(imageIndex);

    if (index < 0 || index >= images.length) {
      return res.status(400).json({
        success: false,
        error: 'Índice de imagem inválido'
      });
    }

    images.splice(index, 1);

    await professional.update({ portfolio_images: images });

    res.json({
      success: true,
      message: 'Imagem removida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar imagem',
      message: error.message
    });
  }
};

// 🤝 INDICAR PROFISSIONAL
export const indicateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const indicatorId = req.user.id;

    // Lógica de indicação aqui

    res.json({
      success: true,
      message: 'Profissional indicado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao indicar profissional:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao indicar profissional',
      message: error.message
    });
  }
};

// 📊 ESTATÍSTICAS DO PROFISSIONAL
export const getProfessionalStats = async (req, res) => {
  try {
    const { id } = req.params;

    const portfolioCount = await db.PortfolioItem.count({
      where: { professional_id: id }
    });

    res.json({
      success: true,
      data: {
        portfolioItems: portfolioCount
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
      message: error.message
    });
  }
};