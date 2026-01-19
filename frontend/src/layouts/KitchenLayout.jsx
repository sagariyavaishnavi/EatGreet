import { Link, Outlet, useLocation } from 'react-router-dom';
import { ChefHat, Settings, User } from 'lucide-react';

const KitchenLayout = () => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                        <ChefHat className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">Kitchen Display</span>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        to="/kitchen"
                        className={`font-medium text-sm transition-colors ${location.pathname === '/kitchen' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        Orders
                    </Link>
                    <Link
                        to="/kitchen/profile"
                        className={`font-medium text-sm transition-colors flex items-center gap-1 ${location.pathname === '/kitchen/profile' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link
                        to="/kitchen/settings"
                        className={`font-medium text-sm transition-colors flex items-center gap-1 ${location.pathname === '/kitchen/settings' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        <Settings className="w-4 h-4" /> Settings
                    </Link>
                </div>
            </nav>

            {/* Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default KitchenLayout;
