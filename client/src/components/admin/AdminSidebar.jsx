import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboardIcon, ListCollapseIcon, ListIcon, PlusSquareIcon, ShieldCheck } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminSidebar = () => {
    const { admin } = useAdminAuth();

    // Generate initials from admin name (fallback to "AD")
    const getInitials = (name = '') => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase() || 'AD';
    };

    const adminNavLinks = [
        { name: 'Dashboard',     path: '/admin/dashboard',      icon: LayoutDashboardIcon },
        { name: 'List Shows',    path: '/admin/list-shows',     icon: PlusSquareIcon },
        { name: 'Add Shows',     path: '/admin/add-shows',      icon: ListIcon },
        { name: 'List Bookings', path: '/admin/list-bookings',  icon: ListCollapseIcon },
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col pt-8 max-w-13 md:max-w-60 w-full border-r border-gray-300/20 text-sm shrink-0">
            {/* Admin avatar + info */}
            <div className="flex flex-col items-center gap-2 mb-6 px-3">
                <div className="h-12 md:h-14 w-12 md:w-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-sm md:text-base font-bold text-primary select-none shrink-0">
                    {getInitials(admin?.name)}
                </div>
                <div className="max-md:hidden text-center">
                    <p className="text-sm font-medium text-white truncate max-w-[180px]">
                        {admin?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-primary" />
                        Administrator
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-3 border-t border-gray-700/50 mb-2" />

            {/* Nav links */}
            <nav className="w-full">
                {adminNavLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            `relative flex items-center max-md:justify-center gap-2.5 w-full py-2.5 min-md:pl-8 text-sm transition-colors duration-150 ${
                                isActive
                                    ? 'bg-primary/15 text-primary'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <link.icon className="w-5 h-5 shrink-0" />
                                <p className="max-md:hidden">{link.name}</p>
                                <span
                                    className={`w-1.5 h-10 rounded-l absolute right-0 transition-all ${
                                        isActive ? 'bg-primary' : 'bg-transparent'
                                    }`}
                                />
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default AdminSidebar;