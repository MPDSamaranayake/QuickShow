import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Generate a typed admin JWT token
const generateAdminToken = (id) => {
    return jwt.sign(
        { id, type: 'admin' }, // `type` field prevents user tokens from working on admin routes
        process.env.JWT_SECRET || 'quickshow_super_secret_jwt_sign_key_987654321',
        { expiresIn: '7d' }
    );
};

// @desc    Admin login
// @route   POST /api/admin/auth/login
// @access  Public
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Fetch admin with password (password is select:false by default, so explicitly include it)
        const admin = await Admin.findOne({ email: email.toLowerCase().trim() }).select('+password');
        if (!admin) {
            // Generic error — do not reveal whether email exists
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Update last login timestamp
        admin.lastLogin = new Date();
        await admin.save({ validateBeforeSave: false });

        const token = generateAdminToken(admin._id);

        res.json({
            token,
            admin: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                lastLogin: admin.lastLogin,
            },
        });
    } catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({ message: 'Error during admin login.' });
    }
};

// @desc    Get current admin profile (verify token & return admin info)
// @route   GET /api/admin/auth/me
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
    try {
        // req.admin is attached by authenticateAdmin middleware
        res.json({
            _id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role,
            lastLogin: req.admin.lastLogin,
            createdAt: req.admin.createdAt,
        });
    } catch (error) {
        console.error('Get Admin Profile Error:', error);
        res.status(500).json({ message: 'Error fetching admin profile.' });
    }
};

// @desc    Admin logout (client-side token clearing; server acknowledges)
// @route   POST /api/admin/auth/logout
// @access  Private/Admin
export const adminLogout = async (req, res) => {
    try {
        // JWT is stateless — actual invalidation happens on the client by deleting the token.
        // A production system would use a token blacklist (Redis). For now, we acknowledge logout.
        res.json({ message: 'Logged out successfully.' });
    } catch (error) {
        console.error('Admin Logout Error:', error);
        res.status(500).json({ message: 'Error during logout.' });
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/auth/change-password
// @access  Private/Admin
export const changeAdminPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters.' });
        }

        // Re-fetch admin with password for comparison
        const admin = await Admin.findById(req.admin._id).select('+password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const isMatch = await admin.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        admin.password = newPassword; // pre-save hook will hash it
        await admin.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (error) {
        console.error('Change Admin Password Error:', error);
        res.status(500).json({ message: 'Error changing password.' });
    }
};
