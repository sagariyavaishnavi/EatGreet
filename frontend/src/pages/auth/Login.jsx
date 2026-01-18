import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate API call and check credentials
        setTimeout(() => {
            if (email === 'admin@gmail.com' && password === 'admin') {
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', 'admin');
                navigate('/admin');
            } else {
                // Determine if it's potentially another user or just invalid
                // For now, just show invalid credentials as we only have admin wired up
                setError('Invalid email or password');
            }
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBF2F2] p-4">
            <div className="bg-[#F4F7F7] p-8 md:p-12 rounded-[2.5rem] shadow-xl w-full max-w-md border border-white/50 relative overflow-hidden">
                {/* Subtle background noise/gradient simulation if needed, but solid color works for now */}

                <div className="flex flex-col items-center mb-8">
                    {/* Logo */}
                    <div className="mb-2">
                        <img src="/logo.png" alt="EatGreet Logo" className="w-[180px]" />
                    </div>
                
                    <p className="text-gray-500 text-sm mt-2 font-medium">
                        Sign in to manage your restaurant
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    <div>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-inner text-sm"
                            placeholder="Email*"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-inner text-sm"
                            placeholder="Password*"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 px-2">
                        <label className="flex items-center cursor-pointer hover:text-gray-700">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-primary focus:ring-offset-0 mr-2" />
                            <span>Remember me?</span>
                        </label>
                        <a href="#" className="hover:text-gray-700 hover:underline">Forget Password?</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-lg hover:translate-y-[-1px] hover:shadow-xl transition-all duration-200 text-sm tracking-wide mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    New User? <a href="/signup" className="text-blue-500 font-semibold hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}
