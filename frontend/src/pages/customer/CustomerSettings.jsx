import React, { useState } from 'react';
import { Bell, CreditCard, Clock, Globe, Shield } from 'lucide-react';

const CustomerSettings = () => {
    return (
        <div className="space-y-6 pb-10">
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

            <div className="space-y-4">
                <Section title="Account">
                    <Item icon={Bell} title="Notifications" action="toggle" />
                    <Item icon={Globe} title="Language" value="English" />
                </Section>

                <Section title="Payment">
                    <Item icon={CreditCard} title="Saved Cards" action="arrow" />
                    <Item icon={Clock} title="Order History" action="arrow" />
                </Section>

                <Section title="Legal">
                    <Item icon={Shield} title="Privacy Policy" action="arrow" />
                    <Item icon={Shield} title="Terms of Service" action="arrow" />
                </Section>
            </div>

            <div className="pt-4">
                <button className="w-full bg-red-50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-100 transition-colors">
                    Log Out
                </button>
            </div>
        </div>
    );
};

const Section = ({ title, children }) => (
    <div className="bg-gray-50 rounded-3xl p-5">
        <h2 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider ml-1">{title}</h2>
        <div className="space-y-1">
            {children}
        </div>
    </div>
);

const Item = ({ icon: Icon, title, value, action }) => {
    const [isOn, setIsOn] = useState(true);

    return (
        <div className="bg-white p-3 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black">
                    <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 text-sm">{title}</span>
            </div>

            <div className="flex items-center gap-2">
                {value && <span className="text-xs font-bold text-gray-400">{value}</span>}
                {action === 'toggle' && (
                    <div onClick={() => setIsOn(!isOn)} className={`w-10 h-6 rounded-full relative transition-colors ${isOn ? 'bg-green-500' : 'bg-gray-200'}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isOn ? 'translate-x-4' : 'translate-x-0'}`}></div>
                    </div>
                )}
                {action === 'arrow' && (
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerSettings;
