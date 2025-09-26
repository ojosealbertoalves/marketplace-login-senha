// src/routes/auth.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// 📝 Rotas públicas (sem autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);

// 🔐 Rotas protegidas (requerem autenticação)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;