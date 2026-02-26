import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, Mountain, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface TrekPreviewPanelProps {
  trek: any | any[] | null;
  onClose: () => void;
}

const GITHUB_CDN = 'https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks';

export function TrekPreviewPanel({ trek, onClose }: TrekPreviewPanelProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [imgError, setImgError] = useState(false);

  // Unify everything into an array
  const treksArray = Array.isArray(trek) ? trek : (trek ? [trek] : []);

  useEffect(() => {
    setCurrentIndex(0);
    setDirection(0);
    setImgError(false);
  }, [trek]);

  if (treksArray.length === 0) return null;

  const currentTrek = treksArray[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < treksArray.length - 1;

  const paginate = (newDirection: number) => {
    const newIndex = currentIndex + newDirection;
    if (newIndex >= 0 && newIndex < treksArray.length) {
      setDirection(newDirection);
      setCurrentIndex(newIndex);
      setImgError(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[calc(100vh-2rem)]">
      
      {/* ❌ Close Button sits outside the animated div so it doesn't slide */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors z-50"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 🚀 Swiping Navigation Arrows */}
      {treksArray.length > 1 && (
        <>
          {hasPrevious && (
            <button onClick={() => paginate(-1)} className="absolute left-2 top-[90px] w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-50">
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
          )}
          {hasNext && (
            <button onClick={() => paginate(1)} className="absolute right-2 top-[90px] w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-50">
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>
          )}
        </>
      )}

      {/* 🎬 Framer Motion Sliding Container */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
          className="flex flex-col h-full w-full"
        >
          {/* Hero Image */}
          <div className="relative h-48 bg-slate-100 shrink-0">
            <img
              src={imgError ? '/images/placeholder-trek.jpg' : `${GITHUB_CDN}/${currentTrek.imageFilename}.jpg`}
              alt={currentTrek.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <div className="absolute bottom-3 left-3 right-3">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full shadow-sm ${currentTrek.tier === 1 ? 'bg-amber-500' : currentTrek.tier === 2 ? 'bg-slate-400' : 'bg-amber-700'}`} />
                <h3 className="text-lg font-bold text-white leading-tight truncate">
                  {currentTrek.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-slate-200 text-xs font-medium">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{currentTrek.region}, {currentTrek.country}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto bg-white flex-1 pb-10">
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800">{currentTrek.totalDays}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Mountain className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-800">{currentTrek.distance}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-blue-500 text-xs block mb-0.5">↑</span>
                <p className="text-xs font-semibold text-slate-800">{currentTrek.maxAltitude}</p>
              </div>
            </div>

            {currentTrek.keyFeatures && (
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                {currentTrek.keyFeatures}
              </p>
            )}

            <button
              onClick={() => {
                onClose();
                setLocation(`/trek/${currentTrek.id}`);
              }}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
            >
              View Full Guide
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 🔵 Progress Dots (Bottom Center) */}
      {treksArray.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-50">
          {treksArray.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-blue-500 w-4' : 'bg-slate-300 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
