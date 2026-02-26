import { X, MapPin, Clock, Mountain, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// Trek data shape — matches treks.json exactly
interface TrekPreview {
  id: string;
  name: string;
  tier: number;
  region: string;
  country: string;
  terrain: string;
  accommodation: string;
  keyFeatures: string;
  distance: string;
  totalDays: string;
  maxAltitude: string;
  permits: string;
  imageFilename: string;
  season: string;
  popularityScore: number;
}

interface TrekPreviewPanelProps {
  // ✅ NEW: Accepts a single trek OR an array of treks (for clusters)
  trek: TrekPreview | TrekPreview[] | null;
  onClose: () => void;
}

const GITHUB_CDN = 'https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks';

export function TrekPreviewPanel({ trek, onClose }: TrekPreviewPanelProps) {
  const [, setLocation] = useLocation();
  const [imgError, setImgError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Convert single trek to array for unified handling
  const treksArray = Array.isArray(trek) ? trek : (trek ? [trek] : []);
  
  // Reset to first slide whenever the selected treks change
  useEffect(() => {
    setCurrentIndex(0);
    setImgError(false);
  }, [trek]);

  if (treksArray.length === 0) return null;

  const currentTrek = treksArray[currentIndex];
  const isCluster = treksArray.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentIndex((prev) => (prev + 1) % treksArray.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgError(false);
    setCurrentIndex((prev) => (prev - 1 + treksArray.length) % treksArray.length);
  };

  const handleViewFull = () => {
    onClose();
    setLocation(`/trek/${currentTrek.id}`);
  };

  const tierColors: Record<number, string> = {
    1: 'bg-amber-500',
    2: 'bg-slate-400',
    3: 'bg-amber-700'
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[calc(100vh-2rem)] animate-in slide-in-from-left-4 fade-in duration-300">
      
      {/* Hero Image */}
      <div className="relative h-48 bg-slate-100 shrink-0 group">
        <img
          src={imgError ? '/images/placeholder-trek.jpg' : `${GITHUB_CDN}/${currentTrek.imageFilename}.jpg`}
          alt={currentTrek.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* ✅ NEW: Navigation Arrows for Clusters */}
        {isCluster && (
          <>
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10">
              <ChevronLeft className="w-5 h-5 pr-0.5" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10">
              <ChevronRight className="w-5 h-5 pl-0.5" />
            </button>
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
              {currentIndex + 1} of {treksArray.length} Treks
            </div>
          </>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${tierColors[currentTrek.tier] || 'bg-blue-500'} shadow-sm`} />
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
      <div className="p-4 overflow-y-auto bg-white flex-1">
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <Clock className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-800">{currentTrek.totalDays}</p>
            <p className="text-[10px] text-slate-400">Duration</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <Mountain className="w-4 h-4 text-blue-500 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-800">{currentTrek.distance}</p>
            <p className="text-[10px] text-slate-400">Distance</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <span className="text-blue-500 text-xs block mb-0.5">↑</span>
            <p className="text-xs font-semibold text-slate-800">{currentTrek.maxAltitude}</p>
            <p className="text-[10px] text-slate-400">Max Alt</p>
          </div>
        </div>

        {currentTrek.season && (
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
            <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span>{currentTrek.season}</span>
          </div>
        )}

        {currentTrek.keyFeatures && (
          <p className="text-slate-500 text-xs mb-4 line-clamp-2">
            {currentTrek.keyFeatures}
          </p>
        )}

        <button
          onClick={handleViewFull}
          className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group"
        >
          View Full Guide
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
