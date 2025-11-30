// backend/src/controllers/professionalController.js
import db from '../models/index.js';
import { Op } from 'sequelize';

// 🆕 BUSCAR PROFISSIONAL DO USUÁRIO LOGADO (ROTA /ME)
export const getProfessionalByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('👤 Buscando profissional para userId:', userId);

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
      social_media: professional.social_media,
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

// 📋 LISTAR TODOS OS PROFISSIONAIS E EMPRESAS
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

    // ✅ BUSCAR PROFISSIONAIS
    const whereProfessional = { is_active: true };
    if (category) whereProfessional.category_id = category;
    if (city) whereProfessional.city = { [Op.iLike]: `%${city}%` };
    if (state) whereProfessional.state = { [Op.iLike]: `%${state}%` };
    if (search) {
      whereProfessional[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const professionals = await db.Professional.findAll({
      where: whereProfessional,
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
          ...(subcategory && { where: { id: subcategory } })
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'user_type', 'name', 'profile_photo'],
          where: { user_type: 'professional' },
          required: false
        }
      ]
    });

    // ✅ BUSCAR EMPRESAS
    const whereCompany = { is_active: true };
    if (category) whereCompany.category_id = category;
    if (city) whereCompany.city_id = city;
    if (state) whereCompany.state = { [Op.iLike]: `%${state}%` };
    if (search) {
      whereCompany[Op.or] = [
        { company_name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const companies = await db.Company.findAll({
      where: whereCompany,
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
          ...(subcategory && { where: { id: subcategory } })
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'user_type', 'name', 'profile_photo'],
          where: { user_type: 'company' },
          required: false
        }
      ]
    });

    // ✅ NORMALIZAR PROFISSIONAIS
    const normalizedProfessionals = professionals
      .filter(prof => !prof.user || prof.user.user_type === 'professional')
      .map(prof => ({
        id: prof.id,
        name: prof.name,
        email: prof.email,
        phone: prof.phone,
        whatsapp: prof.whatsapp,
        profile_photo: prof.user?.profile_photo || prof.profile_photo,
        category_id: prof.category_id, // ✅ ADICIONAR category_id
        category: prof.category,
        subcategories: prof.subcategories,
        city: prof.city,
        state: prof.state,
        description: prof.description,
        experience: prof.experience,
        education: prof.education,
        business_address: prof.business_address,
        google_maps_link: prof.google_maps_link,
        social_media: prof.social_media,
        type: 'professional',
        user_type: 'professional'
      }));

    // ✅ NORMALIZAR EMPRESAS
    const normalizedCompanies = companies
      .filter(comp => !comp.user || comp.user.user_type === 'company')
      .map(comp => ({
        id: comp.id,
        name: comp.company_name,
        email: comp.email,
        phone: comp.phone,
        whatsapp: comp.whatsapp,
        profile_photo: comp.user?.profile_photo || comp.logo,
        category_id: comp.category_id, // ✅ ADICIONAR category_id
        category: comp.category,
        subcategories: comp.subcategories || [],
        city: comp.city_id,
        state: comp.state,
        description: comp.description,
        experience: null,
        education: null,
        business_address: comp.address,
        google_maps_link: null,
        social_media: comp.social_media,
        type: 'company',
        user_type: 'company',
        cnpj: comp.cnpj,
        website: comp.website
      }));

    // ✅ COMBINAR E PAGINAR
    const allResults = [...normalizedProfessionals, ...normalizedCompanies];
    const paginatedResults = allResults.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        total: allResults.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(allResults.length / limit)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao listar profissionais:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao listar profissionais',
      message: error.message
    });
  }
};

