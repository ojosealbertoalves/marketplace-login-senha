// backend/src/routes/profile.js
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { 
  getMyProfile, 
  updateBasicInfo, 
  updateProfessionalInfo,
  getMyPortfolio,
  addPortfolioItem,
  updatePortfolioItem,
  deletePortfolioItem
} from '../controllers/profileController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// === PERFIL BÁSICO ===
// GET /api/profile - Buscar meu perfil completo
router.get('/', getMyProfile);

// PUT /api/profile/basic - Atualizar dados básicos (nome, email, telefone, cidade)
router.put('/basic', updateBasicInfo);

// PUT /api/profile/professional - Atualizar dados profissionais (categoria, descrição, etc)
router.put('/professional', updateProfessionalInfo);

// === PORTFÓLIO ===
// GET /api/profile/portfolio - Buscar meu portfólio
router.get('/portfolio', getMyPortfolio);

// POST /api/profile/portfolio - Adicionar item ao portfólio
router.post('/portfolio', addPortfolioItem);

// PUT /api/profile/portfolio/:itemId - Atualizar item do portfólio
router.put('/portfolio/:itemId', updatePortfolioItem);

// DELETE /api/profile/portfolio/:itemId - Remover item do portfólio
router.delete('/portfolio/:itemId', deletePortfolioItem);

export default router;