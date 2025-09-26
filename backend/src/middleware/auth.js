// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import db from '../models/index.js';

// Middleware para verificar JWT
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso requerido',
        message: 'Faça login para acessar este recurso'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-jwt-secret-aqui');
    
    // Buscar dados atuais do usuário
    const user = await db.User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ 
        error: 'Usuário inválido ou inativo' 
      });
    }

    req.user = user;
    req.userId = user.id;
    req.userType = user.user_type;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        message: 'Faça login novamente'
      });
    }
    
    return res.status(403).json({ 
      error: 'Token inválido' 
    });
  }
};

// Middleware para verificar tipos de usuário
export const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    if (!allowedTypes.includes(req.user.user_type)) {
      return res.status(403).json({ 
        error: 'Acesso negado',
        message: 'Você não tem permissão para acessar este recurso'
      });
    }

    next();
  };
};

// Middleware para verificar permissões específicas
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Usuário não autenticado' 
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        error: 'Permissão insuficiente',
        message: `Você precisa da permissão '${permission}' para acessar este recurso`
      });
    }

    next();
  };
};

// Middleware para verificar se o usuário pode acessar seus próprios dados ou se é admin
export const requireOwnershipOrAdmin = (paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[paramName];
      const userId = req.user.id;
      const userType = req.user.user_type;

      // Admin pode acessar qualquer recurso
      if (userType === 'admin') {
        return next();
      }

      // Para profissionais: verificar se é o próprio perfil
      if (userType === 'professional') {
        const professional = await db.Professional.findOne({
          where: { user_id: userId }
        });
        
        if (professional && professional.id === resourceId) {
          return next();
        }
      }

      // Para empresas: verificar se é o próprio perfil
      if (userType === 'company') {
        const company = await db.Company.findOne({
          where: { user_id: userId }
        });
        
        if (company && company.id === resourceId) {
          return next();
        }
      }

      // Se chegou até aqui, não tem permissão
      return res.status(403).json({
        error: 'Acesso negado',
        message: 'Você só pode acessar seus próprios dados'
      });

    } catch (error) {
      console.error('Erro no middleware de ownership:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  };
};

// Middleware opcional - verifica token se presente, mas não exige
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu-jwt-secret-aqui');
      const user = await db.User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (user && user.is_active) {
        req.user = user;
        req.userId = user.id;
        req.userType = user.user_type;
      }
    }
    
    next();
  } catch (error) {
    // Se houver erro no token, simplesmente continue sem autenticar
    next();
  }
};