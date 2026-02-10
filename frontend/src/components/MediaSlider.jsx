import React, { useState, useEffect } from 'react';
import '@google/model-viewer';
import { ChevronLeft, ChevronRight, Box } from 'lucide-react';

const MediaSlider = ({ media, interval = 30000, className = "", showArButton = true, modelCheckId = null }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showControls, setShowControls] = useState(false);
    const controlsTimerRef = React.useRef(null);

    const handleInteraction = () => {
        setShowControls(true);
        if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        controlsTimerRef.current = setTimeout(() => {
            setShowControls(false);
        }, 3000);
    };

    // Filter valid media just in case
    const validMedia = media?.filter(m => m.url) || [];

    useEffect(() => {
        return () => {
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (currentIndex >= validMedia.length && validMedia.length > 0) {
            setCurrentIndex(0);
        }
    }, [validMedia.length]);

    const isModel = (item) => {
        if (!item) return false;
        return (item.type && item.type.startsWith('model')) ||
            (item.name && item.name.match(/\.(glb|gltf|obj)$/i));
    };

    useEffect(() => {
        if (validMedia.length <= 1) return;

        // If current slide is a 3D model, don't auto-swipe 
        // as it interferes with user interaction (rotation/zoom)
        if (isModel(validMedia[currentIndex])) return;

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % validMedia.length);
        }, interval);

        return () => clearInterval(timer);
    }, [validMedia.length, interval, currentIndex]);

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
        handleInteraction();
    };

    const prevSlide = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + validMedia.length) % validMedia.length);
        handleInteraction();
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setCurrentIndex(index);
        handleInteraction();
    };

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        handleInteraction();
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        // If current slide is a 3D model, disable swipe gesture
        // so user can rotate model without accidentally changing slides
        if (isModel(validMedia[currentIndex])) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Next Slide
            setCurrentIndex((prev) => (prev + 1) % validMedia.length);
        }
        if (isRightSwipe) {
            // Prev Slide
            setCurrentIndex((prev) => (prev - 1 + validMedia.length) % validMedia.length);
        }
    };

    return (
        <div
            className={`relative overflow-hidden w-full h-full group ${className}`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={handleInteraction}
        >
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
                                id={modelCheckId}
                                src={item.url}
                                alt={item.name || '3D Model'}
                                camera-controls
                                auto-rotate
                                ar
                                ar-modes="webxr scene-viewer quick-look"
                                disable-zoom
                                style={{ width: '100%', height: '100%', backgroundColor: '#f9fafb' }}
                                className="w-full h-full object-cover"
                            >
                                <button
                                    slot="ar-button"
                                    className={`absolute top-2 left-2 md:top-4 md:left-4 z-20 w-7 h-7 md:w-9 md:h-9 backdrop-blur rounded-full items-center justify-center shadow-sm bg-white/90 text-gray-800 ${!showArButton ? 'hidden' : 'hidden md:flex'}`}
                                >
                                    <Box className="w-3.5 h-3.5 md:w-5 md:h-5 text-black" />
                                </button>
                            </model-viewer>
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
                    <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                        {validMedia.map((_, index) => (
                            <button
                                key={index}
                                onClick={(e) => goToSlide(index, e)}
                                className={`w-1.5 h-1.5 rounded-full transition-all shadow-sm ${index === currentIndex ? 'bg-white w-3.5' : 'bg-white/40 hover:bg-white/60'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={prevSlide}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/10 text-white rounded-full transition-all backdrop-blur-md border border-white/10 shadow-sm ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 flex items-center justify-center bg-white/10 text-white rounded-full transition-all backdrop-blur-md border border-white/10 shadow-sm ${showControls ? 'opacity-100' : 'opacity-0'}`}
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </>
            )}
        </div>
    );
};

export default MediaSlider;
