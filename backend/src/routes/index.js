// backend/src/routes/index.js
import express from 'express';

// Importar todas as rotas
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionals.js'; // ← CORRIGIDO: professionals.js (não professionalRoutes.js)
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import cityRoutes from './cityRoutes.js';
import authRoutes from './auth.js'; // ← ADICIONADO: rotas de autenticação

const router = express.Router();

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando - Versão Modularizada!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/test',
      'POST /api/auth/register', // ← NOVO
      'POST /api/auth/login',    // ← NOVO
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
router.use('/auth', authRoutes);        // ← ADICIONADO: rotas de autenticação
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/admin', adminRoutes);

export default router;