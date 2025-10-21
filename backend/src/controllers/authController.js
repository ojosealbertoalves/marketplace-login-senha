// backend/src/controllers/authController.js - REFATORADO E CLEAN
import db from '../models/index.js';
import crypto from 'crypto';

// ========================================
// 🔧 FUNÇÕES AUXILIARES
// ========================================

const validateDocument = (doc, type) => {
  const numbers = doc.replace(/[^\d]+/g, '');
  
  if (type === 'cpf') {
    if (numbers.length !== 11 || /^(\d)\1{10}$/.test(numbers)) return false;
    
    for (let j = 0; j < 2; j++) {
      let sum = 0;
      const length = 9 + j;
      for (let i = 0; i < length; i++) {
        sum += parseInt(numbers.charAt(i)) * ((length + 1) - i);
      }
      const remainder = (sum * 10) % 11;
      const digit = remainder === 10 || remainder === 11 ? 0 : remainder;
      if (digit !== parseInt(numbers.charAt(length))) return false;
    }
    return true;
  }
  
  if (type === 'cnpj') {
    if (numbers.length !== 14 || /^(\d)\1{13}$/.test(numbers)) return false;
    
    for (let j = 0; j < 2; j++) {
      let sum = 0;
      const length = 12 + j;
      let pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
      }
      const result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(numbers.charAt(length))) return false;
    }
    return true;
  }
  
  return false;
};

const processUserData = (userType, data) => {
  const { cpf, cnpj, phone, clientPhone, city, clientCity, state, clientState, documento } = data;
  
  const config = {
    professional: {
      documento: cpf?.replace(/\D/g, ''),
      phone: null,
      city,
      state
    },
    company: {
      documento: cnpj?.replace(/\D/g, ''),
      phone: phone?.replace(/\D/g, ''),
      city,
      state
    },
    client: {
      documento: documento?.replace(/\D/g, '') || null,
      phone: clientPhone?.replace(/\D/g, '') || null,
      city: clientCity || null,
      state: clientState?.toUpperCase() || null
    }
  };
  
  return config[userType] || config.client;
};

const validateUserType = (userType, data) => {
  const validators = {
    professional: () => {
      const { cpf, category_id, city, state, description, experience, education } = data;
      
      if (!cpf) return { error: 'CPF é obrigatório para profissionais' };
      if (!validateDocument(cpf, 'cpf')) return { error: 'CPF inválido' };
      if (!category_id) return { error: 'Categoria é obrigatória para profissionais' };
      if (!city || !state) return { error: 'Cidade e estado são obrigatórios para profissionais' };
      if (!description || !experience || !education) {
        return { error: 'Descrição, experiência e formação são obrigatórios para profissionais' };
      }
      return null;
    },
    
    company: () => {
      const { companyName, cnpj, phone } = data;
      
      if (!companyName) return { error: 'Nome da empresa é obrigatório' };
      if (!cnpj) return { error: 'CNPJ é obrigatório para empresas' };
      if (!validateDocument(cnpj, 'cnpj')) return { error: 'CNPJ inválido' };
      if (!phone) return { error: 'Telefone é obrigatório para empresas' };
      return null;
    },
    
    client: () => {
      const { documento, clientPhone, clientCity, clientState } = data;
      
      console.log('👤 Validando cliente final');
      if (!documento) return { error: 'CPF é obrigatório para clientes' };
      if (!validateDocument(documento, 'cpf')) return { error: 'CPF inválido' };
      if (!clientPhone) return { error: 'Telefone é obrigatório para clientes' };
      if (!clientCity) return { error: 'Cidade é obrigatória para clientes' };
      if (!clientState) return { error: 'Estado é obrigatório para clientes' };
      return null;
    }
  };
  
  return validators[userType] ? validators[userType]() : null;
};

