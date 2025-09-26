// src/routes/admin.js
import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticateToken, requireUserType } from '../middleware/auth.js';

const router = Router();

// Middleware: todas as rotas admin requerem autenticação e tipo 'admin'
router.use(authenticateToken);
router.use(requireUserType('admin'));

// ========================
// 📂 CATEGORIAS
// ========================
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ========================
// 📋 SUBCATEGORIAS
// ========================
router.post('/subcategories', adminController.createSubcategory);
router.put('/subcategories/:id', adminController.updateSubcategory);
router.delete('/subcategories/:id', adminController.deleteSubcategory);

// ========================
// 🏙️ CIDADES
// ========================
router.get('/cities', adminController.getCities);
router.post('/cities', adminController.createCity);
router.put('/cities/:id', adminController.updateCity);
router.delete('/cities/:id', adminController.deleteCity);

// ========================
// 👥 USUÁRIOS
// ========================
router.get('/users', adminController.getUsers);
router.delete('/users/:id', adminController.deleteUser);
router.patch('/users/:id/toggle-status', adminController.toggleUserStatus);

// ========================
// 📊 ESTATÍSTICAS
// ========================
router.get('/stats', adminController.getStats);

export default router;