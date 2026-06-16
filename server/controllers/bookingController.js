import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// Helper: Generate Unique Booking ID
const generateBookingId = () => {
    return 'QS' + Math.floor(100000 + Math.random() * 900000); // e.g. QS748392
};

// @desc    Lock seats temporarily (5 minutes)
// @route   POST /api/bookings/lock
// @access  Private
export const lockSeats = async (req, res) => {
    try {
        const { showId, seats } = req.body;
        const userId = req.user._id;

        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).json({ message: 'Show not found.' });
        }

        const now = new Date();
        // Remove expired locks (older than 5 minutes / 300 seconds)
        show.lockedSeats = show.lockedSeats.filter(lock => {
            const timeDiff = (now.getTime() - new Date(lock.lockedAt).getTime()) / 1000;
            return timeDiff < 300;
        });

        // Check if any seat is already booked or locked by another user
        for (const seat of seats) {
            if (show.occupiedSeats && show.occupiedSeats.has(seat)) {
                return res.status(400).json({ message: `Seat ${seat} is already booked.` });
            }

            const isLocked = show.lockedSeats.some(lock => lock.seatNumber === seat && lock.userId !== userId);
            if (isLocked) {
                return res.status(400).json({ message: `Seat ${seat} is temporarily locked by another customer.` });
            }
        }

        // Lock the seats for the current user
        seats.forEach(seat => {
            // Remove existing lock by the same user on the same seat (refresh lock time)
            show.lockedSeats = show.lockedSeats.filter(lock => !(lock.seatNumber === seat && lock.userId === userId));
            show.lockedSeats.push({
                seatNumber: seat,
                userId: userId,
                lockedAt: now
            });
        });

        await show.save();

        res.json({ message: 'Seats locked successfully for 5 minutes.', lockedSeats: show.lockedSeats });
    } catch (error) {
        console.error('Lock Seats Error:', error);
        res.status(500).json({ message: 'Error locking seats.' });
    }
};

// @desc    Create a pending booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    try {
        const { showId, seats } = req.body;
        const userId = req.user._id;

        const show = await Show.findById(showId).populate('movie');
        if (!show) {
            return res.status(404).json({ message: 'Show not found.' });
        }

        // Verify that the seats are indeed locked by this user
        const now = new Date();
        const userLocks = show.lockedSeats.filter(lock => {
            const timeDiff = (now.getTime() - new Date(lock.lockedAt).getTime()) / 1000;
            return lock.userId === userId && seats.includes(lock.seatNumber) && timeDiff < 300;
        });

        if (userLocks.length !== seats.length) {
            return res.status(400).json({ message: 'Seat lock expired. Please select seats and try again.' });
        }

        const amount = show.showPrice * seats.length;
        const bookingId = generateBookingId();

        const booking = await Booking.create({
            bookingId,
            user: userId,
            show: showId,
            bookedSeats: seats,
            amount,
            status: 'pending',
            isPaid: false
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error('Create Booking Error:', error);
        res.status(500).json({ message: 'Error creating booking.' });
    }
};

// @desc    Verify payment and confirm booking
// @route   POST /api/bookings/:id/payment
// @access  Private
export const verifyPayment = async (req, res) => {
    try {
        const { status } = req.body; // Expects 'success' or 'failed'
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (booking.isPaid) {
            return res.status(400).json({ message: 'Booking has already been paid.' });
        }

        if (status === 'success') {
            booking.isPaid = true;
            booking.status = 'confirmed';
            booking.paymentDetails = {
                transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                status: 'success',
                paidAt: new Date()
            };

            await booking.save();

            // Mark seats as occupied in Show, and release user's temporary locks
            const show = await Show.findById(booking.show);
            if (show) {
                booking.bookedSeats.forEach(seat => {
                    show.occupiedSeats.set(seat, booking.user);
                    // Remove locks
                    show.lockedSeats = show.lockedSeats.filter(lock => !(lock.seatNumber === seat && lock.userId === booking.user));
                });
                await show.save();
            }

            res.json({ message: 'Payment successful, booking confirmed.', booking });
        } else {
            booking.status = 'cancelled';
            booking.paymentDetails = {
                transactionId: '',
                status: 'failed',
                paidAt: new Date()
            };
            await booking.save();

            // Release locks
            const show = await Show.findById(booking.show);
            if (show) {
                show.lockedSeats = show.lockedSeats.filter(lock => !(booking.bookedSeats.includes(lock.seatNumber) && lock.userId === booking.user));
                await show.save();
            }

            res.json({ message: 'Payment failed, booking cancelled.', booking });
        }
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Error verifying payment.' });
    }
};

// @desc    Cancel a booking
// @route   POST /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled.' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Release seats from occupiedSeats in Show
        const show = await Show.findById(booking.show);
        if (show) {
            booking.bookedSeats.forEach(seat => {
                show.occupiedSeats.delete(seat);
            });
            await show.save();
        }

        res.json({ message: 'Booking cancelled successfully.', booking });
    } catch (error) {
        console.error('Cancel Booking Error:', error);
        res.status(500).json({ message: 'Error cancelling booking.' });
    }
};

// @desc    Get booking details / ticket
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingDetails = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }

        // Only user who booked or an admin can access
        if (booking.user !== req.user._id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        res.json(booking);
    } catch (error) {
        console.error('Get Booking Details Error:', error);
        res.status(500).json({ message: 'Error fetching booking details.' });
    }
};

// @desc    Get current user booking history
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            })
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error('Get User Bookings Error:', error);
        res.status(500).json({ message: 'Error fetching booking history.' });
    }
};
