// backend/src/routes/uploadRoutes.js - VERSÃO FINAL
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadProfilePhoto } from '../config/cloudinary.js';
import * as uploadController from '../controllers/uploadController.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Upload de foto de perfil
router.post('/profile-photo', 
  uploadProfilePhoto.single('profilePhoto'),
  uploadController.uploadProfilePhoto
);

// Deletar foto de perfil
router.delete('/profile-photo',
  uploadController.deleteProfilePhoto
);

console.log('✅ Rotas de upload configuradas');

export default router;