import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MediaSlider = ({ media, interval = 30000, className = "" }) => {
    const [indices, setIndices] = useState({ current: 0, previous: 0 });

    // Filter valid media just in case
    const validMedia = media?.filter(m => m.url) || [];

    useEffect(() => {
        if (validMedia.length <= 1) return;

        const timer = setInterval(() => {
            setIndices(prev => ({
                previous: prev.current,
                current: (prev.current + 1) % validMedia.length
            }));
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
        setIndices(prev => ({
            previous: prev.current,
            current: (prev.current + 1) % validMedia.length
        }));
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        setIndices(prev => ({
            previous: prev.current,
            current: (prev.current - 1 + validMedia.length) % validMedia.length
        }));
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setIndices(prev => ({
            previous: prev.current,
            current: index
        }));
    };

    return (
        <div className={`relative overflow-hidden w-full h-full group ${className}`}>
            {validMedia.map((item, index) => {
                let statusClass = 'opacity-0 z-0';
                if (index === indices.current) {
                    statusClass = 'opacity-100 z-10';
                } else if (index === indices.previous) {
                    statusClass = 'opacity-100 z-0';
                }

                return (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${statusClass}`}
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
                );
            })}

            {/* Navigation Dots if more than 1 item */}
            {validMedia.length > 1 && (
                <>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {validMedia.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => goToSlide(index, e)}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${index === indices.current ? 'bg-white w-3' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </>
            )}
        </div>
    );
};

export default MediaSlider;
