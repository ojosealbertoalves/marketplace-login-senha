// src/controllers/adminController.js
import db from '../models/index.js';

// ========================
// 📂 CATEGORIAS
// ========================

// Listar todas as categorias
export const getCategories = async (req, res) => {
  try {
    const categories = await db.Category.findAll({
      include: [{
        model: db.Subcategory,
        as: 'subcategories'
      }],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Criar nova categoria
export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, subcategories } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'Nome e slug são obrigatórios'
      });
    }

    // Verificar se slug já existe
    const existingCategory = await db.Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(409).json({
        error: 'Slug já existe'
      });
    }

    // Criar categoria
    const category = await db.Category.create({
      id: `cat-${slug}`,
      name,
      slug,
      icon: icon || '📁'
    });

    // Criar subcategorias se fornecidas
    if (subcategories && subcategories.length > 0) {
      const subcategoryPromises = subcategories.map(sub => 
        db.Subcategory.create({
          id: `subcat-${sub.slug}`,
          name: sub.name,
          slug: sub.slug,
          category_id: category.id
        })
      );
      await Promise.all(subcategoryPromises);
    }

    // Buscar categoria com subcategorias
    const categoryWithSubs = await db.Category.findByPk(category.id, {
      include: [{
        model: db.Subcategory,
        as: 'subcategories'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Categoria criada com sucesso',
      data: categoryWithSubs
    });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar categoria
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon } = req.body;

    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    // Se slug mudou, verificar se não existe
    if (slug && slug !== category.slug) {
      const existingSlug = await db.Category.findOne({ 
        where: { slug, id: { [db.Sequelize.Op.ne]: id } } 
      });
      if (existingSlug) {
        return res.status(409).json({
          error: 'Slug já existe'
        });
      }
    }

    await category.update({
      name: name || category.name,
      slug: slug || category.slug,
      icon: icon || category.icon
    });

    const updatedCategory = await db.Category.findByPk(id, {
      include: [{
        model: db.Subcategory,
        as: 'subcategories'
      }]
    });

    res.json({
      success: true,
      message: 'Categoria atualizada com sucesso',
      data: updatedCategory
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar categoria
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se categoria existe
    const category = await db.Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se tem profissionais usando esta categoria
    const professionalsCount = await db.Professional.count({
      where: { category_id: id }
    });

    if (professionalsCount > 0) {
      return res.status(409).json({
        error: 'Não é possível deletar categoria com profissionais associados',
        message: `${professionalsCount} profissional(is) usa(m) esta categoria`
      });
    }

    // Deletar subcategorias primeiro
    await db.Subcategory.destroy({
      where: { category_id: id }
    });

    // Deletar categoria
    await category.destroy();

    res.json({
      success: true,
      message: 'Categoria deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ========================
// 📋 SUBCATEGORIAS
// ========================

// Criar subcategoria
export const createSubcategory = async (req, res) => {
  try {
    const { name, slug, category_id } = req.body;

    if (!name || !slug || !category_id) {
      return res.status(400).json({
        error: 'Nome, slug e categoria são obrigatórios'
      });
    }

    // Verificar se categoria existe
    const category = await db.Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({
        error: 'Categoria não encontrada'
      });
    }

    // Verificar se slug já existe
    const existingSubcategory = await db.Subcategory.findOne({ where: { slug } });
    if (existingSubcategory) {
      return res.status(409).json({
        error: 'Slug já existe'
      });
    }

    const subcategory = await db.Subcategory.create({
      id: `subcat-${slug}`,
      name,
      slug,
      category_id
    });

    res.status(201).json({
      success: true,
      message: 'Subcategoria criada com sucesso',
      data: subcategory
    });

  } catch (error) {
    console.error('Erro ao criar subcategoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar subcategoria
export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const subcategory = await db.Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({
        error: 'Subcategoria não encontrada'
      });
    }

    await subcategory.update({
      name: name || subcategory.name,
      slug: slug || subcategory.slug
    });

    res.json({
      success: true,
      message: 'Subcategoria atualizada com sucesso',
      data: subcategory
    });

  } catch (error) {
    console.error('Erro ao atualizar subcategoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar subcategoria
export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await db.Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({
        error: 'Subcategoria não encontrada'
      });
    }

    await subcategory.destroy();

    res.json({
      success: true,
      message: 'Subcategoria deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar subcategoria:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ========================
// 🏙️ CIDADES
// ========================

// Listar cidades
export const getCities = async (req, res) => {
  try {
    const { state, search } = req.query;
    const where = {};

    if (state) {
      where.state = state;
    }

    if (search) {
      where.name = {
        [db.Sequelize.Op.iLike]: `%${search}%`
      };
    }

    const cities = await db.City.findAll({
      where,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: cities
    });

  } catch (error) {
    console.error('Erro ao buscar cidades:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Criar cidade
export const createCity = async (req, res) => {
  try {
    const { name, state, slug } = req.body;

    if (!name || !state) {
      return res.status(400).json({
        error: 'Nome e estado são obrigatórios'
      });
    }

    const citySlug = slug || name.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const city = await db.City.create({
      id: `city-${citySlug}-${state}`,
      name,
      state: state.toUpperCase(),
      slug: citySlug
    });

    res.status(201).json({
      success: true,
      message: 'Cidade criada com sucesso',
      data: city
    });

  } catch (error) {
    console.error('Erro ao criar cidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar cidade
export const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state } = req.body;

    const city = await db.City.findByPk(id);
    if (!city) {
      return res.status(404).json({
        error: 'Cidade não encontrada'
      });
    }

    await city.update({
      name: name || city.name,
      state: state ? state.toUpperCase() : city.state
    });

    res.json({
      success: true,
      message: 'Cidade atualizada com sucesso',
      data: city
    });

  } catch (error) {
    console.error('Erro ao atualizar cidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar cidade
export const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const city = await db.City.findByPk(id);
    if (!city) {
      return res.status(404).json({
        error: 'Cidade não encontrada'
      });
    }

    // Verificar se tem profissionais nesta cidade
    const professionalsCount = await db.Professional.count({
      where: { city_id: id }
    });

    if (professionalsCount > 0) {
      return res.status(409).json({
        error: 'Não é possível deletar cidade com profissionais associados',
        message: `${professionalsCount} profissional(is) está(ão) nesta cidade`
      });
    }

    await city.destroy();

    res.json({
      success: true,
      message: 'Cidade deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cidade:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ========================
// 👥 USUÁRIOS
// ========================

// Listar todos os usuários
export const getUsers = async (req, res) => {
  try {
    const { userType, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (userType) {
      where.user_type = userType;
    }

    if (search) {
      where[db.Sequelize.Op.or] = [
        { name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { email: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await db.User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'email_verification_token', 'reset_password_token'] },
      include: [
        {
          model: db.Professional,
          as: 'professionalProfile',
          required: false,
          include: [
            { model: db.Category, as: 'category' }
          ]
        },
        {
          model: db.Company,
          as: 'companyProfile',
          required: false
        }
      ],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar usuário
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    // Não permitir deletar admin
    if (user.user_type === 'admin') {
      return res.status(403).json({
        error: 'Não é possível deletar usuários administradores'
      });
    }

    // Deletar perfis associados
    if (user.user_type === 'professional') {
      await db.Professional.destroy({ where: { user_id: id } });
    } else if (user.user_type === 'company') {
      await db.Company.destroy({ where: { user_id: id } });
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// Ativar/Desativar usuário
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        error: 'Usuário não encontrado'
      });
    }

    await user.update({
      is_active: !user.is_active
    });

    res.json({
      success: true,
      message: `Usuário ${user.is_active ? 'ativado' : 'desativado'} com sucesso`,
      data: { id: user.id, is_active: user.is_active }
    });

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ========================
// 📊 ESTATÍSTICAS
// ========================

export const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProfessionals,
      totalCompanies,
      totalCategories,
      totalCities,
      recentUsers
    ] = await Promise.all([
      db.User.count(),
      db.User.count({ where: { user_type: 'professional' } }),
      db.User.count({ where: { user_type: 'company' } }),
      db.Category.count(),
      db.City.count(),
      db.User.count({
        where: {
          created_at: {
            [db.Sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
          }
        }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProfessionals,
        totalCompanies,
        totalCategories,
        totalCities,
        recentUsers
      }
    });

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};