import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../utils/api';

export default function Login() {
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

            if (userData.role === 'super-admin') {
                navigate('/super-admin');
            } else if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/customer/menu');
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
                        <img src="/logo-v.svg" alt="EatGreet Logo" className="w-[180px]" />
                    </div>
                    <p className="text-gray-500 text-sm mt-2 font-medium text-center">
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
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-inner text-sm"
                            placeholder="Email (e.g. admin@eatgreet.com)*"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all shadow-inner text-sm"
                            placeholder="Password (e.g. admin)*"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 px-2">
                        <label className="flex items-center cursor-pointer hover:text-gray-700">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-black focus:ring-offset-0 mr-2" />
                            <span>Remember me?</span>
                        </label>
                        <a href="#" className="hover:text-gray-700 hover:underline">Forget Password?</a>
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-lg hover:translate-y-[-1px] hover:shadow-xl transition-all duration-200 text-sm tracking-wide mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    New User? <Link to="/signup" className="text-blue-500 font-semibold hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
}
