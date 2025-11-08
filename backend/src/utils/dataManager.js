// src/utils/dataManager.js
import sequelize from '../config/database.js';

const dataManager = {
  async getStats() {
    try {
      const [categories] = await sequelize.query(
        'SELECT COUNT(*) as count FROM categories',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const [subcategories] = await sequelize.query(
        'SELECT COUNT(*) as count FROM subcategories',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const [cities] = await sequelize.query(
        'SELECT COUNT(*) as count FROM cities WHERE active = true',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const [professionals] = await sequelize.query(
        'SELECT COUNT(*) as count FROM professionals WHERE is_active = true',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      const [users] = await sequelize.query(
        'SELECT COUNT(*) as count FROM users WHERE is_active = true',
        { type: sequelize.QueryTypes.SELECT }
      );
      
      return {
        categories: parseInt(categories.count),
        subcategories: parseInt(subcategories.count),
        cities: parseInt(cities.count),
        professionals: parseInt(professionals.count),
        users: parseInt(users.count)
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        categories: 0,
        subcategories: 0,
        cities: 0,
        professionals: 0,
        users: 0
      };
    }
  }
};

export default dataManager;