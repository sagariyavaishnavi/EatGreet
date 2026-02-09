
import { Link, Outlet, useParams, useNavigate } from 'react-router-dom';
import { ChefHat, ChevronDown, LogOut } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const KitchenLayout = () => {
    const { restaurantName } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useSettings();
    const displayName = restaurantName ? restaurantName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Kitchen';

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            {/* Navbar */}
            <nav className="bg-[#F5F5F5] px-10 py-8 flex justify-between items-center sticky top-0 z-50">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                    <img src="/nav-logo.svg" alt="EatGreet" className="h-10 w-auto" />
                </Link>

                {/* Right Actions - Profile Dropdown Look */}
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <button className="bg-white rounded-full pl-2 pr-6 py-2 flex items-center gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 transition-all hover:shadow-md group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-400 to-red-500 p-[2px] shadow-inner">
                                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.name || 'Kitchen'}&background=FD6941&color=fff`}
                                        alt="Kitchen Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-base font-bold text-gray-800 tracking-tight">{user?.name || 'Kitchen'}</span>
                                <ChevronDown size={18} className="text-gray-400 group-hover:text-gray-900 transition-colors" />
                            </div>
                        </button>

                        {/* Dropdown for logout */}
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Content Container */}
            <main className="px-10 pb-12 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default KitchenLayout;
