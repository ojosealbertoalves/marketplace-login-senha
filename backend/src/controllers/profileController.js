// backend/src/controllers/profileController.js - COM SUBCATEGORIAS E IMAGENS
import db from '../models/index.js';

// Buscar perfil completo do usuário logado
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.User.findByPk(userId, {
      attributes: { exclude: ['password', 'email_verification_token', 'documento'] },
      include: [
        {
          model: db.Professional,
          as: 'professionalProfile',
          required: false,
          include: [
            { model: db.Category, as: 'category' },
            { model: db.Subcategory, as: 'subcategories' }
          ]
        },
        {
          model: db.Company,
          as: 'companyProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    console.log(`📋 Perfil carregado para usuário: ${user.name}`);

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Atualizar dados básicos do usuário
export const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, city, state } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios'
      });
    }

    await db.User.update(
      { name, email, phone, city, state },
      { where: { id: userId } }
    );

    console.log(`✅ Dados básicos atualizados para usuário: ${userId}`);

    res.json({
      success: true,
      message: 'Dados básicos atualizados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar dados básicos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Atualizar dados profissionais
export const updateProfessionalInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category_id,
      description,
      experience,
      education,
      whatsapp,
      business_address,
      subcategories // ✅ NOVO: suporte a subcategorias
    } = req.body;

    const professional = await db.Professional.findOne({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Perfil profissional não encontrado'
      });
    }

    // Atualizar dados profissionais
    await professional.update({
      category_id,
      description,
      experience,
      education,
      whatsapp,
      business_address
    });

    // ✅ Atualizar subcategorias se fornecidas
    if (subcategories && Array.isArray(subcategories)) {
      const subcategoryObjects = await db.Subcategory.findAll({
        where: { id: subcategories }
      });
      await professional.setSubcategories(subcategoryObjects);
      console.log(`✅ Subcategorias atualizadas: ${subcategories.length} itens`);
    }

    console.log(`✅ Dados profissionais atualizados para: ${professional.id}`);

    res.json({
      success: true,
      message: 'Dados profissionais atualizados com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar dados profissionais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Buscar portfólio do profissional
export const getMyPortfolio = async (req, res) => {
  try {
    const userId = req.user.id;

    const professional = await db.Professional.findOne({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Perfil profissional não encontrado'
      });
    }

    const portfolioItems = await db.PortfolioItem.findAll({
      where: { professional_id: professional.id },
      order: [['created_at', 'DESC']]
    });

    console.log(`📋 Portfólio carregado: ${portfolioItems.length} itens`);

    res.json({
      success: true,
      portfolio: portfolioItems
    });

  } catch (error) {
    console.error('Erro ao buscar portfólio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Adicionar item ao portfólio
export const addPortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, project_type, area, duration, images } = req.body;

    if (!title) {
      return res.status(400).json({
        error: 'Título é obrigatório'
      });
    }

    const professional = await db.Professional.findOne({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Perfil profissional não encontrado'
      });
    }

    // ✅ Parse images se vier como string
    let imagesList = images;
    if (typeof images === 'string') {
      try {
        imagesList = JSON.parse(images);
      } catch (e) {
        imagesList = [images];
      }
    }

    const portfolioItem = await db.PortfolioItem.create({
      id: `portfolio-${Date.now()}`,
      professional_id: professional.id,
      title,
      description,
      project_type,
      area,
      duration,
      images: imagesList || [],
      completed_at: new Date()
    });

    console.log(`✅ Item adicionado ao portfólio: ${portfolioItem.id}`);

    res.status(201).json({
      success: true,
      message: 'Item adicionado ao portfólio',
      item: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao adicionar item ao portfólio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Atualizar item do portfólio
export const updatePortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { title, description, project_type, area, duration, images } = req.body;

    const professional = await db.Professional.findOne({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Perfil profissional não encontrado'
      });
    }

    const portfolioItem = await db.PortfolioItem.findOne({
      where: { 
        id: itemId,
        professional_id: professional.id 
      }
    });

    if (!portfolioItem) {
      return res.status(404).json({
        error: 'Item do portfólio não encontrado'
      });
    }

    await portfolioItem.update({
      title,
      description,
      project_type,
      area,
      duration,
      images
    });

    console.log(`✅ Item do portfólio atualizado: ${itemId}`);

    res.json({
      success: true,
      message: 'Item do portfólio atualizado',
      item: portfolioItem
    });

  } catch (error) {
    console.error('Erro ao atualizar item do portfólio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// Remover item do portfólio
export const deletePortfolioItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const professional = await db.Professional.findOne({
      where: { user_id: userId }
    });

    if (!professional) {
      return res.status(404).json({
        error: 'Perfil profissional não encontrado'
      });
    }

    const portfolioItem = await db.PortfolioItem.findOne({
      where: { 
        id: itemId,
        professional_id: professional.id 
      }
    });

    if (!portfolioItem) {
      return res.status(404).json({
        error: 'Item do portfólio não encontrado'
      });
    }

    await portfolioItem.destroy();

    console.log(`🗑️ Item do portfólio removido: ${itemId}`);

    res.json({
      success: true,
      message: 'Item removido do portfólio'
    });

  } catch (error) {
    console.error('Erro ao remover item do portfólio:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};