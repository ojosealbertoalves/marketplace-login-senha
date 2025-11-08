// backend/src/routes/userRoutes.js - VERSÃO COMPLETA
import express from 'express';
import { 
  checkUserEmail,
  getAllUsers,
  getUserById,
  updateUser,
  getUserStats
} from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 📊 Estatísticas (deve vir antes do /:id)
router.get('/stats', getUserStats);

// 🔎 Verificar se email existe
router.get('/check', checkUserEmail);

// 📋 Listar todos os usuários
router.get('/', getAllUsers);

// 🔍 Buscar usuário por ID
router.get('/:id', getUserById);

// ✏️ ATUALIZAR USUÁRIO (NOVA ROTA)
router.put('/:id', authenticateToken, updateUser);

export default router;