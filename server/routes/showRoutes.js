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
import { uploadShowArtwork } from '../configs/upload.js';

const parseShowPayload = (req, res, next) => {
    if (typeof req.body.shows === 'string') {
        try {
            req.body.shows = JSON.parse(req.body.shows);
        } catch (error) {
            return res.status(400).json({ message: 'Invalid shows payload.' });
        }
    }

    next();
};

const validateBulkShowPayload = (req, res, next) => {
    if (!req.body.shows || !Array.isArray(req.body.shows)) {
        return next();
    }

    const { showName, showArtwork } = req.body;
    if (!showName || (!showArtwork && !req.file)) {
        return res.status(400).json({ message: 'Show name and show artwork are required for bulk show creation.' });
    }

    next();
};

const router = express.Router();

router.get('/', getAllShows);
router.get('/:id', getShowById);

// Middleware validateShow only runs if it is not bulk (i.e. single insertion in req.body.movie check)
router.post('/', authenticateUser, authorizeRoles('admin'), uploadShowArtwork.single('showArtwork'), parseShowPayload, (req, res, next) => {
    if (req.body.shows && Array.isArray(req.body.shows)) {
        return validateBulkShowPayload(req, res, next);
    }

    return validateShow(req, res, next);
}, createShow);

router.put('/:id', authenticateUser, authorizeRoles('admin'), updateShow);
router.delete('/:id', authenticateUser, authorizeRoles('admin'), deleteShow);

export default router;
