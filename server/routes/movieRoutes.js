import express from 'express';
import {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    rateMovie,
    getMyRating
} from '../controllers/movieController.js';
import { authenticateAdmin } from '../middlewares/adminAuth.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validateMovie } from '../middlewares/validation.js';
import { uploadMoviePoster } from '../configs/upload.js';

const router = express.Router();

// Public movie routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// User rating routes (require user auth)
router.get('/:id/my-rating', authenticateUser, getMyRating);
router.post('/:id/rate', authenticateUser, rateMovie);

// Admin-only movie mutation routes (require admin JWT)
router.post('/', authenticateAdmin, uploadMoviePoster.single('image'), validateMovie, createMovie);
router.put('/:id', authenticateAdmin, updateMovie);
router.delete('/:id', authenticateAdmin, deleteMovie);

export default router;
