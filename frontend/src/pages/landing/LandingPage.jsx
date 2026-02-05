import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Users,
    Briefcase,
    ChefHat,
    BarChart3,
    ShieldCheck,
    Globe,
    UtensilsCrossed
} from 'lucide-react';
import heroDashboard from '../../assets/hero-dashboard.png';
import menuIcon from '../../assets/menu-icon.png';
import logoFull from '../../assets/logo-full.png';
import contactIllustrationHD from '../../assets/contact-illustration-hd.png';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';

export default function LandingPage() {
    const { hash } = useLocation();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        businessName: '',
        interestedIn: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleCheckboxChange = (item) => {
        setFormData(prev => ({
            ...prev,
            interestedIn: prev.interestedIn.includes(item)
                ? prev.interestedIn.filter(i => i !== item)
                : [...prev.interestedIn, item]
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Landing page registration is always for creating a NEW Restaurant (Admin)
            // The user request explicitly states "create new folder... create dynamically database"

            if (!formData.businessName) {
                setError('Restaurant/Business Name is required to set up your system.');
                setIsLoading(false);
                return;
            }

            const signupData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                city: formData.city,
                role: 'admin', // Always admin for improved landing page flow
                restaurantName: formData.businessName
            };

            const response = await authAPI.register(signupData);
            const userData = response.data;

            setSuccess('Registration successful! Please login to your dashboard.');

            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src={logoFull} alt="EatGreet Logo" className="h-8 md:h-10 w-auto" />
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                        <a href="#platform" className="hover:text-primary transition-colors">PLATFORM</a>
                        <a href="#ecosystem" className="hover:text-primary transition-colors">ECOSYSTEM</a>
                        <a href="#enterprise" className="hover:text-primary transition-colors">ENTERPRISE</a>
                        <a href="#insights" className="hover:text-primary transition-colors">INSIGHTS</a>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                        <a href="/login" className="text-xs md:text-sm font-bold text-gray-700 hover:text-primary transition-colors">LOGIN</a>
                        <a href="#contact" className="px-4 py-2 md:px-6 md:py-3 bg-primary text-white text-xs md:text-sm font-bold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/30 whitespace-nowrap">
                            GET STARTED
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden">
                <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-[#FFF5F1] md:rounded-bl-[100px] -z-10" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-orange-600 tracking-wide uppercase">v4.0 Global Release</span>
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl leading-[1.1] font-bold">
                            The Future <br className="hidden sm:block" />
                            <span className="text-primary italic pr-2">of Dining,</span> <br className="hidden sm:block" />
                            Today.
                        </h1>

                        <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                            A hyper-connected ecosystem orchestrating every touchpoint. From guest tablets to kitchen displays, and global HQ analytics.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <a href="#contact" className="w-full sm:w-auto text-center px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20">
                                BOOK A DEMO
                            </a>

                        </div>
                    </div>

                    <div className="relative">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            className="relative z-10"
                        >
                            <img src={heroDashboard} alt="Dashboard Interface" className="w-full drop-shadow-2xl rounded-xl md:transform md:perspective-1000 md:rotate-y-minus-12 md:hover:rotate-0 transition-transform duration-500" />
                        </motion.div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-400 rounded-full blur-3xl opacity-20" />
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20" />
                    </div>
                </div>
            </section>

            {/* Unified Experience Section */}
            <section className="py-16 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
                    <span className="text-orange-500 font-bold tracking-widest text-xs uppercase mb-2 block">The Integrated Flow</span>
                    <h2 className="text-3xl md:text-4xl font-bold mb-10 md:mb-16">A Unified Experience</h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { icon: Users, label: "Customer", desc: "Scan, 3D Menu Explore & Seamless Pay", color: "text-orange-500", bg: "bg-orange-50" },
                            { icon: Briefcase, label: "Manager", desc: "Real-time floor tracking & Auto-Staffing", color: "text-blue-500", bg: "bg-blue-50" },
                            { icon: ChefHat, label: "Kitchen", desc: "AI Order Prioritization & Prep Sync", color: "text-purple-500", bg: "bg-purple-50" },
                            { icon: ShieldCheck, label: "Super Admin", desc: "Global Revenue & Supply Intelligence", color: "text-green-500", bg: "bg-green-50" },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="group p-6 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50"
                            >
                                <div className={`w-16 h-16 mx-auto ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-4 text-3xl group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">{feature.label}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Deep Dive Grid */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* AI Sales Reports */}
                        <div className="bg-[#FFF5F1] p-6 md:p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10">
                                <span className="text-orange-500 font-bold text-xs tracking-widest uppercase mb-2 block">Twin Intelligence</span>
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">AI-Driven Sales Reports</h3>
                                <p className="text-gray-600 mb-8 max-w-sm text-sm">Predict demand patterns, identify menu stars, and automate labor costs with 98.4% accuracy.</p>
                                <button className="text-orange-500 font-bold flex items-center gap-2 hover:gap-3 transition-all group-hover:text-orange-600">
                                    ANALYZE NOW <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute right-0 bottom-0 top-20 w-2/3 opacity-80 translate-x-12 translate-y-12 transition-transform group-hover:translate-x-8 group-hover:translate-y-8">
                                {/* Abstract chart representation using CSS */}
                                <div className="w-full h-full bg-white rounded-tl-2xl shadow-xl p-4">
                                    <div className="space-y-3 pt-6">
                                        <div className="h-2 w-3/4 bg-gray-100 rounded" />
                                        <div className="h-2 w-1/2 bg-gray-100 rounded" />
                                        <div className="flex justify-between items-end h-32 mt-8 gap-2">
                                            {[40, 65, 45, 80, 55, 90].map((h, i) => (
                                                <div key={i} style={{ height: `${h}%` }} className="w-full bg-orange-200 rounded-t hover:bg-orange-400 transition-colors" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3D Multimedia Menus */}
                        <div className="bg-primary text-white p-6 md:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 max-w-md">
                                <h3 className="text-2xl md:text-3xl font-bold mb-4">3D Multimedia <br /> Menus</h3>
                                <p className="text-white/80 mb-8 text-sm">Immersive visual dining that increases average order value by 32%.</p>

                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3">
                                        {[1, 2, 3].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-orange-500" />
                                        ))}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide">Active Visualization.js</span>
                                </div>
                            </div>

                            <img src={menuIcon} alt="3D Menu" className="absolute bottom-4 right-4 w-32 md:w-48 opacity-90 drop-shadow-2xl animate-float" />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-3xl flex items-center gap-6 shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 flex-shrink-0">
                                <Globe className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2">Global Revenue Tracking</h4>
                                <p className="text-gray-500 text-sm">Multi-currency, multi-regional synchronization in real-time.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-3xl flex items-center gap-6 shadow-sm border border-gray-100">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 flex-shrink-0">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold mb-2">Enterprise-Grade Security</h4>
                                <p className="text-gray-500 text-sm">Military-grade encryption for every transaction and customer data point.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / CTA Section */}
            <section id="contact" className="py-16 md:py-20 px-4 md:px-6">
                <div className="max-w-7xl mx-auto bg-[#F8F9FA] rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 shadow-sm border border-gray-100">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
                        {/* Left Side: Illustration & Text */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight text-center lg:text-left">We’d Love to answer your questions</h2>
                                <p className="text-gray-500 text-base md:text-lg text-center lg:text-left">Have a query? We'd be happy to answer any questions you might have.</p>
                            </div>
                            <div className="flex justify-center lg:justify-start">
                                <img src={contactIllustrationHD} alt="Contact Illustration" className="w-full max-w-md object-contain" />
                            </div>
                        </div>

                        {/* Right Side: Form */}
                        <div className="bg-transparent">
                            <form className="grid gap-5" onSubmit={handleRegister}>
                                {error && <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm font-bold">{error}</div>}
                                {success && <div className="bg-green-50 text-green-500 p-4 rounded-2xl text-sm font-bold">{success}</div>}

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">Full Name<span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">Email Address<span className="text-red-500">*</span></label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">Password<span className="text-red-500">*</span></label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">Phone no.<span className="text-red-500">*</span></label>
                                        <input
                                            type="tel"
                                            required
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">City<span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="Your City"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-800 ml-1">Business Name (Restaurant)<span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.businessName}
                                            onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                                            className="w-full px-5 py-3.5 bg-[#EAEAEA] border-none rounded-2xl focus:ring-2 focus:ring-orange-200 outline-none transition-all placeholder-gray-400"
                                            placeholder="Your Restaurant Name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 mt-2">
                                    <label className="text-sm font-bold text-gray-800 ml-1">Account Role<span className="text-red-500">*</span></label>
                                    <div className="space-y-2.5">
                                        {['Manager Dashboard', 'Kitchen Dashboard', 'Customer Order', 'Invoice'].map((item) => (
                                            <label key={item} className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.interestedIn.includes(item)}
                                                        onChange={() => handleCheckboxChange(item)}
                                                        className="peer w-5 h-5 border-[1.5px] border-gray-400 rounded focus:ring-0 checked:bg-orange-500 checked:border-orange-500 transition-all appearance-none"
                                                    />
                                                    <svg className="absolute w-3.5 h-3.5 text-white hidden peer-checked:block pointer-events-none left-[3px] top-[3px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
                                                    {item === 'Manager Dashboard' ? 'Register as Restaurant Manager' : item}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic mt-1 font-medium">* Select 'Manager Dashboard' to access restaurant controls, otherwise you'll be a customer.</p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-12 py-3.5 bg-[#FD6941] text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20 text-lg disabled:opacity-70 flex items-center gap-2"
                                    >
                                        {isLoading ? 'Creating Account...' : 'Register Now'} <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-20 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-8">
                    <div className="flex items-center gap-2">
                        <img src={logoFull} alt="EatGreet Logo" className="h-10 w-auto grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                    </div>

                    <div className="flex gap-12">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-widest">Product</h4>
                            <ul className="space-y-2">
                                <li>Menu Management</li>
                                <li>Order Tracking</li>
                                <li>Kitchen Dashboard</li>
                                <li>Sales Reports</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-widest">Ecosystem</h4>
                            <ul className="space-y-2 relative">
                                <li>Manager Portal</li>
                                <li>Kitchen Display</li>
                                <li>Customer App</li>
                                <li>Digital Menu</li>
                            </ul>
                        </div>
                    </div>

                    <div className="text-right">
                        <h4 className="font-bold text-gray-900 mb-2 uppercase tracking-widest">HQ Locations</h4>
                        <p>Singapore • London • New York</p>
                        <p className="mt-2">Global Operations 24/7/365</p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto mt-12 py-6 border-t border-gray-100 flex justify-between text-[10px] text-gray-400 uppercase tracking-widest">
                    <p>© 2024 EatGreet Technologies. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#">Terms</a>
                        <a href="#">Privacy</a>
                        <a href="#">Security</a>
                    </div>
                </div>
            </section>
        </div>
    );
}