const createUserProfile = async (userType, userId, data) => {
  const profiles = {
    professional: async () => {
      const { name, email, category_id, city, state, description, experience, education, subcategories } = data;
      
      console.log('🔨 Criando perfil profissional...');
      const professional = await db.Professional.create({
        id: `prof-${Date.now()}`,
        user_id: userId,
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
      
      if (subcategories?.length > 0) {
        const subcategoryObjects = await db.Subcategory.findAll({ where: { id: subcategories } });
        await professional.setSubcategories(subcategoryObjects);
        console.log('✅ Subcategorias associadas');
      }
      
      console.log('✅ Profissional criado:', professional.id);
    },
    
    company: async () => {
      const { companyName, email, website, businessAreas } = data;
      const { documento, phone, city, state } = processUserData('company', data);
      
      console.log('🏢 Criando perfil de empresa...');
      await db.Company.create({
        user_id: userId,
        company_name: companyName,
        cnpj: documento,
        website,
        email,
        phone,
        city,
        state,
        business_areas: businessAreas || []
      });
      console.log('✅ Empresa criada');
    },
    
    client: async () => {
      console.log('👤 Cliente final criado - sem perfil adicional');
      const { documento, phone, city, state } = processUserData('client', data);
      console.log('📋 Dados salvos:', {
        documento: documento ? 'SIM' : 'NÃO',
        phone: phone ? 'SIM' : 'NÃO',
        city: city || 'NÃO',
        state: state || 'NÃO'
      });
    }
  };
  
  return profiles[userType] ? await profiles[userType]() : null;
};

// ========================================
// 📝 REGISTRO
// ========================================

export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, userType = 'professional' } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Dados obrigatórios', message: 'Nome, email e senha são obrigatórios' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Senhas não coincidem' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha muito fraca', message: 'A senha deve ter pelo menos 6 caracteres' });
    }

    // Validações específicas por tipo
    const validationError = validateUserType(userType, req.body);
    if (validationError) {
      return res.status(400).json(validationError);
    }

    // Processar dados do usuário
    const { documento, phone, city, state } = processUserData(userType, req.body);

    // Verificar duplicatas
    const whereConditions = [{ email }];
    if (documento) whereConditions.push({ documento });

    const existingUser = await db.User.findOne({ where: { [db.Sequelize.Op.or]: whereConditions } });
    
    if (existingUser) {
      if (existingUser.email === email) return res.status(409).json({ error: 'Email já cadastrado' });
      if (existingUser.documento === documento) {
        const errorMsg = userType === 'professional' ? 'CPF já cadastrado' : 
                        userType === 'company' ? 'CNPJ já cadastrado' : 'Documento já cadastrado';
        return res.status(409).json({ error: errorMsg });
      }
    }

    // Criar usuário
    const user = await db.User.create({
      name,
      email,
      password,
      documento,
      user_type: userType,
      phone,
      city,
      state,
      email_verification_token: crypto.randomBytes(32).toString('hex')
    });

    console.log('✅ Usuário criado:', user.id);

    // Criar perfil específico
    await createUserProfile(userType, user.id, req.body);

    // Resposta
    const token = user.generateToken();
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.documento;

    console.log('🎉 Registro completado com sucesso!');
    res.status(201).json({ message: 'Usuário criado com sucesso', user: userData, token });

  } catch (error) {
    console.error('❌ Erro ao registrar usuário:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      const field = error.errors[0]?.path;
      if (field === 'email') return res.status(409).json({ error: 'Email já cadastrado' });
      if (field === 'documento') return res.status(409).json({ error: 'CPF/CNPJ/Documento já cadastrado' });
    }
    
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

// ========================================
// 🔐 DEMAIS FUNÇÕES
// ========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await db.User.findOne({ 
      where: { email },
      include: [
        { model: db.Professional, as: 'professionalProfile', required: false },
        { model: db.Company, as: 'companyProfile', required: false }
      ]
    });

    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });
    if (!user.is_active) return res.status(401).json({ error: 'Conta desativada', message: 'Entre em contato com o suporte' });

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = user.generateToken();
    const userData = user.toJSON();
    delete userData.password;
    delete userData.email_verification_token;
    delete userData.reset_password_token;
    delete userData.reset_password_expires;
    delete userData.documento;

    res.json({ message: 'Login realizado com sucesso', user: userData, token });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

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
          include: [{ model: db.City, as: 'cityRelation' }]
        }
      ]
    });

    res.json({ user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    delete updates.id;
    delete updates.user_type;
    delete updates.email_verified;
    delete updates.created_at;
    delete updates.updated_at;
    delete updates.documento;

    if (updates.password) {
      if (!updates.currentPassword) {
        return res.status(400).json({ error: 'Senha atual é obrigatória para alteração' });
      }

      const user = await db.User.findByPk(userId);
      const isValidPassword = await user.validatePassword(updates.currentPassword);
      
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Senha atual incorreta' });
      }

      delete updates.currentPassword;
    }

    await db.User.update(updates, { where: { id: userId } });
    const updatedUser = await db.User.findByPk(userId, {
      attributes: { exclude: ['password', 'email_verification_token', 'documento'] }
    });

    res.json({ message: 'Perfil atualizado com sucesso', user: updatedUser });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const logout = async (req, res) => {
  try {
    res.json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    res.json({
      valid: true,
      user: { id: req.user.id, name: req.user.name, email: req.user.email, userType: req.user.user_type }
    });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
};

// ========================================
// 🔑 RECUPERAÇÃO DE SENHA
// ========================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

    const user = await db.User.findOne({ where: { email } });
    if (!user) {
      return res.json({ success: true, message: 'Se o email existir, você receberá o código de recuperação' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    await user.update({ reset_password_token: resetCode, reset_password_expires: expiresAt });

    console.log(`🔑 Código de recuperação gerado para ${email}: ${resetCode}`);
    res.json({ success: true, message: 'Código de recuperação gerado', resetCode, email });
  } catch (error) {
    console.error('Erro ao gerar código de recuperação:', error);
    res.status(500).json({ error: 'Erro ao processar solicitação', details: error.message });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Email e código são obrigatórios' });

    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.reset_password_token !== code) return res.status(400).json({ error: 'Código inválido' });
    if (new Date() > new Date(user.reset_password_expires)) {
      return res.status(400).json({ error: 'Código expirado. Solicite um novo código.' });
    }

    res.json({ success: true, message: 'Código válido' });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    res.status(500).json({ error: 'Erro ao verificar código', details: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres' });
    }

    const user = await db.User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.reset_password_token !== code) return res.status(400).json({ error: 'Código inválido' });
    if (new Date() > new Date(user.reset_password_expires)) {
      return res.status(400).json({ error: 'Código expirado. Solicite um novo código.' });
    }

    await user.update({ password: newPassword, reset_password_token: null, reset_password_expires: null });

    console.log(`✅ Senha resetada com sucesso para: ${email}`);
    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(500).json({ error: 'Erro ao resetar senha', details: error.message });
  }
};