// backend/src/controllers/authController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

const { User, Professional, Company } = db;

export const register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      confirmPassword,
      userType,
      cpf,
      cnpj,
      documento,
      category_id,
      city,
      state,
      description,
      experience,
      education,
      phone,
      companyName,
      clientPhone,
      clientCity,
      clientState
    } = req.body;

    console.log('📝 Dados recebidos:', { name, email, userType });

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'As senhas não coincidem'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    if (userType === 'professional') {
      if (!cpf || !category_id || !city || !state || !description || !experience || !education) {
        return res.status(400).json({
          success: false,
          error: 'Preencha todos os campos obrigatórios do profissional'
        });
      }
    }

    if (userType === 'company') {
      if (!companyName || !cnpj || !phone) {
        return res.status(400).json({
          success: false,
          error: 'Nome da empresa, CNPJ e telefone são obrigatórios'
        });
      }
    }

    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Este email já está cadastrado'
      });
    }

    const userData = {
      name: companyName || name,
      email: email.toLowerCase().trim(),
      password: password,
      documento: cpf || cnpj || documento || null,
      user_type: userType || 'client',
      phone: phone || clientPhone || null,
      city: city || clientCity || null,
      state: state || clientState || null,
      description: description || null,
      experience: experience || null,
      education: education || null,
      is_active: true,
      email_verified: false
    };

    console.log('💾 Criando usuário:', { name: userData.name, email: userData.email, type: userData.user_type });

    const newUser = await User.create(userData);

    console.log('✅ Usuário criado:', { id: newUser.id, type: newUser.user_type });

    if (userType === 'professional' && category_id) {
      await Professional.create({
        id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        category_id,
        city,
        state,
        description,
        experience,
        education,
        phone: phone || null,
        is_active: true
      });
      console.log('✅ Perfil profissional criado');
    }

    if (userType === 'company') {
      await Company.create({
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        user_id: newUser.id,
        company_name: companyName,
        cnpj: cnpj || null,
        phone: phone || null,
        email: newUser.email,
        description: description || null,
        city_id: null,
        state: clientState || null,
        is_active: true
      });
      console.log('✅ Perfil de empresa criado');
    }

    const token = newUser.generateToken();
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso!',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('💥 Erro no registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const user = await User.findOne({ 
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Sua conta está desativada'
      });
    }

    const isValidPassword = await user.validatePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    const token = user.generateToken();
    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.json({
      success: true,
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('💥 Erro no login:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (user.user_type === 'professional') {
      const professional = await Professional.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.Subcategory,
            as: 'subcategories',
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ]
      });

      if (professional) {
        console.log('📋 Professional encontrado:', {
          id: professional.id,
          user_id: professional.user_id,
          subcategories: professional.subcategories?.length || 0
        });
        
        const profileData = {
          ...user.toJSON(),
          professional_id: professional.id,
          category_id: professional.category_id,
          subcategories: professional.subcategories || [],
          description: professional.description || user.description,
          experience: professional.experience || user.experience,
          education: professional.education || user.education,
          whatsapp: professional.whatsapp,
          business_address: professional.business_address,
          google_maps_link: professional.google_maps_link,
          social_media: professional.social_media,
          profile_photo: professional.profile_photo || user.profile_photo
        };

        return res.json({
          success: true,
          data: profileData
        });
      }
    }

    if (user.user_type === 'company') {
      const company = await Company.findOne({
        where: { user_id: userId },
        include: [
          {
            model: db.Category,
            as: 'category',
            attributes: ['id', 'name']
          },
          {
            model: db.Subcategory,
            as: 'subcategories',
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ]
      });

      if (company) {
        const profileData = {
          ...user.toJSON(),
          company_name: company.company_name,
          cnpj: company.cnpj,
          category_id: company.category_id,
          category: company.category,
          subcategories: company.subcategories || [],
          description: company.description || user.description,
          website: company.website,
          logo: company.logo,
          phone: company.phone || user.phone,
          whatsapp: company.whatsapp,
          address: company.address,
          city_id: company.city_id,
          state: company.state || user.state,
          business_areas: company.business_areas,
          social_media: company.social_media,
          profile_photo: company.logo || user.profile_photo
        };

        return res.json({
          success: true,
          data: profileData
        });
      }
    }

    return res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('💥 Erro ao buscar perfil:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = { ...req.body };

    delete updates.id;
    delete updates.password;
    delete updates.email;
    delete updates.created_at;
    delete updates.updated_at;

    console.log('📝 Atualizando perfil:', { userId });
    console.log('📦 Updates recebidos:', updates);
    console.log('🏷️ Subcategories no body:', updates.subcategories);

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const oldUserType = user.user_type;
    const newUserType = updates.user_type;

    if (newUserType && newUserType !== oldUserType) {
      console.log(`🔄 Mudando tipo de ${oldUserType} para ${newUserType}`);
      
      const professional = await Professional.findOne({ where: { user_id: userId } });
      const company = await Company.findOne({ where: { user_id: userId } });
      
      if (newUserType === 'professional') {
        if (!professional) {
          await Professional.create({
            id: `prof-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            name: user.name,
            email: user.email,
            category_id: updates.category_id || null,
            city: updates.city || user.city,
            state: updates.state || user.state,
            description: updates.description || '',
            experience: updates.experience || '',
            education: updates.education || '',
            phone: updates.phone || user.phone,
            is_active: true
          });
          console.log('✅ Perfil profissional criado');
        } else {
          await professional.update({ 
            is_active: true,
            category_id: updates.category_id || professional.category_id
          });
          console.log('✅ Perfil profissional REATIVADO com category_id:', updates.category_id);
        }
        
        if (company) {
          await company.update({ is_active: false });
          console.log('✅ Perfil de empresa DESATIVADO');
        }
      }
      
      else if (newUserType === 'company') {
        if (!company) {
          await Company.create({
            id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            user_id: userId,
            company_name: updates.company_name || user.name,
            cnpj: (updates.cnpj && updates.cnpj !== '') ? updates.cnpj : null,
            phone: (updates.phone && updates.phone !== '') ? updates.phone : (user.phone && user.phone !== '') ? user.phone : null,
            email: user.email,
            description: (updates.description && updates.description !== '') ? updates.description : null,
            category_id: (updates.category_id && updates.category_id !== '') ? updates.category_id : null,
            city_id: null,
            state: (updates.state && updates.state !== '') ? updates.state : (user.state && user.state !== '') ? user.state : null,
            is_active: true
          });
          console.log('✅ Perfil de empresa criado');
        } else {
          await company.update({ is_active: true });
          console.log('✅ Perfil de empresa REATIVADO');
        }
        
        if (professional) {
          await professional.update({ is_active: false });
          console.log('✅ Perfil profissional DESATIVADO');
        }
      }
      
      else if (newUserType === 'client') {
        if (professional) {
          await professional.update({ is_active: false });
          console.log('✅ Perfil profissional DESATIVADO (mudou para client)');
        }
        if (company) {
          await company.update({ is_active: false });
          console.log('✅ Perfil de empresa DESATIVADO (mudou para client)');
        }
      }
    }

    await user.update(updates);

    if (user.user_type === 'professional') {
      const professional = await Professional.findOne({ where: { user_id: userId } });
      
      if (professional) {
        console.log('👷 Professional encontrado:', professional.id);
        
        const professionalUpdates = {};
        
        if (updates.name) professionalUpdates.name = updates.name;
        if ('category_id' in updates) professionalUpdates.category_id = updates.category_id;
        if (updates.city) professionalUpdates.city = updates.city;
        if (updates.state) professionalUpdates.state = updates.state;
        if (updates.description !== undefined) professionalUpdates.description = updates.description;
        if (updates.experience !== undefined) professionalUpdates.experience = updates.experience;
        if (updates.education !== undefined) professionalUpdates.education = updates.education;
        if (updates.phone) professionalUpdates.phone = updates.phone;
        if (updates.whatsapp !== undefined) professionalUpdates.whatsapp = updates.whatsapp;
        if (updates.business_address !== undefined) professionalUpdates.business_address = updates.business_address;
        if (updates.google_maps_link !== undefined) professionalUpdates.google_maps_link = updates.google_maps_link;
        if (updates.social_media) professionalUpdates.social_media = updates.social_media;
        if (updates.profile_photo) professionalUpdates.profile_photo = updates.profile_photo;

        professionalUpdates.is_active = true;

        await professional.update(professionalUpdates);
        console.log('✅ Professional atualizado');

        // ✅ ATUALIZAR SUBCATEGORIAS
        if (updates.subcategories !== undefined) {
          console.log('🏷️ Processando subcategorias...');
          console.log('🏷️ Subcategories recebidas:', updates.subcategories);
          console.log('🏷️ Tipo:', typeof updates.subcategories);
          console.log('🏷️ É array?', Array.isArray(updates.subcategories));
          
          if (Array.isArray(updates.subcategories)) {
            if (updates.subcategories.length === 0) {
              await professional.setSubcategories([]);
              console.log('✅ Subcategorias LIMPAS (array vazio)');
            } else {
              console.log('🔍 Buscando subcategorias com IDs:', updates.subcategories);
              
              const subcategoryRecords = await db.Subcategory.findAll({
                where: { id: { [db.Sequelize.Op.in]: updates.subcategories } }
              });
              
              console.log('📋 Subcategorias encontradas no banco:', subcategoryRecords.length);
              console.log('📋 IDs encontrados:', subcategoryRecords.map(s => s.id));
              
              await professional.setSubcategories(subcategoryRecords);
              console.log('✅ Subcategorias do profissional SETADAS:', updates.subcategories);
              
              // ✅ VERIFICAR SE SALVOU
              const verification = await Professional.findByPk(professional.id, {
                include: [{
                  model: db.Subcategory,
                  as: 'subcategories',
                  attributes: ['id', 'name']
                }]
              });
              
              console.log('🔍 VERIFICAÇÃO - Subcategorias salvas:', verification.subcategories.map(s => s.id));
            }
          }
        }
      }
    }

    if (user.user_type === 'company') {
      const company = await Company.findOne({ where: { user_id: userId } });
      
      if (company) {
        const companyUpdates = {};
        
        if (updates.company_name) companyUpdates.company_name = updates.company_name;
        if (updates.cnpj) companyUpdates.cnpj = updates.cnpj;
        if (updates.description) companyUpdates.description = updates.description;
        if (updates.website) companyUpdates.website = updates.website;
        if (updates.logo) companyUpdates.logo = updates.logo;
        if (updates.phone) companyUpdates.phone = updates.phone;
        if (updates.whatsapp) companyUpdates.whatsapp = updates.whatsapp;
        if (updates.address) companyUpdates.address = updates.address;
        if (updates.city_id && updates.city_id !== '') companyUpdates.city_id = updates.city_id;
        if (updates.state && updates.state !== '') companyUpdates.state = updates.state;
        if (updates.category_id) companyUpdates.category_id = updates.category_id;
        if (updates.business_areas) companyUpdates.business_areas = updates.business_areas;
        if (updates.social_media) companyUpdates.social_media = updates.social_media;

        companyUpdates.is_active = true;

        await company.update(companyUpdates);
        console.log('✅ Company atualizado');

        if (updates.subcategories && Array.isArray(updates.subcategories)) {
          const subcategoryRecords = await db.Subcategory.findAll({
            where: { id: { [db.Sequelize.Op.in]: updates.subcategories } }
          });
          await company.setSubcategories(subcategoryRecords);
          console.log('✅ Subcategorias da empresa atualizadas');
        }
      }
    }

    // ✅ RETORNAR DADOS COMPLETOS COM SUBCATEGORIAS
    let updatedUserData;
    
    if (user.user_type === 'professional') {
      const professional = await Professional.findOne({
        where: { user_id: userId },
        include: [{
          model: db.Subcategory,
          as: 'subcategories',
          through: { attributes: [] },
          attributes: ['id', 'name']
        }]
      });
      
      updatedUserData = {
        ...user.toJSON(),
        professional_id: professional.id,
        category_id: professional.category_id,
        subcategories: professional.subcategories || [],
        description: professional.description,
        experience: professional.experience,
        education: professional.education,
        whatsapp: professional.whatsapp,
        business_address: professional.business_address,
        google_maps_link: professional.google_maps_link,
        social_media: professional.social_media,
        profile_photo: professional.profile_photo || user.profile_photo
      };
      
      console.log('📤 Retornando dados com', updatedUserData.subcategories.length, 'subcategorias');
    } else {
      updatedUserData = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });
    }

    return res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUserData
    });

  } catch (error) {
    console.error('💥 Erro ao atualizar perfil:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const logout = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    console.error('💥 Erro no logout:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao fazer logout'
    });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'user_type', 'profile_photo', 'is_active']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Conta desativada'
      });
    }

    return res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('💥 Erro ao verificar token:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar token'
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      return res.json({
        success: true,
        message: 'Se o email existir, você receberá um código de recuperação'
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000);

    await user.update({
      reset_password_token: resetCode,
      reset_password_expires: resetExpires
    });

    try {
      await sendPasswordResetEmail(user.email, resetCode, user.name);
      console.log('✅ Email de recuperação enviado para:', user.email);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      return res.json({
        success: true,
        message: 'Houve um problema ao enviar o email. Tente novamente em alguns instantes.'
      });
    }

    return res.json({
      success: true,
      message: 'Código de recuperação enviado para seu email'
    });

  } catch (error) {
    console.error('💥 Erro ao solicitar recuperação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar solicitação'
    });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email e código são obrigatórios'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.reset_password_token) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido ou expirado'
      });
    }

    if (new Date() > user.reset_password_expires) {
      return res.status(400).json({
        success: false,
        error: 'Código expirado. Solicite um novo código.'
      });
    }

    if (user.reset_password_token !== code) {
      return res.status(400).json({
        success: false,
        error: 'Código incorreto'
      });
    }

    return res.json({
      success: true,
      message: 'Código válido'
    });

  } catch (error) {
    console.error('💥 Erro ao verificar código:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar código'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'As senhas não coincidem'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A senha deve ter pelo menos 6 caracteres'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.reset_password_token) {
      return res.status(400).json({
        success: false,
        error: 'Código inválido ou expirado'
      });
    }

    if (new Date() > user.reset_password_expires) {
      return res.status(400).json({
        success: false,
        error: 'Código expirado'
      });
    }

    if (user.reset_password_token !== code) {
      return res.status(400).json({
        success: false,
        error: 'Código incorreto'
      });
    }

    await user.update({
      password: newPassword,
      reset_password_token: null,
      reset_password_expires: null
    });

    return res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('💥 Erro ao redefinir senha:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao redefinir senha'
    });
  }
};