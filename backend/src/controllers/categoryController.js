// backend/src/controllers/categoryController.js
import sequelize from '../config/database.js';

// 📋 Listar todas as categorias
export const getAllCategories = async (req, res) => {
  try {
    const [categories] = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.icon,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'::json
        ) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name, c.slug, c.icon
      ORDER BY c.name
    `);
    
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name.replace(/^[^\w\s]+\s/, ''),
      nameWithIcon: category.name,
      slug: category.slug,
      icon: category.icon,
      subcategories: category.subcategories
    }));
    
    res.json(formattedCategories);
    
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    res.status(500).json({ error: 'Erro ao carregar categorias' });
  }
};

// 🏷️ Buscar categoria por ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [categories] = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.icon,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      WHERE c.id = :id OR c.slug = :id
      GROUP BY c.id, c.name, c.slug, c.icon
    `, {
      replacements: { id }
    });
    
    if (categories.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    
    const category = categories[0];
    const formattedCategory = {
      id: category.id,
      name: category.name.replace(/^[^\w\s]+\s/, ''),
      nameWithIcon: category.name,
      slug: category.slug,
      icon: category.icon,
      subcategories: category.subcategories
    };
    
    res.json(formattedCategory);
    
  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    res.status(500).json({ error: 'Erro ao buscar categoria' });
  }
};

// 🔍 Buscar subcategorias por categoria - ✅ CORRIGIDO PARA USAR O ID
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    console.log('🔍 Buscando subcategorias para category_id:', categoryId);
    
    // ✅ Buscar subcategorias diretamente usando o categoryId
    // O categoryId já vem correto (ex: cat-obras-reformas)
    const [subcategories] = await sequelize.query(`
      SELECT id, name, slug 
      FROM subcategories 
      WHERE category_id = :categoryId
      ORDER BY name
    `, {
      replacements: { categoryId }
    });
    
    console.log(`✅ Encontradas ${subcategories.length} subcategorias para ${categoryId}`);
    
    res.json({
      success: true,
      data: subcategories
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar subcategorias:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao buscar subcategorias',
      message: error.message 
    });
  }
};

// 📊 Estatísticas de categorias
export const getCategoryStats = async (req, res) => {
  try {
    const [[categoryCount]] = await sequelize.query('SELECT COUNT(*) as total FROM categories');
    const [[subcategoryCount]] = await sequelize.query('SELECT COUNT(*) as total FROM subcategories');
    
    const [breakdown] = await sequelize.query(`
      SELECT 
        c.id,
        c.name,
        c.slug,
        COUNT(s.id) as subcategories_count
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name, c.slug
      ORDER BY c.name
    `);
    
    const stats = {
      totalCategories: parseInt(categoryCount.total),
      totalSubcategories: parseInt(subcategoryCount.total),
      categoryBreakdown: breakdown.map(cat => ({
        id: cat.id,
        name: cat.name.replace(/^[^\w\s]+\s/, ''),
        slug: cat.slug,
        subcategoriesCount: parseInt(cat.subcategories_count)
      }))
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

// 🔎 Buscar categorias por nome
export const searchCategories = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Parâmetro de busca é obrigatório' });
    }
    
    const searchTerm = `%${q.toLowerCase()}%`;
    
    const [results] = await sequelize.query(`
      SELECT DISTINCT
        c.id,
        c.name,
        c.slug,
        c.icon,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'name', s.name,
              'slug', s.slug
            ) ORDER BY s.name
          ) FILTER (WHERE s.id IS NOT NULL AND LOWER(s.name) LIKE :searchTerm),
          '[]'::json
        ) as subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      WHERE LOWER(c.name) LIKE :searchTerm
         OR EXISTS (
           SELECT 1 FROM subcategories s2 
           WHERE s2.category_id = c.id
           AND LOWER(s2.name) LIKE :searchTerm
         )
      GROUP BY c.id, c.name, c.slug, c.icon
      ORDER BY c.name
    `, {
      replacements: { searchTerm }
    });
    
    const formattedResults = results.map(category => ({
      id: category.id,
      name: category.name.replace(/^[^\w\s]+\s/, ''),
      nameWithIcon: category.name,
      slug: category.slug,
      icon: category.icon,
      subcategories: category.subcategories
    }));
    
    res.json({
      query: q,
      results: formattedResults,
      total: formattedResults.length
    });
    
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro na busca de categorias' });
  }
};