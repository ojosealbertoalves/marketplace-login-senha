// backend/src/controllers/professionalController.js
import sequelize from '../config/db.js';

// 📋 Listar todos os profissionais
export const getAllProfessionals = async (req, res) => {
  try {
    const [professionals] = await sequelize.query(`
      SELECT 
        p.id,
        p.name,
        p.email,
        p.profile_photo as photo,
        p.city,
        p.state,
        p.education,
        p.experience,
        p.tags,
        p.social_media,
        p.whatsapp,
        p.business_address,
        p.google_maps_link,
        p.created_at as "registrationDate",
        c.name as category,
        c.id as category_id,
        ci.name as city_name,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as subcategories,
        COUNT(DISTINCT pi.id) as "totalProjects"
      FROM professionals p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ci ON p.city_id = ci.id
      LEFT JOIN professional_subcategories ps ON p.id = ps.professional_id
      LEFT JOIN subcategories s ON ps.subcategory_id = s.id
      LEFT JOIN portfolio_items pi ON p.id = pi.professional_id
      WHERE p.is_active = true
      GROUP BY p.id, c.name, c.id, ci.name
      ORDER BY p.created_at DESC
    `);

    // Formatar dados para manter compatibilidade
    const formattedProfessionals = professionals.map(prof => ({
      id: prof.id,
      name: prof.name,
      email: prof.email,
      photo: prof.photo,
      category: prof.category || 'Não informado',
      subcategory: prof.subcategories[0]?.name || 'Geral',
      subcategories: prof.subcategories,
      city: prof.city,
      state: prof.state,
      registrationDate: prof.registrationDate,
      tags: prof.tags || [],
      education: prof.education,
      experience: prof.experience,
      whatsapp: prof.whatsapp,
      businessAddress: prof.business_address,
      googleMapsLink: prof.google_maps_link,
      socialLinks: prof.social_media || {},
      totalProjects: parseInt(prof.totalProjects)
    }));

    res.json(formattedProfessionals);
  } catch (error) {
    console.error('Erro ao carregar profissionais:', error);
    res.status(500).json({ error: 'Erro ao carregar profissionais' });
  }
};

// 👤 Buscar profissional por ID
export const getProfessionalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar dados básicos do profissional
    const [professionals] = await sequelize.query(`
      SELECT 
        p.*,
        c.name as category_name,
        ci.name as city_name
      FROM professionals p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN cities ci ON p.city_id = ci.id
      WHERE p.id = :id AND p.is_active = true
    `, {
      replacements: { id }
    });

    if (professionals.length === 0) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Buscar subcategorias
    const [subcategories] = await sequelize.query(`
      SELECT s.id, s.name, s.slug
      FROM subcategories s
      JOIN professional_subcategories ps ON s.id = ps.subcategory_id
      WHERE ps.professional_id = :id
      ORDER BY s.name
    `, {
      replacements: { id }
    });

    // Buscar portfolio
    const [portfolio] = await sequelize.query(`
      SELECT 
        id,
        title,
        description,
        images,
        completed_at as "completedAt",
        project_type as "projectType",
        area,
        duration,
        tags
      FROM portfolio_items
      WHERE professional_id = :id
      ORDER BY completed_at DESC
    `, {
      replacements: { id }
    });

    // Buscar indicações recebidas - CORRIGIDO
    const [indications] = await sequelize.query(`
      SELECT 
        i.id,
        i.from_professional_id as "professionalId",
        p.name as "professionalName",
        p.email,
        i.created_at as date
      FROM indications i
      JOIN professionals p ON i.from_professional_id = p.id
      WHERE i.to_professional_id = :id
    `, {
      replacements: { id }
    });

    const professional = professionals[0];
    
    const formattedProfessional = {
      id: professional.id,
      name: professional.name,
      email: professional.email,
      photo: professional.profile_photo,
      category: professional.category_name || 'Não informado',
      subcategory: subcategories[0]?.name || 'Geral',
      subcategories,
      city: professional.city,
      state: professional.state,
      registrationDate: professional.created_at,
      tags: professional.tags || [],
      education: professional.education,
      experience: professional.experience,
      whatsapp: professional.whatsapp,
      businessAddress: professional.business_address,
      googleMapsLink: professional.google_maps_link,
      socialLinks: professional.social_media || {},
      portfolio: portfolio || [],
      indicationsReceived: indications || [],
      referredBy: indications[0]?.professionalName || null
    };

    res.json(formattedProfessional);
  } catch (error) {
    console.error('Erro ao buscar profissional:', error);
    res.status(500).json({ error: 'Erro ao buscar profissional' });
  }
};

