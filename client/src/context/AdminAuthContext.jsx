import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const AdminAuthContext = createContext(null);

const ADMIN_TOKEN_KEY = 'qs_admin_token';
const ADMIN_DATA_KEY  = 'qs_admin_data';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const AdminAuthProvider = ({ children }) => {
    const [admin, setAdmin]                   = useState(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [isLoading, setIsLoading]           = useState(true); // true while verifying stored token
    const verifiedRef = useRef(false);

    /**
     * Verify the stored token with the server on mount.
     * This prevents stale/invalid tokens from keeping the user "logged in".
     */
    const verifyStoredToken = useCallback(async () => {
        if (verifiedRef.current) return;
        verifiedRef.current = true;

        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/admin/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                signal: AbortSignal.timeout(5000),
            });

            if (res.ok) {
                const adminData = await res.json();
                setAdmin(adminData);
                setIsAdminAuthenticated(true);
                localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
            } else {
                // Token is invalid or expired — clear local storage
                clearAdminSession();
            }
        } catch {
            // Network error — restore from cached data optimistically
            const cached = localStorage.getItem(ADMIN_DATA_KEY);
            if (cached) {
                try {
                    setAdmin(JSON.parse(cached));
                    setIsAdminAuthenticated(true);
                } catch {
                    clearAdminSession();
                }
            } else {
                clearAdminSession();
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        verifyStoredToken();
    }, [verifyStoredToken]);

    const clearAdminSession = () => {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        localStorage.removeItem(ADMIN_DATA_KEY);
        setAdmin(null);
        setIsAdminAuthenticated(false);
    };

    /**
     * Call after a successful login API response.
     */
    const loginAdmin = useCallback((token, adminData) => {
        localStorage.setItem(ADMIN_TOKEN_KEY, token);
        localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
        setAdmin(adminData);
        setIsAdminAuthenticated(true);
    }, []);

    /**
     * Call on logout — clears state and localStorage.
     */
    const logoutAdmin = useCallback(async () => {
        const token = localStorage.getItem(ADMIN_TOKEN_KEY);
        // Notify server (best-effort, non-blocking)
        if (token) {
            fetch(`${BASE_URL}/api/admin/auth/logout`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
        }
        clearAdminSession();
    }, []);

    /**
     * Get the current admin JWT from localStorage.
     */
    const getAdminToken = useCallback(() => {
        return localStorage.getItem(ADMIN_TOKEN_KEY);
    }, []);

    const value = {
        admin,
        isAdminAuthenticated,
        isLoading,
        loginAdmin,
        logoutAdmin,
        getAdminToken,
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

/**
 * Hook to consume the admin auth context.
 * Must be used inside <AdminAuthProvider>.
 */
export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (!context) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export default AdminAuthContext;
