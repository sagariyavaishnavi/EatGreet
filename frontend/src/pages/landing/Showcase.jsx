export default function Showcase() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 to-blue-500 text-white">
            <h1 className="text-6xl font-bold mb-4">EatGreet</h1>
            <p className="text-2xl mb-8">Experience the future of dining.</p>
            <div className="space-x-4">
                <a href="/login" className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition">
                    Login
                </a>
                <a href="/signup" className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition">
                    Sign Up
                </a>
            </div>
        </div>
    );
}
