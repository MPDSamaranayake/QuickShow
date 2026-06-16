import express from 'express';
import { 
    register, 
    login, 
    forgotPassword, 
    resetPassword,
    getProfile,
    updateProfile,
    toggleFavourite
} from '../controllers/authController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validateRegister, validateLogin } from '../middlewares/validation.js';

const router = express.Router();

// Auth routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// User Profile routes
router.get('/profile', authenticateUser, getProfile);
router.put('/profile', authenticateUser, updateProfile);
router.post('/favourites', authenticateUser, toggleFavourite);

export default router;
