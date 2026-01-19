import React, { useState } from 'react';
import { Volume2, Moon, Clock, Bell } from 'lucide-react';

const KitchenSettings = () => {
    const [settings, setSettings] = useState({
        soundAlerts: true,
        darkMode: false,
        autoPrint: false,
        prepTimeBuffer: 5
    });

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Display Settings</h1>

            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">

                {/* Sound Alerts */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-500">
                            <Volume2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Sound Alerts</h3>
                            <p className="text-xs text-gray-500">Play sound when new order arrives</p>
                        </div>
                    </div>
                    <div
                        onClick={() => toggle('soundAlerts')}
                        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.soundAlerts ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${settings.soundAlerts ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-purple-500">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Dark Mode</h3>
                            <p className="text-xs text-gray-500">Reduce eye strain in low light</p>
                        </div>
                    </div>
                    <div
                        onClick={() => toggle('darkMode')}
                        className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors duration-300 ${settings.darkMode ? 'bg-purple-500' : 'bg-gray-300'}`}
                    >
                        <div className={`absolute top-1 left-1 bg-white w-5 h-5 rounded-full shadow-sm transition-transform duration-300 ${settings.darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                </div>

                {/* Prep Timer */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Prep Buffer Time</h3>
                            <p className="text-xs text-gray-500">Extra minutes added to estimates</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100">-</button>
                        <span className="font-bold text-gray-800 w-8 text-center">{settings.prepTimeBuffer}m</span>
                        <button className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100">+</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default KitchenSettings;
