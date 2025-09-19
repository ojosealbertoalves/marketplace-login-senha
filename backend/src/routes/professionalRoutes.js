// backend/src/routes/professionalRoutes.js
import express from 'express';
import {
  getAllProfessionals,
  getProfessionalById,
  searchProfessionals,
  getProfessionalStats,
  addProjectToPortfolio,
  updateProjectInPortfolio,
  removeProjectFromPortfolio
} from '../controllers/professionalController.js';

const router = express.Router();

// Rotas existentes
router.get('/', getAllProfessionals);
router.get('/search', searchProfessionals);
router.get('/stats', getProfessionalStats);
router.get('/:id', getProfessionalById);

// NOVAS ROTAS PARA PORTFOLIO
router.post('/:id/portfolio', addProjectToPortfolio);
router.put('/:id/portfolio/:projectId', updateProjectInPortfolio);
router.delete('/:id/portfolio/:projectId', removeProjectFromPortfolio);

export default router;