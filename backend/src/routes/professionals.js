import { Router } from 'express';
import * as professionalController from '../controllers/professionalController.js';
import { authenticateToken, requireUserType, requireOwnershipOrAdmin, optionalAuth } from '../middleware/auth.js';
const router = Router();
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
// 📂 Portfolio do profissional
router.get('/:id/portfolio', professionalController.getProfessionalPortfolio);
// ➕ Adicionar item ao portfolio (próprio perfil ou admin)
router.post('/:id/portfolio', 
  authenticateToken, 
  requireOwnershipOrAdmin('id'),
  professionalController.addPortfolioItem
);
// ✏️ Atualizar item do portfolio (próprio perfil ou admin)
router.put('/:professionalId/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('professionalId'),
  professionalController.updatePortfolioItem
);
// 🗑️ Remover item do portfolio (próprio perfil ou admin)
router.delete('/:professionalId/portfolio/:itemId', 
  authenticateToken, 
  requireOwnershipOrAdmin('professionalId'),
  professionalController.deletePortfolioItem
);
export default router; 