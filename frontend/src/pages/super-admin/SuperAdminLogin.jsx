import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function SuperAdminLogin() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authAPI.login({ email, password });
            const userData = response.data;

            if (userData.role !== 'superadmin') {
                toast.error('Access Denied. This portal is for Super Admins only.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userData.role);

            toast.success('Welcome back, Super Admin');
            navigate('/super-admin');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#2C3E50] p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 md:p-12 rounded-[2rem] shadow-2xl w-full max-w-md relative overflow-hidden"
            >
                <div className="flex flex-col items-center mb-8">
                    <h2 className="text-gray-800 font-bold text-2xl mt-2">Super Admin Portal</h2>
                    <p className="text-gray-400 text-sm mt-1 text-center">
                        Secure access for platform management
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all text-sm"
                            placeholder="Super Admin Email"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2C3E50] focus:border-transparent transition-all text-sm"
                            placeholder="Password"
                        />
                    </div>

                    <button
                        disabled={isLoading}
                        className="w-full bg-[#2C3E50] text-white py-4 rounded-full font-bold shadow-lg hover:bg-[#34495E] transition-all duration-200 text-base tracking-wide mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'Secure Login'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
