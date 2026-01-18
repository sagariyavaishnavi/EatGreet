export default function SuperAdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <h1 className="text-4xl font-bold text-red-500 mb-8">Super Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Total Restaurants</h3>
                    <p className="text-3xl text-red-400">12</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">System Health</h3>
                    <p className="text-3xl text-green-400">98%</p>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-2">Active Users</h3>
                    <p className="text-3xl text-blue-400">1,240</p>
                </div>
            </div>
        </div>
    );
}
