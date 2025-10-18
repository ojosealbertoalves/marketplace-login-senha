// backend/src/routes/index.js
import express from 'express';

// Importar todas as rotas
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionals.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import cityRoutes from './cityRoutes.js';
import authRoutes from './auth.js';
import profileRoutes from './profile.js'; // ← ADICIONADO: rotas de perfil

const router = express.Router();

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando - Versão com Perfil de Usuário!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile (requires token)',
      'GET /api/profile (requires token)', // ← NOVO
      'PUT /api/profile/basic (requires token)', // ← NOVO  
      'PUT /api/profile/professional (requires token)', // ← NOVO
      'GET /api/profile/portfolio (requires token)', // ← NOVO
      'POST /api/profile/portfolio (requires token)', // ← NOVO
      'PUT /api/profile/portfolio/:itemId (requires token)', // ← NOVO
      'DELETE /api/profile/portfolio/:itemId (requires token)', // ← NOVO
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
router.use('/profile', profileRoutes); // ← ADICIONADO: rotas de perfil
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/admin', adminRoutes);

export default router;