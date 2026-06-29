import { useAuth } from '@clerk/react';
import {
    dummyBookingData,
    dummyDashboardData,
    dummyDateTimeData,
    dummyShowsData,
} from '../assets/assets';

const cloneData = (value) => JSON.parse(JSON.stringify(value));

// Token cache to avoid repeated Clerk calls
let tokenCache = { token: null, expiresAt: 0 };

const ADMIN_TOKEN_KEY = 'qs_admin_token';

const buildMovieDetails = (movie, dateTime) => ({
    _id: movie._id,
    movie,
    // Use real dateTime from API; only fall back to dummy when truly absent
    dateTime: (dateTime && Object.keys(dateTime).length > 0) ? dateTime : dummyDateTimeData,
});

const buildShowDetails = (show) => ({
    _id: show._id,
    occupiedSeats: show.occupiedSeats || {},
    lockedSeats: [],
    showDateTime: show.showDateTime,
    showPrice: show.showPrice,
    movie: show.movie,
});

const buildUserBookings = () => (
    dummyBookingData.map((booking, index) => ({
        ...booking,
        bookingId: booking.bookingId || `BK-${1000 + index}`,
        status: booking.status || (booking.isPaid ? 'confirmed' : 'pending'),
    }))
);

const getDummyResponse = (endpoint, options = {}) => {
    const method = (options.method || 'GET').toUpperCase();

    if (method === 'GET' && (endpoint === '/api/movies' || endpoint.startsWith('/api/movies?'))) {
        return cloneData(dummyShowsData);
    }

    if (method === 'GET' && endpoint.match(/^\/api\/movies\/[^/]+\/my-rating$/)) {
        return { userRating: null };
    }

    if (method === 'POST' && endpoint.match(/^\/api\/movies\/[^/]+\/rate$/)) {
        return { message: 'Rating submitted (offline).', userRating: 3, vote_average: 3.0, vote_count: 1 };
    }

    if (method === 'GET' && endpoint.startsWith('/api/movies/')) {
        const movieId = endpoint.split('/api/movies/')[1]?.split('?')[0];
        const movie = dummyShowsData.find((item) => item._id === movieId || String(item.id) === movieId) || dummyShowsData[0];
        // Pass dummyDateTimeData as the real dateTime so the date picker is populated in offline mode
        return cloneData(buildMovieDetails(movie, dummyDateTimeData));
    }

    if (method === 'GET' && endpoint === '/api/shows') {
        return cloneData(dummyDashboardData.activeShows);
    }

    if (method === 'GET' && endpoint.startsWith('/api/shows/')) {
        const showId = endpoint.split('/api/shows/')[1]?.split('?')[0];
        const show = dummyDashboardData.activeShows.find((item) => item._id === showId) || dummyDashboardData.activeShows[0];
        return cloneData(buildShowDetails(show));
    }

    if (method === 'GET' && endpoint === '/api/bookings') {
        return cloneData(buildUserBookings());
    }

    if (method === 'POST' && endpoint === '/api/bookings/lock') {
        return { success: true, lockedSeats: [] };
    }

    if (method === 'POST' && endpoint === '/api/bookings') {
        const mockId = 'dummy_booking_' + Math.random().toString(36).substr(2, 9);
        return {
            _id: mockId,
            bookingId: 'QS' + Math.floor(100000 + Math.random() * 900000),
            status: 'pending',
            isPaid: false,
            bookedSeats: [],
            amount: 0,
        };
    }

    if (method === 'POST' && endpoint.endsWith('/payment')) {
        return {
            message: 'Payment successful.',
            booking: {
                _id: endpoint.split('/')[3],
                bookingId: 'QS' + Math.floor(100000 + Math.random() * 900000),
                status: 'confirmed',
                isPaid: true,
                bookedSeats: [],
                amount: 0,
                paymentDetails: {
                    transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    status: 'success',
                    paidAt: new Date().toISOString(),
                }
            }
        };
    }

    return null;
};

export const useApi = () => {
    const { getToken, userId } = useAuth();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const getTokenWithTimeout = async () => {
        try {
            if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
                return tokenCache.token;
            }

            const tokenPromise = getToken();
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Token retrieval timeout')), 3000)
            );

            const token = await Promise.race([tokenPromise, timeoutPromise]);

            tokenCache = {
                token,
                expiresAt: Date.now() + 240000
            };

            return token;
        } catch (err) {
            console.warn('Token retrieval failed or timed out:', err);
            return null;
        }
    };

    /**
     * request() — for regular user API calls (uses Clerk token or custom user JWT)
     */
    const request = async (endpoint, options = {}) => {
        const headers = { ...(options.headers || {}) };

        const token = await getTokenWithTimeout();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Fallback to custom token from localStorage if custom login was used
        const customToken = localStorage.getItem('custom_token');
        if (customToken && !headers['Authorization']) {
            headers['Authorization'] = `Bearer ${customToken}`;
        }

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'API request failed');
            }

            return response.json();
        } catch (error) {
            const fallback = getDummyResponse(endpoint, options);
            if (fallback !== null) {
                console.warn(`Using dummy data for ${endpoint}:`, error.message || error);
                return fallback;
            }
            throw error;
        }
    };

    /**
     * adminRequest() — for admin panel API calls (uses admin JWT from localStorage)
     * Does NOT fall back to dummy data — admin operations must be real.
     */
    const adminRequest = async (endpoint, options = {}) => {
        const headers = { ...(options.headers || {}) };

        const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (!adminToken) {
            throw new Error('Admin session not found. Please log in again.');
        }
        headers['Authorization'] = `Bearer ${adminToken}`;

        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Admin API request failed');
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    };

    return { request, adminRequest, userId };
};

export default useApi;
