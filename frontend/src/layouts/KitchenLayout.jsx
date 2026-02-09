
import { Outlet, useParams } from 'react-router-dom';
import DynamicNavbar from '../components/DynamicNavbar';

const KitchenLayout = () => {
    const { restaurantName } = useParams();

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            <DynamicNavbar />

            {/* Content Container */}
            <main className="px-10 pb-12 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default KitchenLayout;
