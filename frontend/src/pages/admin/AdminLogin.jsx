import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
        if (email === 'admin@gmail.com' && password === 'admin') {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', 'admin');
            navigate('/admin');
        } else {
            setError('Invalid email or password');
        }
        setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden p-8 md:p-12">
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Eat<span className="text-primary">Greet</span></h2>
            <p className="text-gray-500">Sign in to manage your restaurant</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg text-center">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="email"
                        placeholder="admin@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-blue-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 border-transparent transition-all"
                        required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="password"
                        placeholder="•••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-blue-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 border-transparent transition-all"
                        required
                    />
                </div>
            </div>

            <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-500 cursor-pointer">
                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                    Remember me?
                </label>
                <button type="button" className="text-gray-500 hover:text-gray-700">Forget Password?</button>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center text-sm text-gray-500">
                New User? <button type="button" className="text-blue-500 font-medium hover:underline">Register</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
