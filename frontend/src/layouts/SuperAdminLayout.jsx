import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from '../components/super-admin/SuperAdminNavbar';

const SuperAdminLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-[#F0F2F4]">
            <SuperAdminNavbar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-[30px] py-6 w-full no-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default SuperAdminLayout;
