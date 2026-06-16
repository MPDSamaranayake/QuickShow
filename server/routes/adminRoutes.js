import express from 'express';
import { 
    getDashboardStats, 
    getAllBookings, 
    getAllUsers 
} from '../controllers/adminController.js';
import { authenticateUser, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles('admin')); // Only admins can access dashboard stats

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

export default router;
