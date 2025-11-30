// backend/src/routes/professionals.js
import { Router } from 'express';
import * as professionalController from '../controllers/professionalController.js';
import { authenticateToken } from '../middleware/auth.js';
import antiScraping from '../middleware/antiScraping.js';
import { uploadPortfolioPhotos } from '../config/cloudinary.js';

const router = Router();

// 🛡️ RATE LIMIT PARA LISTAGEM
router.get('/', 
  antiScraping.professionalRateLimiter,
  professionalController.getAllProfessionals
);

// 🛡️ RATE LIMIT PARA PERFIL INDIVIDUAL
router.get('/:id',
  antiScraping.professionalRateLimiter,
  professionalController.getProfessionalById
);

// ✅ ROTAS PROTEGIDAS
router.put('/:id', 
  authenticateToken,
  professionalController.updateProfessional
);

router.post('/:id/indicate',
  authenticateToken,
  professionalController.indicateProfessional
);

router.get('/:id/stats',
  authenticateToken,
  professionalController.getProfessionalStats
);

// 📂 ROTAS DE PORTFOLIO
router.get('/:id/portfolio',
  professionalController.getProfessionalPortfolio
);

router.post('/:id/portfolio',
  authenticateToken,
  uploadPortfolioPhotos.array('photos', 10),
  professionalController.addPortfolioItem
);

router.put('/:id/portfolio/:itemId',
  authenticateToken,
  professionalController.updatePortfolioItem
);

router.delete('/:id/portfolio/:itemId',
  authenticateToken,
  professionalController.deletePortfolioItem
);

router.post('/:id/portfolio/upload',
  authenticateToken,
  uploadPortfolioPhotos.array('photos', 10),
  professionalController.uploadPortfolioImages
);

router.delete('/:id/portfolio/images/:imageIndex',
  authenticateToken,
  professionalController.deletePortfolioImage
);

export default router;