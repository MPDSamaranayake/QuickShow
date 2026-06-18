import express from 'express';
import {
    createTheater,
    getAllTheaters,
    getTheaterById,
    updateTheater,
    deleteTheater
} from '../controllers/theaterController.js';
import { authenticateAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// Public theater routes
router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);

// Admin-only theater mutation routes
router.post('/', authenticateAdmin, createTheater);
router.put('/:id', authenticateAdmin, updateTheater);
router.delete('/:id', authenticateAdmin, deleteTheater);

export default router;
