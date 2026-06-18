import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { assets } from '../../assets/assets';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';

const AdminNavbar = () => {
    const { admin, logoutAdmin } = useAdminAuth();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logoutAdmin();
        toast.success('Logged out successfully.');
        navigate('/admin-login', { replace: true });
    };

    // Generate initials avatar from admin name
    const getInitials = (name = '') => {
        return name
            .split(' ')
            .map((n) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex items-center justify-between px-6 md:px-10 h-16 border-b border-gray-300/20 w-full bg-[#0a0a0f]/80 backdrop-blur-sm sticky top-0 z-40">
            {/* Logo */}
            <Link to="/">
                <img src={assets.logo} alt="QuickShow Logo" className="w-36 h-auto" />
            </Link>

            {/* Admin info + logout */}
            {admin && (
                <div className="relative">
                    <button
                        id="admin-menu-btn"
                        onClick={() => setDropdownOpen((v) => !v)}
                        onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                        className="flex items-center gap-2.5 group cursor-pointer"
                        aria-expanded={dropdownOpen}
                    >
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary select-none">
                            {getInitials(admin.name)}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-sm font-medium text-white leading-tight">{admin.name}</p>
                            <p className="text-[11px] text-gray-500 leading-tight flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-primary" />
                                Administrator
                            </p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="px-4 py-2.5 border-b border-white/5 mb-1">
                                <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                            </div>
                            <button
                                id="admin-logout-btn"
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminNavbar;