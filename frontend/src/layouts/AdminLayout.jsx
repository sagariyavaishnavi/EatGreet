import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto px-[30px] py-6 w-full">
                {/* Global Dashboard Title for all admin pages or specific per page - 
                    The design shows "Dashboard" text BELOW the header. 
                    So we let outlet handle the content including titles.
                */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-[30px] py-6 w-full no-scrollbar">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
