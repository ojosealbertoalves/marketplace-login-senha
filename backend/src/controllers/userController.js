// backend/src/controllers/userController.js
import sequelize from '../config/db.js';

// Verificar se email existe (PRINCIPAL PARA O FRONTEND)
export const checkUserEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        error: 'Email é obrigatório',
        exists: false 
      });
    }
    
    const [users] = await sequelize.query(`
      SELECT id 
      FROM users 
      WHERE LOWER(email) = LOWER(:email) AND is_active = true
      LIMIT 1
    `, {
      replacements: { email }
    });
    
    const userExists = users.length > 0;
    
    res.json({ 
      exists: userExists,
      message: userExists ? 'Usuário encontrado' : 'Usuário não encontrado'
    });
    
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar usuário',
      exists: false 
    });
  }
};

// Listar todos os usuários
export const getAllUsers = async (req, res) => {
  try {
    const [users] = await sequelize.query(`
      SELECT 
        id, name, email, city, state, 
        created_at as "createdAt", 
        updated_at as "updatedAt"
      FROM users 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);
    
    res.json(users);
  } catch (error) {
    console.error('Erro ao carregar usuários:', error);
    res.status(500).json({ error: 'Erro ao carregar usuários' });
  }
};

// Buscar usuário por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [users] = await sequelize.query(`
      SELECT 
        id, name, email, city, state,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM users 
      WHERE id = :id AND is_active = true
    `, {
      replacements: { id }
    });
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(users[0]);
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
};

// Estatísticas básicas de usuários
export const getUserStats = async (req, res) => {
  try {
    const [[totalUsers]] = await sequelize.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = true'
    );
    
    const [[totalInactive]] = await sequelize.query(
      'SELECT COUNT(*) as count FROM users WHERE is_active = false'
    );
    
    // Registros dos últimos 30 dias
    const [[recentRegistrations]] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE is_active = true 
      AND created_at > NOW() - INTERVAL '30 days'
    `);
    
    // Última data de registro
    const [lastReg] = await sequelize.query(`
      SELECT created_at 
      FROM users 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    // Usuários por cidade
    const [byCity] = await sequelize.query(`
      SELECT 
        COALESCE(city, 'Não informado') as city, 
        COUNT(*) as count
      FROM users
      WHERE is_active = true
      GROUP BY city
    `);
    
    const stats = {
      totalUsers: parseInt(totalUsers.count),
      totalInactive: parseInt(totalInactive.count),
      recentRegistrations: parseInt(recentRegistrations.count),
      lastRegistration: lastReg[0]?.created_at || null,
      usersByCity: byCity.reduce((acc, item) => {
        acc[item.city] = parseInt(item.count);
        return acc;
      }, {})
    };
    
    res.json(stats);
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};