// src/controllers/authController.js
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// 📝 Registrar novo usuário
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      userType = 'professional', // 'admin', 'professional', 'company'
      phone,
      city,
      state,
      
      // Campos específicos para profissionais
      category_id,
      subcategories,
      description,
      experience,
      education,
      
      // Campos específicos para empresas
      companyName,
      cnpj,
      website,
      businessAreas
    } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Dados obrigatórios',
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Senhas não coincidem'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Senha muito fraca',
        message: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    // Verificar se email já existe
    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado'
      });
    }

    // Criar usuário
    const user = await db.User.create({
      name,
      email,
      password, // Será hasheado pelo hook
      user_type: userType,
      phone,
      city,
      state,
      email_verification_token: crypto.randomBytes(32).toString('hex')
    });

    // Criar perfil específico baseado no tipo de usuário
    if (userType === 'professional') {
      if (!category_id) {
        return res.status(400).json({
          error: 'Categoria é obrigatória para profissionais'
        });
      }

      const professional = await db.Professional.create({
        id: `prof-${Date.now()}`,
        user_id: user.id,
        name,
        email,
        category_id,
        city,
        state,
        description,
        experience,
        education
      });

      // Associar subcategorias se fornecidas
      if (subcategories && subcategories.length > 0) {
        const subcategoryObjects = await db.Subcategory.findAll({
          where: { id: subcategories }
        });
        await professional.setSubcategories(subcategoryObjects);
      }
    }

    if (userType === 'company') {
      if (!companyName) {
        return res.status(400).json({
          error: 'Nome da empresa é obrigatório'
        });
      }

      await db.Company.create({
        user_id: user.id,
        company_name: companyName,
        cnpj,
        website,
        email,
        phone,
        city,
        state,
        business_areas: businessAreas || []
      });
    }

    // Gerar token
    const token = user.generateToken();

    // Remover senha da resposta
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
};

// 🔐 Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário com senha
    const user = await db.User.findOne({ 
      where: { email },
      include: [
        {
          model: db.Professional,
          as: 'professionalProfile',
          required: false
        },
        {
          model: db.Company,
          as: 'companyProfile',
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        error: 'Conta desativada',
        message: 'Entre em contato com o suporte'
      });
    }

    // Verificar senha
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = user.generateToken();

    // Preparar dados do usuário (sem senha)
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.reset_password_token;
    delete userData.reset_password_expires;

    res.json({
      message: 'Login realizado com sucesso',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// 👤 Obter perfil do usuário logado
export const getProfile = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'email_verification_token', 'reset_password_token'] },
      include: [
        {
          model: db.Professional,
          as: 'professionalProfile',
          required: false,
          include: [
            { model: db.Category, as: 'category' },
            { model: db.City, as: 'cityRelation' },
            { model: db.Subcategory, as: 'subcategories' }
          ]
        },
        {
          model: db.Company,
          as: 'companyProfile',
          required: false,
          include: [
            { model: db.City, as: 'cityRelation' }
          ]
        }
      ]
    });

    res.json({
      user
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ✏️ Atualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    // Campos que não podem ser atualizados diretamente
    delete updates.id;
    delete updates.user_type;
    delete updates.email_verified;
    delete updates.created_at;
    delete updates.updated_at;

    // Se está tentando atualizar senha, verificar senha atual
    if (updates.password) {
      if (!updates.currentPassword) {
        return res.status(400).json({
          error: 'Senha atual é obrigatória para alteração'
        });
      }

      const user = await db.User.findByPk(userId);
      const isValidPassword = await user.validatePassword(updates.currentPassword);
      
      if (!isValidPassword) {
        return res.status(400).json({
          error: 'Senha atual incorreta'
        });
      }

      delete updates.currentPassword;
    }

    // Atualizar usuário
    await db.User.update(updates, {
      where: { id: userId }
    });

    // Buscar dados atualizados
    const updatedUser = await db.User.findByPk(userId, {
      attributes: { exclude: ['password', 'email_verification_token'] }
    });

    res.json({
      message: 'Perfil atualizado com sucesso',
      user: updatedUser
    });

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// 🚪 Logout (invalidar token - implementação simples)
export const logout = async (req, res) => {
  try {
    // Em uma implementação completa, você manteria uma blacklist de tokens
    // Por ora, o logout é tratado no frontend removendo o token
    
    res.json({
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
};

// ✅ Verificar se token é válido
export const verifyToken = async (req, res) => {
  try {
    // Se chegou até aqui, o token é válido (passou pelo middleware)
    res.json({
      valid: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        userType: req.user.user_type
      }
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: 'Token inválido'
    });
  }
};