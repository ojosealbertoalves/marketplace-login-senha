// backend/src/routes/index.js
import express from 'express';

// Importar todas as rotas
import categoryRoutes from './categoryRoutes.js';
import professionalRoutes from './professionalRoutes.js';
import userRoutes from './userRoutes.js';
import adminRoutes from './adminRoutes.js';
import cityRoutes from './cityRoutes.js';

const router = express.Router();

// Rota de teste básica
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API funcionando - Versão Modularizada!',
    timestamp: new Date().toISOString(),
    availableEndpoints: [
      'GET /api/test',
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
router.use('/categories', categoryRoutes);
router.use('/professionals', professionalRoutes);
router.use('/users', userRoutes);
router.use('/cities', cityRoutes);
router.use('/admin', adminRoutes);

export default router;