// 🔍 Buscar profissionais por filtros
export const searchProfessionals = async (req, res) => {
  try {
    const { city, state, category, subcategory, search } = req.query;
    
    let whereConditions = ['p.is_active = true'];
    const replacements = {};
    
    if (city) {
      whereConditions.push('LOWER(p.city) LIKE LOWER(:city)');
      replacements.city = `%${city}%`;
    }
    
    if (state) {
      whereConditions.push('LOWER(p.state) = LOWER(:state)');
      replacements.state = state;
    }
    
    if (category) {
      whereConditions.push('LOWER(c.name) LIKE LOWER(:category)');
      replacements.category = `%${category}%`;
    }
    
    if (search) {
      whereConditions.push(`(
        LOWER(p.name) LIKE LOWER(:search) 
        OR EXISTS (
          SELECT 1 FROM json_array_elements_text(p.tags::json) tag 
          WHERE LOWER(tag) LIKE LOWER(:search)
        )
      )`);
      replacements.search = `%${search}%`;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    let query = `
      SELECT 
        p.id,
        p.name,
        p.profile_photo as photo,
        p.city,
        p.state,
        p.tags,
        p.whatsapp,
        p.created_at as "registrationDate",
        c.name as category,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', s.id,
              'name', s.name
            )
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as subcategories,
        COUNT(DISTINCT pi.id) as "totalProjects"
      FROM professionals p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN professional_subcategories ps ON p.id = ps.professional_id
      LEFT JOIN subcategories s ON ps.subcategory_id = s.id
      LEFT JOIN portfolio_items pi ON p.id = pi.professional_id
      WHERE ${whereClause}
    `;
    
    // Adicionar filtro de subcategoria se necessário
    if (subcategory) {
      query += ` AND EXISTS (
        SELECT 1 FROM professional_subcategories ps2
        JOIN subcategories s2 ON ps2.subcategory_id = s2.id
        WHERE ps2.professional_id = p.id
        AND LOWER(s2.name) LIKE LOWER(:subcategory)
      )`;
      replacements.subcategory = `%${subcategory}%`;
    }
    
    query += ` GROUP BY p.id, c.name ORDER BY p.created_at DESC`;
    
    const [professionals] = await sequelize.query(query, { replacements });
    
    const formattedResults = professionals.map(prof => ({
      id: prof.id,
      name: prof.name,
      photo: prof.photo,
      category: prof.category || 'Não informado',
      subcategories: prof.subcategories || [],
      subcategory: prof.subcategories[0]?.name || 'Geral',
      city: prof.city,
      state: prof.state,
      registrationDate: prof.registrationDate,
      tags: prof.tags || [],
      whatsapp: prof.whatsapp,
      totalProjects: parseInt(prof.totalProjects)
    }));
    
    res.json(formattedResults);
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro na busca de profissionais' });
  }
};

// 📊 Estatísticas de profissionais
export const getProfessionalStats = async (req, res) => {
  try {
    const [[total]] = await sequelize.query(
      'SELECT COUNT(*) as count FROM professionals WHERE is_active = true'
    );
    
    const [[totalInactive]] = await sequelize.query(
      'SELECT COUNT(*) as count FROM professionals WHERE is_active = false'
    );
    
    const [byCity] = await sequelize.query(`
      SELECT city, COUNT(*) as count 
      FROM professionals 
      WHERE is_active = true 
      GROUP BY city
    `);
    
    const [byCategory] = await sequelize.query(`
      SELECT c.name as category, COUNT(p.id) as count
      FROM professionals p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      GROUP BY c.name
    `);
    
    const [[withPortfolio]] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM professionals p
      JOIN portfolio_items pi ON p.id = pi.professional_id
      WHERE p.is_active = true
    `);
    
    const [[withIndications]] = await sequelize.query(`
      SELECT COUNT(DISTINCT p.id) as count
      FROM professionals p
      JOIN indications i ON p.id = i.to_professional_id
      WHERE p.is_active = true
    `);
    
    const [[totalProjects]] = await sequelize.query(
      'SELECT COUNT(*) as count FROM portfolio_items'
    );
    
    const avgProjects = parseInt(total.count) > 0 
      ? (parseInt(totalProjects.count) / parseInt(total.count)).toFixed(2)
      : 0;
    
    const stats = {
      total: parseInt(total.count),
      totalInactive: parseInt(totalInactive.count),
      byCity: byCity.reduce((acc, item) => {
        acc[item.city] = parseInt(item.count);
        return acc;
      }, {}),
      byCategory: byCategory.reduce((acc, item) => {
        acc[item.category] = parseInt(item.count);
        return acc;
      }, {}),
      withPortfolio: parseInt(withPortfolio.count),
      withIndications: parseInt(withIndications.count),
      totalProjects: parseInt(totalProjects.count),
      averageProjectsPerProfessional: avgProjects
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};

// As funções de adicionar/atualizar/remover portfolio continuam usando o banco
// mas vou deixar para implementar depois se necessário

export const addProjectToPortfolio = async (req, res) => {
  // Implementar depois se necessário
  res.status(501).json({ message: 'Função será implementada em breve' });
};

export const updateProjectInPortfolio = async (req, res) => {
  // Implementar depois se necessário
  res.status(501).json({ message: 'Função será implementada em breve' });
};

export const removeProjectFromPortfolio = async (req, res) => {
  // Implementar depois se necessário
  res.status(501).json({ message: 'Função será implementada em breve' });
};