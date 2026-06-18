import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loading from '../Loading';

/**
 * ProtectedAdminRoute
 * 
 * Guards all /admin/* routes.
 * - While the auth context is verifying a stored token → shows a loading screen
 * - If not authenticated → redirects to /admin-login
 * - If authenticated as admin → renders child routes via <Outlet />
 */
const ProtectedAdminRoute = () => {
    const { isAdminAuthenticated, isLoading } = useAdminAuth();

    if (isLoading) {
        // Prevent flash of admin content or premature redirect while token is being verified
        return <Loading />;
    }

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    return <Outlet />;
};

export default ProtectedAdminRoute;
