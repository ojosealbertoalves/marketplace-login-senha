// backend/src/routes/userRoutes.js
import express from 'express';
import { 
  checkUserEmail,
  getAllUsers,
  getUserById,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// Estatísticas (deve vir antes do /:id)
router.get('/stats', getUserStats);

// ROTA PRINCIPAL - Verificar se email existe
router.get('/check', checkUserEmail);

// Listar todos os usuários
router.get('/', getAllUsers);

// Buscar usuário por ID
router.get('/:id', getUserById);

export default router;