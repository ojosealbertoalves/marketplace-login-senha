// backend/src/routes/uploadRoutes.js
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfilePhoto, uploadPortfolioPhotos } from '../config/cloudinary.js';
import * as uploadController from '../controllers/uploadController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Upload de foto de perfil (single)
router.post('/profile-photo', 
  uploadProfilePhoto.single('photo'),
  uploadController.uploadProfilePhoto
);

// Upload de fotos de portfólio (múltiplas)
router.post('/portfolio-photos',
  uploadPortfolioPhotos.array('photos', 10), // máximo 10 fotos
  uploadController.uploadPortfolioPhotos
);

// Deletar foto de perfil
router.delete('/profile-photo',
  uploadController.deleteProfilePhoto
);

export default router;