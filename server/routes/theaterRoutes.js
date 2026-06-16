import express from 'express';
import { 
    createTheater, 
    getAllTheaters, 
    getTheaterById, 
    updateTheater, 
    deleteTheater 
} from '../controllers/theaterController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', getAllTheaters);
router.get('/:id', getTheaterById);

router.post('/', authenticateUser, authorizeRoles('admin'), createTheater);
router.put('/:id', authenticateUser, authorizeRoles('admin'), updateTheater);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteTheater);

export default router;
