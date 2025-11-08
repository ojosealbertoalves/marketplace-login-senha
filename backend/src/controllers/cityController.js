// backend/src/controllers/cityController.js
import sequelize from '../config/database.js';

// 📍 Listar todas as cidades
export const getAllCities = async (req, res) => {
  try {
    const [cities] = await sequelize.query(`
      SELECT id, name, state, state_name, slug, active
      FROM cities
      WHERE active = true
      ORDER BY state, name
    `);
    
    res.json(cities);
  } catch (error) {
    console.error('Erro ao carregar cidades:', error);
    res.status(500).json({ error: 'Erro ao carregar cidades' });
  }
};

// 📍 Buscar cidades por estado
export const getCitiesByState = async (req, res) => {
  try {
    const { state } = req.params;
    
    const [cities] = await sequelize.query(`
      SELECT id, name, state, state_name, slug, active
      FROM cities
      WHERE LOWER(state) = LOWER(:state) AND active = true
      ORDER BY name
    `, {
      replacements: { state }
    });
    
    res.json(cities);
  } catch (error) {
    console.error('Erro ao carregar cidades por estado:', error);
    res.status(500).json({ error: 'Erro ao carregar cidades por estado' });
  }
};

// 📍 Listar todos os estados únicos
export const getStates = async (req, res) => {
  try {
    const [states] = await sequelize.query(`
      SELECT 
        state,
        state_name,
        json_agg(
          json_build_object(
            'id', id,
            'name', name,
            'slug', slug
          ) ORDER BY name
        ) as cities
      FROM cities
      WHERE active = true
      GROUP BY state, state_name
      ORDER BY state_name
    `);
    
    res.json(states);
  } catch (error) {
    console.error('Erro ao carregar estados:', error);
    res.status(500).json({ error: 'Erro ao carregar estados' });
  }
};