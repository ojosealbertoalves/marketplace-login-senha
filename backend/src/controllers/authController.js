// backend/src/controllers/authController.js - COM CAMPO DOCUMENTO
import db from '../models/index.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Função para validar CPF
const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;
  
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;
  
  return true;
};

// Função para validar CNPJ
const validateCNPJ = (cnpj) => {
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14) return false;
  
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  let digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(0))) return false;
  
  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;
  
  for (let i = length; i >= 1; i--) {
    sum += numbers.charAt(length - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  result = sum % 11 < 2 ? 0 : 11 - sum % 11;
  if (result !== parseInt(digits.charAt(1))) return false;
  
  return true;
};

// 📝 Registrar novo usuário
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      userType = 'professional',
      
      // Campos específicos para profissionais
      cpf,
      category_id,
      subcategories,
      city,
      state,
      description,
      experience,
      education,
      
      // Campos específicos para empresas
      companyName,
      cnpj,
      website,
      phone,
      businessAreas
    } = req.body;

    console.log('🔍 Dados recebidos no backend:', {
      name,
      email,
      userType,
      category_id,
      city,
      state,
      cpf: cpf ? '***FORNECIDO***' : 'NÃO FORNECIDO',
      cnpj: cnpj ? '***FORNECIDO***' : 'NÃO FORNECIDO'
    });

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

    // ✅ VALIDAÇÃO DE DOCUMENTO (CPF/CNPJ)
    let documento = null;
    
    if (userType === 'professional') {
      if (!cpf) {
        return res.status(400).json({
          error: 'CPF é obrigatório para profissionais'
        });
      }
      
      if (!validateCPF(cpf)) {
        return res.status(400).json({
          error: 'CPF inválido'
        });
      }

      documento = cpf.replace(/\D/g, ''); // Salvar apenas números

      if (!category_id) {
        return res.status(400).json({
          error: 'Categoria é obrigatória para profissionais'
        });
      }

      if (!city || !state) {
        return res.status(400).json({
          error: 'Cidade e estado são obrigatórios para profissionais'
        });
      }

      if (!description || !experience || !education) {
        return res.status(400).json({
          error: 'Descrição, experiência e formação são obrigatórios para profissionais'
        });
      }
    }

    if (userType === 'company') {
      if (!companyName) {
        return res.status(400).json({
          error: 'Nome da empresa é obrigatório'
        });
      }

      if (!cnpj) {
        return res.status(400).json({
          error: 'CNPJ é obrigatório para empresas'
        });
      }

      if (!validateCNPJ(cnpj)) {
        return res.status(400).json({
          error: 'CNPJ inválido'
        });
      }

      documento = cnpj.replace(/\D/g, ''); // Salvar apenas números

      if (!phone) {
        return res.status(400).json({
          error: 'Telefone é obrigatório para empresas'
        });
      }
    }

    // ✅ VERIFICAR SE EMAIL OU DOCUMENTO JÁ EXISTEM
    const existingUser = await db.User.findOne({ 
      where: { 
        [db.Sequelize.Op.or]: [
          { email },
          ...(documento ? [{ documento }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({
          error: 'Email já cadastrado'
        });
      }
      if (existingUser.documento === documento) {
        return res.status(409).json({
          error: userType === 'professional' ? 'CPF já cadastrado' : 'CNPJ já cadastrado'
        });
      }
    }

    // ✅ CRIAR USUÁRIO COM DOCUMENTO
    const user = await db.User.create({
      name,
      email,
      password, // Será hasheado pelo hook
      documento, // ← NOVO: Salvar CPF/CNPJ aqui
      user_type: userType,
      phone: userType === 'company' ? phone : null,
      city,
      state,
      email_verification_token: crypto.randomBytes(32).toString('hex')
    });

    console.log('✅ Usuário criado:', user.id);

    // Criar perfil específico baseado no tipo de usuário
    if (userType === 'professional') {
      console.log('🔨 Criando perfil profissional...');
      
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
        education,
        is_active: true
      });

      console.log('✅ Profissional criado:', professional.id);

      // Associar subcategorias se fornecidas
      if (subcategories && subcategories.length > 0) {
        const subcategoryObjects = await db.Subcategory.findAll({
          where: { id: subcategories }
        });
        await professional.setSubcategories(subcategoryObjects);
        console.log('✅ Subcategorias associadas');
      }
    }

    if (userType === 'company') {
      console.log('🏢 Criando perfil de empresa...');
      
      await db.Company.create({
        user_id: user.id,
        company_name: companyName,
        cnpj: documento, // Usar o documento validado
        website,
        email,
        phone,
        city,
        state,
        business_areas: businessAreas || []
      });

      console.log('✅ Empresa criada');
    }

    // Gerar token
    const token = user.generateToken();

    // Remover dados sensíveis da resposta
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.documento; // Não retornar documento por segurança

    console.log('🎉 Registro completado com sucesso!');

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: userData,
      token
    });

  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    
    // Tratar erro de unicidade do Sequelize
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'email') {
        return res.status(409).json({
          error: 'Email já cadastrado'
        });
      }
      if (field === 'documento') {
        return res.status(409).json({
          error: 'CPF/CNPJ já cadastrado'
        });
      }
    }
    
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

    // Preparar dados do usuário (sem senha e documento)
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.reset_password_token;
    delete userData.reset_password_expires;
    delete userData.documento; // Não retornar documento por segurança

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
      attributes: { exclude: ['password', 'email_verification_token', 'reset_password_token', 'documento'] },
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
    delete updates.documento; // Documento não pode ser alterado pelo perfil

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
      attributes: { exclude: ['password', 'email_verification_token', 'documento'] }
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