// backend/src/routes/professionals.js - VERSÃO FINAL COM PORTFOLIO
import { Router } from 'express';
import * as professionalController from '../controllers/professionalController.js';
import { authenticateToken, requireUserType, requireOwnershipOrAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadPortfolioPhotos } from '../config/cloudinary.js';

const router = Router();

// ========================================
// ROTAS PÚBLICAS
// ========================================

// 👤 MEU PERFIL - DEVE VIR ANTES DE /:id PARA NÃO CONFLITAR
router.get('/me', authenticateToken, professionalController.getProfessionalByUserId);

// 📋 Listar todos profissionais (público)
router.get('/', optionalAuth, professionalController.getAllProfessionals);

// 🔍 Buscar profissional por ID (público)
router.get('/:id', optionalAuth, professionalController.getProfessionalById);

// 📂 Listar portfolio do profissional (público)
router.get('/:id/portfolio', professionalController.getProfessionalPortfolio);

// ========================================
// ROTAS PROTEGIDAS (REQUEREM LOGIN)
// ========================================

// ✏️ Atualizar perfil profissional (próprio perfil ou admin)
router.put('/:id', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'), 
  professionalController.updateProfessional
);

// 🤝 Indicar profissional (apenas usuários logados)
router.post('/:id/indicate', 
  authenticateToken, 
  requireUserType('professional', 'company'),
  professionalController.indicateProfessional
);

// 📊 Estatísticas do profissional (próprio perfil ou admin)
router.get('/:id/stats', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.getProfessionalStats
);

// ========================================
// ROTAS DE PORTFOLIO (PROTEGIDAS)
// ========================================

// ➕ Adicionar item ao portfolio
router.post('/:id/portfolio', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.addPortfolioItem
);

// ✏️ Atualizar item do portfolio
router.put('/:id/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.updatePortfolioItem
);

// 🗑️ Deletar item do portfolio
router.delete('/:id/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.deletePortfolioItem
);

// 📤 Upload de imagens do portfolio
router.post('/:id/portfolio/upload', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  uploadPortfolioPhotos.array('images', 10),
  professionalController.uploadPortfolioImages
);

// 🗑️ Deletar imagem específica do portfolio
router.delete('/:id/portfolio/image/:imageIndex', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.deletePortfolioImage
);

export default router;