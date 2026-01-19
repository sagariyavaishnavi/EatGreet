import React from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminNavbar from '../components/super-admin/SuperAdminNavbar';

const SuperAdminLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <SuperAdminNavbar />
            <main className="flex-1 px-[30px] py-6 w-full overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default SuperAdminLayout;
