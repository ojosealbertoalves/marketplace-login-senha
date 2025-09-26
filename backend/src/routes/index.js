// src/routes/index.js
import { Router } from 'express';

// Rotas de autenticação (NOVAS)
import authRoutes from './auth.js';
import adminRoutes from './admin.js';

// Rotas existentes
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionals.js'; // 👈 NOME CORRETO!
import cityRoutes from './cityRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando com autenticação!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/profile (requires token)',
      'GET /api/categories',
      'GET /api/professionals',
      'GET /api/cities',
      'GET /api/users',
      'GET /api/admin/stats (admin only)'
    ]
  });
});

// 🔐 Rotas de autenticação
router.use('/auth', authRoutes);

// 👑 Rotas administrativas
router.use('/admin', adminRoutes);

// 📂 Rotas públicas existentes
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/cities', cityRoutes);
router.use('/users', userRoutes);

export default router;