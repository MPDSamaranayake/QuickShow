import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import User from '../models/User.js';

// @desc    Get dashboard metrics & active shows
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        const revenueAggregate = await Booking.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalRevenue = revenueAggregate[0]?.total || 0;

        const totalBookings = await Booking.countDocuments({ isPaid: true });
        const totalUser = await User.countDocuments({});

        // Fetch active shows (scheduled in the future or today)
        const activeShows = await Show.find({ 
            showDateTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        }).populate('movie');

        res.json({
            totalBookings,
            totalRevenue,
            totalUser,
            activeShows
        });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ message: 'Error retrieving dashboard statistics.' });
    }
};

// @desc    List all bookings (for administrative list bookings view)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate({
                path: 'show',
                populate: { path: 'movie' }
            })
            .sort({ createdAt: -1 });

        // Let's populate user name
        const bookingsWithUserName = await Promise.all(bookings.map(async (booking) => {
            const userDoc = await User.findById(booking.user);
            return {
                ...booking.toObject(),
                user: {
                    name: userDoc ? userDoc.name : 'Unknown User',
                    email: userDoc ? userDoc.email : ''
                }
            };
        }));

        res.json(bookingsWithUserName);
    } catch (error) {
        console.error('Get All Bookings Error:', error);
        res.status(500).json({ message: 'Error fetching bookings list.' });
    }
};

// @desc    List all registered users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get All Users Error:', error);
        res.status(500).json({ message: 'Error fetching users list.' });
    }
};
