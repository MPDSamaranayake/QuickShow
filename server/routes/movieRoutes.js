import express from 'express';
import { 
    createMovie, 
    getAllMovies, 
    getMovieById, 
    updateMovie, 
    deleteMovie 
} from '../controllers/movieController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { validateMovie } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', getAllMovies);
router.get('/:id', getMovieById);

router.post('/', authenticateUser, authorizeRoles('admin'), validateMovie, createMovie);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateMovie);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteMovie);

export default router;
