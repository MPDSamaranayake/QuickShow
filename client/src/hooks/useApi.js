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

const buildMovieDetails = (movie) => ({
    _id: movie._id,
    movie,
    dateTime: dummyDateTimeData,
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

    if (method === 'GET' && endpoint.startsWith('/api/movies/')) {
        const movieId = endpoint.split('/api/movies/')[1]?.split('?')[0];
        const movie = dummyShowsData.find((item) => item._id === movieId || String(item.id) === movieId) || dummyShowsData[0];
        return cloneData(buildMovieDetails(movie));
    }

    if (method === 'GET' && endpoint === '/api/admin/dashboard') {
        return cloneData(dummyDashboardData);
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

    if (method === 'GET' && endpoint === '/api/admin/bookings') {
        return cloneData(dummyBookingData);
    }

    if (method === 'POST' && (endpoint === '/api/bookings/lock' || endpoint === '/api/bookings' || endpoint.endsWith('/payment') || endpoint === '/api/shows')) {
        return { success: true };
    }

    return null;
};

export const useApi = () => {
    const { getToken, userId } = useAuth();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    const getTokenWithTimeout = async () => {
        try {
            // Return cached token if still valid
            if (tokenCache.token && tokenCache.expiresAt > Date.now()) {
                return tokenCache.token;
            }

            // Timeout token retrieval to 3 seconds to prevent hanging
            const tokenPromise = getToken();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Token retrieval timeout')), 3000)
            );

            const token = await Promise.race([tokenPromise, timeoutPromise]);
            
            // Cache token for 4 minutes
            tokenCache = { 
                token, 
                expiresAt: Date.now() + 240000 
            };
            
            return token;
        } catch (err) {
            console.warn("Token retrieval failed or timed out:", err);
            return null;
        }
    };

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
            // Add 10-second request timeout
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

    return { request, userId };
};
export default useApi;
