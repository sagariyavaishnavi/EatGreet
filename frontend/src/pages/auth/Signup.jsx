export default function Signup() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Name</label>
                        <input type="text" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Email</label>
                        <input type="email" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900" placeholder="you@example.com" />
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Account Type</label>
                        <select className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900">
                            <option>Customer</option>
                            <option>Restaurant Staff</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 mb-2">Password</label>
                        <input type="password" className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900" placeholder="••••••••" />
                    </div>
                    <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                        Sign Up
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Already have an account? <a href="/login" className="text-green-600 hover:underline">Login</a>
                </p>
            </div>
        </div>
    );
}
