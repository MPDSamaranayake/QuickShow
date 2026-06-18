import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import toast from 'react-hot-toast';
import { assets } from '../../assets/assets';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AdminLogin = () => {
    const { loginAdmin, isAdminAuthenticated, isLoading: authLoading } = useAdminAuth();
    const navigate = useNavigate();

    const [email, setEmail]               = useState('');
    const [password, setPassword]         = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const emailRef = useRef(null);

    // If already authenticated, redirect away from login page
    useEffect(() => {
        if (!authLoading && isAdminAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAdminAuthenticated, authLoading, navigate]);

    useEffect(() => {
        emailRef.current?.focus();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) return toast.error('Please enter your admin email.');
        if (!password)      return toast.error('Please enter your password.');

        setIsSubmitting(true);
        const toastId = toast.loading('Authenticating…');

        try {
            const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Login failed.');
            }

            loginAdmin(data.token, data.admin);
            toast.success(`Welcome back, ${data.admin.name}!`, { id: toastId });
            navigate('/admin/dashboard', { replace: true });
        } catch (err) {
            toast.error(err.message || 'Login failed. Please try again.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient background blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm">

                    {/* Logo + Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-5">
                            <img src={assets.logo} alt="QuickShow" className="h-9 w-auto" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <h1 className="text-xl font-semibold text-white">Admin Portal</h1>
                        </div>
                        <p className="text-sm text-gray-400">
                            Sign in to access the QuickShow admin dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>

                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-email" className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Admin Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    id="admin-email"
                                    ref={emailRef}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@quickshow.com"
                                    autoComplete="email"
                                    className="w-full bg-white/5 border border-white/10 focus:border-primary/60 focus:bg-white/[0.07] text-white placeholder-gray-600 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <label htmlFor="admin-password" className="block text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    id="admin-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="w-full bg-white/5 border border-white/10 focus:border-primary/60 focus:bg-white/[0.07] text-white placeholder-gray-600 rounded-xl pl-10 pr-12 py-3 text-sm outline-none transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            id="admin-login-btn"
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 mt-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Authenticating…
                                </>
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    Sign In to Dashboard
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer note */}
                    <p className="text-center text-xs text-gray-600 mt-7">
                        This portal is restricted to authorized administrators only.
                        <br />
                        Unauthorized access attempts are logged.
                    </p>
                </div>

                {/* Back to site link */}
                <p className="text-center mt-5 text-sm text-gray-500">
                    <a href="/" className="hover:text-gray-300 transition-colors underline underline-offset-2">
                        ← Back to QuickShow
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
