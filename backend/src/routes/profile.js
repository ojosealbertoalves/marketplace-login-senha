// backend/src/routes/profile.js - FINAL
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { ensureProfessionalProfile } from '../middleware/ensureProfessionalProfile.js';
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

// Garantir que professional/company tem perfil criado
router.use(ensureProfessionalProfile);

// === PERFIL BÁSICO ===
router.get('/', getMyProfile);
router.put('/basic', updateBasicInfo);
router.put('/professional', updateProfessionalInfo);

// === PORTFÓLIO ===
router.get('/portfolio', getMyPortfolio);
router.post('/portfolio', addPortfolioItem);
router.put('/portfolio/:itemId', updatePortfolioItem);
router.delete('/portfolio/:itemId', deletePortfolioItem);

export default router;