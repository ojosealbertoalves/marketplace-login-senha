// backend/src/controllers/userController.js - VERSÃO SEQUELIZE
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

// ✅ Verificar se email existe
export const checkUserEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório'
      });
    }

    const [results] = await sequelize.query(
      'SELECT id, email, user_type FROM users WHERE LOWER(email) = LOWER(?)',
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (results) {
      return res.json({
        success: true,
        exists: true,
        user: results
      });
    }

    res.json({
      success: true,
      exists: false
    });
  } catch (error) {
    console.error('❌ Erro ao verificar email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email',
      error: error.message
    });
  }
};

// 📋 Listar todos os usuários
export const getAllUsers = async (req, res) => {
  try {
    const results = await sequelize.query(
      'SELECT id, email, user_type, created_at FROM users ORDER BY created_at DESC',
      { type: sequelize.QueryTypes.SELECT }
    );

    res.json({
      success: true,
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao listar usuários',
      error: error.message
    });
  }
};

// 🔍 Buscar usuário por ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const results = await sequelize.query(
      'SELECT id, email, user_type, professional_id, company_id, created_at FROM users WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: results[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuário',
      error: error.message
    });
  }
};

// ✏️ ATUALIZAR USUÁRIO
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, user_type } = req.body;

    // Verificar se o usuário existe
    const userCheck = await sequelize.query(
      'SELECT * FROM users WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar permissão (só o próprio usuário ou admin pode atualizar)
    if (req.user.id !== id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para atualizar este usuário'
      });
    }

    // Construir query dinâmica
    const updates = [];
    const values = [];

    if (email) {
      // Verificar se o novo email já existe (em outro usuário)
      const emailCheck = await sequelize.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?',
        {
          replacements: [email, id],
          type: sequelize.QueryTypes.SELECT
        }
      );

      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }

      updates.push('email = ?');
      values.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    // user_type só pode ser alterado por admin
    if (user_type && req.user.user_type === 'admin') {
      updates.push('user_type = ?');
      values.push(user_type);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.UPDATE
    });

    // Buscar o usuário atualizado
    const result = await sequelize.query(
      'SELECT id, email, user_type, professional_id, company_id, created_at, updated_at FROM users WHERE id = ?',
      {
        replacements: [id],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: result[0]
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário',
      error: error.message
    });
  }
};

// 📊 Estatísticas de usuários
export const getUserStats = async (req, res) => {
  try {
    const result = await sequelize.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN user_type = 'professional' THEN 1 END) as professionals,
        COUNT(CASE WHEN user_type = 'company' THEN 1 END) as companies,
        COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as last_30_days
      FROM users
    `, { type: sequelize.QueryTypes.SELECT });

    res.json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar estatísticas',
      error: error.message
    });
  }
};