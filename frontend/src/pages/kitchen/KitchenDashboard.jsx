export default function KitchenDashboard() {
    return (
        <div className="min-h-screen bg-orange-50 p-8">
            <h1 className="text-4xl font-bold text-orange-700 mb-8">Kitchen Display System</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mock Order Card */}
                <div className="bg-white border-l-4 border-red-500 shadow-md p-4 rounded text-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Order #1023</span>
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded">Pending</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                        <li>2x Burger Classic</li>
                        <li>1x Fries (Large)</li>
                        <li>1x Coke</li>
                    </ul>
                    <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600">Start Preparing</button>
                </div>

                <div className="bg-white border-l-4 border-yellow-500 shadow-md p-4 rounded text-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-lg">Order #1024</span>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded">Cooking</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                        <li>1x Caesar Salad</li>
                        <li>1x Mushroom Pasta</li>
                    </ul>
                    <button className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Mark Ready</button>
                </div>
            </div>
        </div>
    );
}
