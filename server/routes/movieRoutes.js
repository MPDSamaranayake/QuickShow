import express from 'express';
import {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
} from '../controllers/movieController.js';
import { authenticateAdmin } from '../middlewares/adminAuth.js';
import { validateMovie } from '../middlewares/validation.js';
import { uploadMoviePoster } from '../configs/upload.js';

const router = express.Router();

// Public movie routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Admin-only movie mutation routes (require admin JWT)
router.post('/', authenticateAdmin, uploadMoviePoster.single('image'), validateMovie, createMovie);
router.put('/:id', authenticateAdmin, updateMovie);
router.delete('/:id', authenticateAdmin, deleteMovie);

export default router;
