// backend/src/routes/auth.js - COMPLETO COM RESET DE SENHA
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// 📝 Rotas públicas (sem autenticação)
router.post('/register', authController.register);
router.post('/login', authController.login);

// 🔑 Rotas de recuperação de senha (públicas)
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-code', authController.verifyResetCode);
router.post('/reset-password', authController.resetPassword);

// 🔐 Rotas protegidas (requerem autenticação)
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/logout', authenticateToken, authController.logout);
router.get('/verify', authenticateToken, authController.verifyToken);

export default router;