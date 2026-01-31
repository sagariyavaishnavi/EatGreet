import { Link, Outlet, useParams } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

const KitchenLayout = () => {
    const { restaurantName } = useParams();
    const displayName = restaurantName ? restaurantName.replace(/_/g, ' ').toUpperCase() : 'KITCHEN';

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900">
            {/* Navbar */}
            <nav className="bg-[#F5F5F5] px-8 py-6 flex justify-between items-center sticky top-0 z-50">
                {/* Logo */}
                <div className="flex items-center gap-4">
                    <img src="/nav-logo.svg" alt="EatGreet" className="h-8 w-auto" />
                </div>

                {/* Right Actions - Simple Badge */}
                <div className="flex items-center gap-6">
                    <div className="bg-white rounded-full px-5 py-2 flex items-center gap-2 shadow-sm border border-gray-100">
                        <div className="w-8 h-8 rounded-full bg-red-50 overflow-hidden border border-red-100 flex items-center justify-center text-red-500">
                             <ChefHat className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-700 tracking-wide">{displayName}</span>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="px-8 pb-8 flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default KitchenLayout;
