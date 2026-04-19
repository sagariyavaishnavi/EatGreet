import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DynamicNavbar from '../components/DynamicNavbar';
import { useSettings } from '../context/SettingsContext';

const AdminLayout = () => {
    const location = useLocation();
    const { user, isLocked, lockType, logout } = useSettings();
    const pathEnd = location.pathname.split('/').pop();

    // Pages that should stay fixed (no scroll) - desktop dashboard mainly
    // On mobile, ALL pages need to be scrollable for good UX
    const isDashboard = pathEnd === 'admin';
    
    // These pages always get scroll (content can be taller than viewport)
    const isScrollablePage = true; // All admin pages should be scrollable for mobile compatibility

    useEffect(() => {
        // Always allow scroll - critical for mobile/tablet responsiveness
        document.body.style.overflowY = 'auto';
        document.body.style.overflowX = 'hidden';
        document.body.style.touchAction = 'auto';
        document.body.style.overscrollBehavior = 'auto';
        document.documentElement.style.overflowY = 'auto';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.overscrollBehavior = 'auto';

        return () => {
            document.body.style.overflowY = '';
            document.body.style.overflowX = '';
            document.body.style.touchAction = '';
            document.body.style.overscrollBehavior = '';
            document.documentElement.style.overflowY = '';
            document.documentElement.style.overflowX = '';
            document.documentElement.style.overscrollBehavior = '';
        };
    }, [location.pathname]);

    // Prevent image dragging globally in admin
    const handleDragStart = (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    };

    return (
        <div
            className="min-h-screen bg-gray-50 select-none flex flex-col"
            onDragStart={handleDragStart}
            style={{ WebkitUserDrag: 'none' }}
        >
            <DynamicNavbar />
            <main className="flex-1 px-4 sm:px-6 lg:px-[30px] pt-2 pb-6 sm:py-6 w-full">
                <Outlet />
            </main>

            {isLocked && user?.role === 'admin' && (
                <div className="fixed inset-0 z-[999999] bg-white/40 backdrop-blur-3xl flex items-center justify-center p-6 text-center overflow-hidden">
                    {/* Background decorative elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FD6941]/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />

                    <div className="max-w-lg w-full bg-white/80 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border border-white/60 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#FD6941] to-orange-400" />
                        
                        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                            <div className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping opacity-20" />
                            <svg className="w-12 h-12 text-rose-500 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <h2 className="text-4xl font-medium text-gray-900 mb-6 tracking-tight">
                            {lockType === 'ban' ? 'Access Suspended' : 'Subscription Expired'}
                        </h2>
                        
                        <p className="text-gray-500 font-normal text-base leading-relaxed mb-12 px-4">
                            {lockType === 'ban'
                                ? "Your dashboard access has been suspended by the administration due to policy violations or pending verification. Please contact support for assistance."
                                : `Your access to the EatGreet Dashboard has been paused. Renew your ${user?.subscription?.plan || 'current'} plan today to restore your restaurant's digital operations.`
                            }
                        </p>

                        <div className="space-y-4">
                            {lockType !== 'ban' && (
                                <button
                                    onClick={() => window.location.href = '/activate-plan'}
                                    className="w-full py-5 bg-[#FD6941] text-white rounded-[2rem] font-medium text-base shadow-xl shadow-[#FD6941]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group/btn"
                                >
                                    Renew Subscription Now
                                    <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            )}
                            
                            <button
                                onClick={() => window.location.href = `mailto:support@eatgreet.com?subject=${lockType === 'ban' ? 'Account Suspension Inquiry' : 'Billing Assistance'}`}
                                className={`w-full py-5 ${lockType === 'ban' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'} rounded-[2rem] font-medium text-base hover:opacity-90 active:scale-95 transition-all`}
                            >
                                {lockType === 'ban' ? 'Contact Support' : 'Talk to Support'}
                            </button>

                            <button 
                                onClick={logout}
                                className="text-xs text-gray-400 font-medium uppercase tracking-widest hover:text-gray-600 transition-colors mt-6 underline underline-offset-8"
                            >
                                Switch Account Or Logout
                            </button>
                        </div>
                    </div>

                    <div className="absolute bottom-12 flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.4em]">Verified By</span>
                        <h1 className="text-2xl font-medium text-gray-400 mt-2 opacity-50 tracking-tighter">EatGreet</h1>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;

