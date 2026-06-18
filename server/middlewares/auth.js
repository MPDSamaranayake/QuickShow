import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware: authenticateUser
 * Handles authentication for regular user routes (bookings, profile, favourites).
 * Supports both Clerk-based auth (via clerkMiddleware) and custom JWT.
 * This middleware does NOT handle admin authentication — use authenticateAdmin for that.
 */
export const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const hasClerkAuth = req.auth && req.auth.userId;

        // 1. Check if Clerk auth is populated by clerkMiddleware
        if (hasClerkAuth) {
            const userId = req.auth.userId;
            let user = await User.findById(userId);
            if (!user) {
                // If not found in DB (e.g. webhook delay), create a temporary user from clerk claims
                const clerkClaims = req.auth.sessionClaims;
                const email = clerkClaims?.email || `${userId}@clerk.local`;
                const name = clerkClaims?.name || email.split('@')[0];

                user = await User.create({
                    _id: userId,
                    name,
                    email,
                    image: '',
                    role: 'user'
                }).catch(() => null); // Ignore conflict if parallel creation occurs

                if (!user) {
                    user = await User.findById(userId);
                }
            }
            if (user) {
                req.user = user;
                return next();
            }
        }

        // 2. Check for Custom JWT auth in Authorization header
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                if (token.split('.').length === 3) {
                    const decoded = jwt.verify(
                        token,
                        process.env.JWT_SECRET || 'quickshow_super_secret_jwt_sign_key_987654321'
                    );
                    // Reject admin tokens from being used on user routes
                    if (decoded.type === 'admin') {
                        return res.status(403).json({ message: 'Admin token cannot be used for user routes.' });
                    }
                    const user = await User.findById(decoded.id);
                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
            } catch (err) {
                console.debug('Custom JWT verification failed:', err.message);
            }
        }

        // 3. Unauthenticated — return 401
        return res.status(401).json({ message: 'Unauthorized. Please log in to continue.' });
    } catch (error) {
        console.error('Authentication Error:', error);
        return res.status(500).json({ message: 'Internal Server Error during Authentication.' });
    }
};

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Access denied. Role '${req.user?.role || 'Guest'}' is not authorized.`,
            });
        }
        next();
    };
};
