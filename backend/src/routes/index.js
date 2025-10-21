// backend/src/routes/index.js - COM ROTAS DE UPLOAD
import express from 'express';

// Importar todas as rotas
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionals.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import cityRoutes from './cityRoutes.js';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import uploadRoutes from './uploadRoutes.js'; // ← NOVO: rotas de upload

const router = express.Router();

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando - Versão com Upload Cloudinary!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/forgot-password',
      'POST /api/auth/verify-reset-code',
      'POST /api/auth/reset-password',
      'GET /api/auth/profile (requires token)',
      'GET /api/profile (requires token)',
      'PUT /api/profile/basic (requires token)',
      'PUT /api/profile/professional (requires token)',
      'GET /api/profile/portfolio (requires token)',
      'POST /api/profile/portfolio (requires token)',
      'PUT /api/profile/portfolio/:itemId (requires token)',
      'DELETE /api/profile/portfolio/:itemId (requires token)',
      'POST /api/upload/profile-photo (requires token)', // ← NOVO
      'POST /api/upload/portfolio-photos (requires token)', // ← NOVO
      'DELETE /api/upload/profile-photo (requires token)', // ← NOVO
      'GET /api/categories',
      'GET /api/professionals',
      'GET /api/professionals/:id',
      'GET /api/users',
      'GET /api/users/check?email=',
      'GET /api/users/stats',
      'GET /api/cities',
      'GET /api/cities/states',
      'GET /api/admin'
    ]
  });
});

// Usar as rotas
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes); // ← NOVO: adicionar rotas de upload
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/admin', adminRoutes);

export default router;