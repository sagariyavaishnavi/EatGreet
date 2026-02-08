import React, { useState, useEffect } from 'react';
import '@google/model-viewer';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MediaSlider = ({ media, interval = 30000, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter valid media just in case
    const validMedia = media?.filter(m => m.url) || [];

    useEffect(() => {
        if (currentIndex >= validMedia.length && validMedia.length > 0) {
            setCurrentIndex(0);
        }
    }, [validMedia.length]);

    useEffect(() => {
        if (validMedia.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % validMedia.length);
        }, interval);

        return () => clearInterval(timer);
    }, [validMedia.length, interval]);

    if (validMedia.length === 0) {
        return (
            <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-xs">No Image</span>
            </div>
        );
    }

    const nextSlide = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % validMedia.length);
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + validMedia.length) % validMedia.length);
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setCurrentIndex(index);
    };

    return (
        <div className={`relative overflow-hidden w-full h-full group ${className}`}>
            <div 
                className="flex w-full h-full transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {validMedia.map((item, index) => (
                    <div
                        key={index}
                        className="w-full h-full flex-shrink-0"
                    >
                        {item.type && item.type.startsWith('video') ? (
                            <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                muted
                                loop
                                autoPlay
                                playsInline
                            />
                        ) : (item.type && item.type.startsWith('model')) || (item.name && item.name.match(/\.(glb|gltf|obj)$/i)) ? (
                            <model-viewer
                                src={item.url}
                                alt={item.name || '3D Model'}
                                camera-controls
                                auto-rotate
                                ar
                                shadow-intensity="1"
                                style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={item.url}
                                alt={item.name || 'Slide'}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Dots if more than 1 item */}
            {validMedia.length > 1 && (
                <>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {validMedia.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => goToSlide(index, e)}
                                className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${index === currentIndex ? 'bg-white w-3' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
    );
};

export default MediaSlider;
