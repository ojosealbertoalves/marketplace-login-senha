// backend/src/routes/index.js - VERSÃO CORRIGIDA
import express from 'express';

// Importar todas as rotas
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionals.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import cityRoutes from './cityRoutes.js';
import authRoutes from './auth.js';
import profileRoutes from './profile.js';
import uploadRoutes from './uploadRoutes.js'; // ← APENAS ESTA LINHA (sem duplicação)

const router = express.Router();

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando - Versão com Upload de Fotos!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/profile (requires token)',
      'PUT /api/profile/basic (requires token)',
      'PUT /api/profile/professional (requires token)',
      'POST /api/upload/profile-photo (requires token)',
      'DELETE /api/upload/profile-photo (requires token)',
      'POST /api/upload/portfolio-photos (requires token)',
      'GET /api/categories',
      'GET /api/professionals',
      'GET /api/users',
      'GET /api/cities'
    ]
  });
});

// Usar as rotas (SEM DUPLICAÇÃO)
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/upload', uploadRoutes); // ← APENAS UMA VEZ
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/admin', adminRoutes);

export default router;