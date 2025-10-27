// backend/src/routes/professionals.js - VERSÃO FINAL COM /ME
import { Router } from 'express';
import * as professionalController from '../controllers/professionalController.js';
import { authenticateToken, requireUserType, requireOwnershipOrAdmin, optionalAuth } from '../middleware/auth.js';
import { uploadPortfolioPhotos } from '../config/cloudinary.js';

const router = Router();

// 👤 MEU PERFIL - DEVE VIR ANTES DE /:id PARA NÃO CONFLITAR
router.get('/me', authenticateToken, professionalController.getProfessionalByUserId);

// 📋 Rotas públicas (com autenticação opcional para mostrar/ocultar contatos)
router.get('/', optionalAuth, professionalController.getAllProfessionals);
router.get('/:id', optionalAuth, professionalController.getProfessionalById);

// 🔐 Rotas protegidas (requerem login)

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

// 📂 ROTAS DE PORTFOLIO

// Listar portfolio do profissional (público)
router.get('/:id/portfolio', professionalController.getProfessionalPortfolio);

// 📤 UPLOAD de imagens do portfolio
router.post('/:id/portfolio/upload', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  uploadPortfolioPhotos.array('images', 10),
  professionalController.uploadPortfolioImages
);

// 🗑️ DELETAR imagem específica do portfolio
router.delete('/:id/portfolio/image/:imageIndex', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.deletePortfolioImage
);

// ➕ Adicionar item ao portfolio (compatibilidade)
router.post('/:id/portfolio', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.addPortfolioItem
);

// ✏️ Atualizar item do portfolio (compatibilidade)
router.put('/:professionalId/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('professionalId'),
  professionalController.updatePortfolioItem
);

// 🗑️ Remover item do portfolio (compatibilidade)
router.delete('/:professionalId/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('professionalId'),
  professionalController.deletePortfolioItem
);

export default router;