import express from 'express';
import {
    adminLogin,
    getAdminProfile,
    adminLogout,
    changeAdminPassword,
} from '../controllers/adminAuthController.js';
import {
    getDashboardStats,
    getAllBookings,
    getAllUsers,
} from '../controllers/adminController.js';
import { authenticateAdmin } from '../middlewares/adminAuth.js';

const router = express.Router();

// ─── Public Admin Auth Routes ────────────────────────────────────────────────
router.post('/auth/login', adminLogin);

// ─── Protected Admin Auth Routes (require valid admin JWT) ───────────────────
router.get('/auth/me', authenticateAdmin, getAdminProfile);
router.post('/auth/logout', authenticateAdmin, adminLogout);
router.put('/auth/change-password', authenticateAdmin, changeAdminPassword);

// ─── Protected Admin Dashboard Routes ───────────────────────────────────────
router.use(authenticateAdmin); // All routes below this require admin JWT

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.get('/users', getAllUsers);

export default router;
