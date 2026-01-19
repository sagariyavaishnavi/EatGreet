import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MediaSlider = ({ media, interval = 30000, className = "" }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter valid media just in case
    const validMedia = media?.filter(m => m.url) || [];

    useEffect(() => {
        if (validMedia.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % validMedia.length);
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

    return (
        <div className={`relative overflow-hidden w-full h-full group ${className}`}>
            {validMedia.map((item, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
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
                    ) : (
                        <img
                            src={item.url}
                            alt={item.name || 'Slide'}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            ))}

            {/* Navigation Dots if more than 1 item */}
            {validMedia.length > 1 && (
                <>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {validMedia.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(index);
                                }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MediaSlider;
