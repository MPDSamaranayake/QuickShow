import express from 'express';
import { 
    lockSeats, 
    createBooking, 
    verifyPayment, 
    cancelBooking, 
    getBookingDetails, 
    getUserBookings 
} from '../controllers/bookingController.js';
import { authenticateUser } from '../middlewares/auth.js';
import { validateBooking } from '../middlewares/validation.js';

const router = express.Router();

router.use(authenticateUser); // All booking routes require authentication

router.get('/', getUserBookings);
router.get('/:id', getBookingDetails);

router.post('/lock', validateBooking, lockSeats);
router.post('/', validateBooking, createBooking);
router.post('/:id/payment', verifyPayment);
router.post('/:id/cancel', cancelBooking);

export default router;
