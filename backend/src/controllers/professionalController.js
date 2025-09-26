// backend/src/controllers/professionalController.js - VERSÃO ATUALIZADA COM AUTENTICAÇÃO
import db from '../models/index.js';

// 📋 Listar todos os profissionais (público, mas com controle de acesso para contatos)
export const getAllProfessionals = async (req, res) => {
  try {
    const { category, city, state, search, page = 1, limit = 20 } = req.query;
    const isAuthenticated = !!req.user; // Verificar se usuário está logado

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
        limit: 3 // Apenas 3 projetos para preview
      }
    ];

    // Filtros
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

    // Formatar dados com controle de acesso
    const formattedProfessionals = professionals.map(prof => {
      const professional = prof.toJSON();
      
      // Se não está autenticado, ocultar informações de contato
      if (!isAuthenticated) {
        delete professional.email;
        delete professional.phone;
        delete professional.whatsapp;
        delete professional.business_address;
        delete professional.google_maps_link;
        professional.contactRestricted = true;
      }

      return {
        id: professional.id,
        name: professional.name,
        email: professional.email,
        photo: professional.profile_photo,
        category: professional.category?.name || 'Não informado',
        categoryId: professional.category?.id,
        subcategories: professional.subcategories || [],
        city: professional.cityRelation?.name || professional.city,
        state: professional.state,
        description: professional.description,
        experience: professional.experience,
        education: professional.education,
        tags: professional.tags || [],
        phone: professional.phone,
        whatsapp: professional.whatsapp,
        socialMedia: professional.social_media || {},
        businessAddress: professional.business_address,
        googleMapsLink: professional.google_maps_link,
        portfolio: professional.portfolio || [],
        registrationDate: professional.created_at,
        contactRestricted: professional.contactRestricted || false
      };
    });

    res.json({
      success: true,
      data: formattedProfessionals,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      },
      meta: {
        isAuthenticated,
        message: !isAuthenticated ? 'Faça login para ver informações de contato' : null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar profissionais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// 👤 Obter profissional por ID (público, mas com controle de acesso)
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    const isAuthenticated = !!req.user;

    const professional = await db.Professional.findOne({
      where: { id, is_active: true },
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
          model: db.Indication,
          as: 'indicationsReceived',
          include: [{
            model: db.Professional,
            as: 'fromProfessional',
            attributes: ['id', 'name']
          }]
        }
      ]
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    const professionalData = professional.toJSON();

    // Se não está autenticado, ocultar informações de contato
    if (!isAuthenticated) {
      delete professionalData.email;
      delete professionalData.phone;
      delete professionalData.whatsapp;
      delete professionalData.business_address;
      delete professionalData.google_maps_link;
      // Ocultar quem indicou também
      professionalData.indicationsReceived = [];
      professionalData.contactRestricted = true;
    }

    res.json({
      success: true,
      data: professionalData,
      meta: {
        isAuthenticated,
        message: !isAuthenticated ? 'Faça login para ver informações de contato e indicações' : null
      }
    });

  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ✏️ Atualizar perfil profissional (apenas próprio perfil ou admin)
export const updateProfessional = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Buscar profissional
    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    // Verificar permissão: admin ou dono do perfil
    if (userType !== 'admin' && professional.user_id !== userId) {
      return res.status(403).json({
        error: 'Você só pode editar seu próprio perfil'
      });
    }

    // Campos que não podem ser atualizados diretamente
    delete updates.id;
    delete updates.user_id;
    delete updates.created_at;
    delete updates.updated_at;

    // Atualizar profissional
    await professional.update(updates);

    // Se subcategorias foram fornecidas, atualizar
    if (updates.subcategories) {
      const subcategoryObjects = await db.Subcategory.findAll({
        where: { id: updates.subcategories }
      });
      await professional.setSubcategories(subcategoryObjects);
    }

    // Buscar dados atualizados
    const updatedProfessional = await db.Professional.findByPk(id, {
      include: [
        { model: db.Category, as: 'category' },
        { model: db.City, as: 'cityRelation' },
        { model: db.Subcategory, as: 'subcategories' }
      ]
    });

  } catch (error) {
    console.error('Erro ao atualizar profissional:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// 🤝 Indicar profissional (apenas usuários logados)
export const indicateProfessional = async (req, res) => {
  try {
    const { id } = req.params; // ID do profissional sendo indicado
    const userId = req.user.id;
    const userType = req.user.user_type;

    // Buscar profissional que será indicado
    const toProfessional = await db.Professional.findByPk(id);
    if (!toProfessional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    // Buscar profissional que está fazendo a indicação (se for tipo professional)
    let fromProfessionalId = null;
    if (userType === 'professional') {
      const fromProfessional = await db.Professional.findOne({
        where: { user_id: userId }
      });
      
      if (!fromProfessional) {
        return res.status(400).json({
          error: 'Profissional não encontrado para fazer a indicação'
        });
      }
      fromProfessionalId = fromProfessional.id;
    }

    // Não permitir auto-indicação
    if (fromProfessionalId === id) {
      return res.status(400).json({
        error: 'Você não pode indicar a si mesmo'
      });
    }

    // Verificar se já indicou este profissional
    if (fromProfessionalId) {
      const existingIndication = await db.Indication.findOne({
        where: {
          from_professional_id: fromProfessionalId,
          to_professional_id: id
        }
      });

      if (existingIndication) {
        return res.status(409).json({
          error: 'Você já indicou este profissional'
        });
      }
    }

    // Criar indicação
    const indication = await db.Indication.create({
      from_professional_id: fromProfessionalId,
      to_professional_id: id,
      professional_name: req.user.name,
      email: req.user.email
    });

    res.status(201).json({
      success: true,
      message: 'Profissional indicado com sucesso',
      data: indication
    });

  } catch (error) {
    console.error('Erro ao indicar profissional:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
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

    const [
      totalPortfolioItems,
      totalIndications,
      profileViews // Implementar futuramente
    ] = await Promise.all([
      db.PortfolioItem.count({ where: { professional_id: id } }),
      db.Indication.count({ where: { to_professional_id: id } }),
      Promise.resolve(0) // Placeholder para views
    ]);

    res.json({
      success: true,
      data: {
        totalPortfolioItems,
        totalIndications,
        profileViews,
        registrationDate: professional.created_at
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// 📂 Portfolio do profissional
export const getProfessionalPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    const offset = (page - 1) * limit;

    const { count, rows: portfolioItems } = await db.PortfolioItem.findAndCountAll({
      where: { professional_id: id },
      offset,
      limit: parseInt(limit),
      order: [['completed_at', 'DESC']]
    });

    res.json({
      success: true,
      data: portfolioItems,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar portfolio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ➕ Adicionar item ao portfolio
export const addPortfolioItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      images,
      completed_at,
      project_type,
      area,
      duration,
      tags
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Título é obrigatório'
      });
    }

    const professional = await db.Professional.findByPk(id);
    if (!professional) {
      return res.status(404).json({
        error: 'Profissional não encontrado'
      });
    }

    const portfolioItem = await db.PortfolioItem.create({
      id: `portfolio-${Date.now()}`,
      professional_id: id,
      title,
      description,
      images: images || [],
      completed_at: completed_at ? new Date(completed_at) : null,
      project_type,
      area,
      duration,
      tags: tags || []
    });

    res.status(201).json({
      success: true,
      message: 'Item adicionado ao portfolio',
      data: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao adicionar item ao portfolio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ✏️ Atualizar item do portfolio
export const updatePortfolioItem = async (req, res) => {
  try {
    const { professionalId, itemId } = req.params;
    const updates = req.body;

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

    // Campos que não podem ser atualizados
    delete updates.id;
    delete updates.professional_id;
    delete updates.created_at;

    await portfolioItem.update(updates);

    res.json({
      success: true,
      message: 'Item do portfolio atualizado',
      data: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao atualizar item do portfolio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
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

    await portfolioItem.destroy();

    res.json({
      success: true,
      message: 'Item removido do portfolio'
    });

  } catch (error) {
    console.error('Erro ao remover item do portfolio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};