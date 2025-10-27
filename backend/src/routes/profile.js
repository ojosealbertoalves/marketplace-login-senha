// backend/src/routes/profile.js - SIMPLIFICADO
import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Rota básica
router.get('/', authenticateToken, (req, res) => {
  res.json({ 
    success: true,
    message: 'Profile route working',
    user: req.user 
  });
});

export default router;