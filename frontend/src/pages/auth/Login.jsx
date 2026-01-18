import { Link } from 'react-router-dom';

export default function Login() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#EBF2F2] p-4">
            <div className="bg-[#F4F7F7] p-8 md:p-12 rounded-[2.5rem] shadow-xl w-full max-w-md border border-white/50 relative overflow-hidden">
                {/* Subtle background noise/gradient simulation if needed, but solid color works for now */}

                <div className="flex flex-col items-center mb-8">
                    {/* Logo */}
                    <div className="mb-2">
                        <img src="/logo.png" alt="EatGreet Logo" className="w-[180px]" />
                    </div>

                    {/* Removed Text Title as it is likely in the logo image based on the screenshot, IF not, I can add it back.
                        The screenshot showed the text below the logo icon. If the provided image is JUST the icon, I should keep the text.
                        However, usually "logo file" implies the whole lockup. Let's assume the image has the text.
                        Actually, looking at the user instructions "give logo file... use that", I will assume it's the full logo.
                        But just in case, I'll keep the subtitle.
                        Wait, the previous screenshot showed Icon + Text "EatGreet".
                        Let's check the user's uploaded image. I can't "see" it now, but standard practice is:
                        If the logo image is the full lockup, we don't need the h1.
                        Let's assume the logo replaced the icon+text.
                    */}
                    {/* If the image is just the icon, I should have kept the text. Let's be safe and assume the image is the logo mark or full logo.
                        The user said "use that as logo".
                        I will display the image. If it looks small or off, we can adjust.
                    */}
                    <p className="text-gray-500 text-sm mt-2 font-medium">
                        Sign in to manage your restaurant
                    </p>
                </div>

                <form className="space-y-5">
                    <div>
                        <input
                            type="email"
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-inner text-sm"
                            placeholder="Email*"
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            className="w-full px-6 py-3.5 rounded-full bg-[#EAEFEF] border border-gray-200 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all shadow-inner text-sm"
                            placeholder="Password*"
                        />
                    </div>

                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 px-2">
                        <label className="flex items-center cursor-pointer hover:text-gray-700">
                            <input type="checkbox" className="form-checkbox h-4 w-4 text-gray-600 rounded border-gray-300 focus:ring-primary focus:ring-offset-0 mr-2" />
                            <span>Remember me?</span>
                        </label>
                        <a href="#" className="hover:text-gray-700 hover:underline">Forget Password?</a>
                    </div>

                    <button className="w-full bg-black text-white py-4 rounded-full font-semibold shadow-lg hover:translate-y-[-1px] hover:shadow-xl transition-all duration-200 text-sm tracking-wide mt-4">
                        Login
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    New User? <a href="/#contact" className="text-blue-500 font-semibold hover:underline">Register</a>
                </p>
            </div>
        </div>
    );
}
