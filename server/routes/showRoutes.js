import express from 'express';
import { 
    createShow, 
    getAllShows, 
    getShowById, 
    updateShow, 
    deleteShow 
} from '../controllers/showController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';
import { validateShow } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', getAllShows);
router.get('/:id', getShowById);

// Middleware validateShow only runs if it is not bulk (i.e. single insertion in req.body.movie check)
router.post('/', authenticateUser, authorizeRoles('admin'), (req, res, next) => {
    if (req.body.shows && Array.isArray(req.body.shows)) {
        return next(); // Skip individual validateShow for bulk insert
    }
    validateShow(req, res, next);
}, createShow);

router.put('/:id', authenticateUser, authorizeRoles('admin'), updateShow);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteShow);

export default router;
