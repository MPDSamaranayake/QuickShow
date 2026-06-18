import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

/**
 * Middleware: authenticateAdmin
 * Verifies the admin JWT from the Authorization header.
 * Checks the Admin collection (not User/Clerk).
 * Attaches `req.admin` on success.
 * Returns 401 for missing/invalid/expired token.
 * Returns 403 for non-admin role.
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Access denied. No authentication token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        let decoded;
        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'quickshow_super_secret_jwt_sign_key_987654321'
            );
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }
            return res.status(401).json({ message: 'Invalid authentication token.' });
        }

        // Ensure this is an admin token (payload must have type: 'admin')
        if (decoded.type !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.',
            });
        }

        // Look up admin in the Admin collection (password excluded via select: false)
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Admin account not found. Please log in again.' });
        }

        if (admin.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};
