// backend/src/routes/categoryRoutes.js
import express from 'express';
import { 
  getAllCategories,
  getCategoryById,
  getSubcategoriesByCategory,
  getCategoryStats,
  searchCategories
} from '../controllers/categoryController.js';

const router = express.Router();

// 📊 GET /api/categories/stats - Estatísticas (deve vir antes do /:id)
router.get('/stats', getCategoryStats);

// 🔎 GET /api/categories/search?q=termo - Busca por categorias
router.get('/search', searchCategories);

// 📋 GET /api/categories - Listar todas as categorias
router.get('/', getAllCategories);

// 🏷️ GET /api/categories/:id - Buscar categoria por ID
router.get('/:id', getCategoryById);

// 🔍 GET /api/categories/:categoryId/subcategories - Subcategorias de uma categoria
router.get('/:categoryId/subcategories', getSubcategoriesByCategory);

export default router;