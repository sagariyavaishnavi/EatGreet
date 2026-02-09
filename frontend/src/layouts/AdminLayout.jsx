import { Outlet } from 'react-router-dom';
import DynamicNavbar from '../components/DynamicNavbar';

const AdminLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <DynamicNavbar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-[30px] py-6 w-full no-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
