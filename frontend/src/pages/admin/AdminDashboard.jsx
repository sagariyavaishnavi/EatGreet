export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-8">Restaurant Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 font-medium">Daily Sales</h3>
                    <p className="text-3xl font-bold text-gray-800">$1,200</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 font-medium">Orders Today</h3>
                    <p className="text-3xl font-bold text-gray-800">45</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 font-medium">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600">5</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
                    <h3 className="text-gray-500 font-medium">Staff Active</h3>
                    <p className="text-3xl font-bold text-green-600">8</p>
                </div>
            </div>
        </div>
    );
}