// 🔍 BUSCAR PROFISSIONAL OU EMPRESA POR ID
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Buscando por ID:', id);

    // ✅ SE O ID COMEÇA COM 'comp-', BUSCA NA TABELA COMPANIES
    if (id.startsWith('comp-')) {
      console.log('🏢 Buscando EMPRESA...');
      
      const company = await db.Company.findOne({
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
          },
          {
            model: db.User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'profile_photo']
          }
        ]
      });

      if (!company) {
        return res.status(404).json({
          success: false,
          error: 'Empresa não encontrada'
        });
      }

      // Parsear social_media
      let socialMedia = {};
      if (company.social_media) {
        if (typeof company.social_media === 'string') {
          try {
            socialMedia = JSON.parse(company.social_media);
          } catch (e) {
            console.error('Erro ao parsear social_media:', e);
          }
        } else {
          socialMedia = company.social_media;
        }
      }

      const response = {
        id: company.id,
        type: 'company',
        user_type: 'company',
        company_name: company.company_name,
        name: company.user?.name || company.company_name,
        email: company.email || company.user?.email,
        phone: company.phone,
        whatsapp: company.whatsapp,
        profile_photo: company.user?.profile_photo || company.logo,
        cnpj: company.cnpj,
        website: company.website,
        category_id: company.category_id,
        category: company.category,
        subcategories: company.subcategories || [],
        city: company.city_id,
        state: company.state,
        description: company.description,
        business_address: company.address,
        social_media: socialMedia,
        is_active: company.is_active,
        created_at: company.created_at,
        updated_at: company.updated_at
      };

      console.log('✅ Empresa encontrada:', response.company_name);

      return res.json({
        success: true,
        data: response
      });
    }

    // ✅ SENÃO, BUSCA NA TABELA PROFESSIONALS
    console.log('👷 Buscando PROFISSIONAL...');
    
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
        },
        {
          model: db.User,
          as: 'user',
          attributes: ['id', 'profile_photo']
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      });
    }

    // Parsear social_media
    let socialMedia = {};
    if (professional.social_media) {
      if (typeof professional.social_media === 'string') {
        try {
          socialMedia = JSON.parse(professional.social_media);
        } catch (e) {
          console.error('Erro ao parsear social_media:', e);
        }
      } else {
        socialMedia = professional.social_media;
      }
    }

    const response = {
      id: professional.id,
      type: 'professional',
      user_type: 'professional',
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      whatsapp: professional.whatsapp,
      profile_photo: professional.user?.profile_photo || professional.profile_photo,
      cpf: professional.cpf,
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
      social_media: socialMedia,
      is_active: professional.is_active,
      created_at: professional.created_at,
      updated_at: professional.updated_at
    };

    console.log('✅ Profissional encontrado:', response.name);

    res.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('❌ Erro ao buscar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar',
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
      google_maps_link,
      social_media
    } = req.body;

    console.log('📝 Atualizando profissional:', id);
    console.log('📦 Dados recebidos:', req.body);

    const professional = await db.Professional.findByPk(id);

    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      });
    }

    let socialMediaToSave = null;
    if (social_media) {
      if (typeof social_media === 'object') {
        socialMediaToSave = social_media;
      } else if (typeof social_media === 'string') {
        try {
          socialMediaToSave = JSON.parse(social_media);
        } catch (e) {
          console.error('Erro ao parsear social_media:', e);
          socialMediaToSave = social_media;
        }
      }
    }

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
      google_maps_link: google_maps_link !== undefined ? google_maps_link : professional.google_maps_link,
      social_media: socialMediaToSave !== null ? socialMediaToSave : professional.social_media
    });

    console.log('✅ Social media salvo:', socialMediaToSave);

    if (subcategories && Array.isArray(subcategories)) {
      const subcategoryRecords = await db.Subcategory.findAll({
        where: { id: { [Op.in]: subcategories } }
      });
      await professional.setSubcategories(subcategoryRecords);
    }

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
      images // ✅ RECEBER ARRAY DE URLs JÁ UPLOADADAS
    } = req.body;

    console.log('➕ Criando portfolio para profissional:', id);
    console.log('📋 Body completo:', req.body);
    console.log('📁 Files:', req.files);

    // ✅ VERIFICAR SE O PROFISSIONAL EXISTE
    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        success: false,
        error: 'Profissional não encontrado'
      });
    }

    // ✅ VERIFICAR PERMISSÃO
    if (req.user && professional.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para adicionar itens a este portfolio'
      });
    }

    // ✅ IMAGENS: ou vêm de req.files (upload direto) ou do body (já uploadadas)
    let imageUrls = [];
    
    if (req.files && req.files.length > 0) {
      // Caso 1: Upload direto via multipart/form-data
      imageUrls = req.files.map(file => file.path);
      console.log('📷 Imagens de req.files:', imageUrls);
    } else if (images && Array.isArray(images) && images.length > 0) {
      // Caso 2: URLs já foram uploadadas previamente
      imageUrls = images;
      console.log('📷 Imagens do body:', imageUrls);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const portfolioId = `port-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // ✅ CRIAR ITEM DO PORTFOLIO
    const portfolioItem = await db.PortfolioItem.create({
      id: portfolioId,
      professional_id: id,
      title: title || 'Sem título',
      description: description || '',
      project_type: project_type || null,
      area: area || null,
      duration: duration || null,
      completed_at: completed_at || null,
      tags: tags || [],
      images: imageUrls
    });

    console.log('✅ Portfolio criado:', portfolioItem.id);
    console.log('✅ Imagens salvas:', portfolioItem.images);

    res.json({
      success: true,
      message: `Item adicionado ao portfolio com ${imageUrls.length} foto(s)`,
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

    console.log('✏️ Atualizando portfolio item:', itemId);
    console.log('📋 Dados recebidos:', updateData);

    const portfolioItem = await db.PortfolioItem.findByPk(itemId);

    if (!portfolioItem) {
      return res.status(404).json({
        success: false,
        error: 'Item não encontrado'
      });
    }

    if (updateData.images && Array.isArray(updateData.images)) {
      console.log('📸 Atualizando imagens:', updateData.images.length);
    }

    await portfolioItem.update(updateData);

    console.log('✅ Portfolio atualizado com sucesso');

    res.json({
      success: true,
      message: 'Item atualizado com sucesso',
      data: portfolioItem
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar item:', error);
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

// 🤝 INDICAR PROFISSIONAL
export const indicateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const indicatorId = req.user.id;

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