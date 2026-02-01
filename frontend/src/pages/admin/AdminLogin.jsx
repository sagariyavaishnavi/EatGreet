import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLogin() {
    const { updateSettings } = useSettings();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const userData = response.data;

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userData.role);
            updateSettings(userData);

            if (userData.role === 'superadmin') {
                // Enforce separation: Super Admins must use their own login portal
                navigate('/super-admin/login');
                return;
            } else if (userData.role === 'admin') {
                const restaurantSlug = userData.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';
                navigate(`/${restaurantSlug}/admin`);
            } else {
                const restaurantSlug = userData.restaurantName?.toLowerCase()?.replace(/\s+/g, '-') || 'restaurant';
                navigate(`/${restaurantSlug}/admin`);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBF2F2] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#F4F7F7] p-8 md:p-12 rounded-[2.5rem] shadow-xl w-full max-w-md border border-white/50 relative overflow-hidden"
            >
                <div className="flex flex-col items-center mb-8">
                    <div className="mb-2">
                        <img src="/logo-v.svg" alt="EatGreet Logo" className="w-[120px]" />
                    </div>
                    <h2 className="text-gray-600 font-medium text-[20px] mt-2">Welcome back</h2>
                    <p className="text-gray-400 text-[14px] mt-1 font-normal text-center">
                        Sign in to manage your restaurant
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    {error && (
                        <div className="bg-red-50 text-red-500 text-xs p-3 rounded-2xl text-center font-bold">
                            {error}
                        </div>
                    )}
                    <div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-transparent border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all text-sm"
                            placeholder="Email*"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-transparent border border-gray-300 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all text-sm"
                            placeholder="Password*"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-400 px-2 font-normal">
                        <label className="flex items-center cursor-pointer hover:text-gray-600">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black mr-2" />
                            <span>Remember me?</span>
                        </label>
                        <a href="#" className="hover:text-gray-600">Forget Password?</a>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:bg-gray-900 transition-all duration-200 text-base tracking-wide mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-400">
                    New User? <Link to="/signup" className="text-blue-500 font-medium hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
}
