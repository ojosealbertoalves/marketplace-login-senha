// backend/src/routes/cityRoutes.js
import express from 'express';
import { getAllCities, getCitiesByState, getStates } from '../controllers/cityController.js';

const router = express.Router();

// GET /api/cities - Listar todas as cidades
router.get('/', getAllCities);

// GET /api/cities/states - Listar todos os estados
router.get('/states', getStates);

// GET /api/cities/state/:state - Buscar cidades por estado
router.get('/state/:state', getCitiesByState);

export default router;