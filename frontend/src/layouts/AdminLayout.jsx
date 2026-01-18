import { Outlet } from 'react-router-dom';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 max-w-[1600px] mx-auto w-full">
                {/* Global Dashboard Title for all admin pages or specific per page - 
                    The design shows "Dashboard" text BELOW the header. 
                    So we let outlet handle the content including titles.
                */}
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
