import { X, MapPin, Clock, Mountain, ChevronRight, Calendar } from 'lucide-react';
import { useState } from 'react';
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
  trek: TrekPreview | null;
  onClose: () => void;
}

const GITHUB_CDN = 'https://raw.githubusercontent.com/BackpackersMentality/TrekMind-Images/main/treks';

export function TrekPreviewPanel({ trek, onClose }: TrekPreviewPanelProps) {
  const [, setLocation] = useLocation();
  const [imgError, setImgError] = useState(false);

  if (!trek) return null;

  const handleViewFull = () => {
    onClose();
    setLocation(`/trek/${trek.id}`);
  };

  const tierColors: Record<number, string> = {
    1: 'bg-amber-500',
    2: 'bg-blue-500',
    3: 'bg-slate-500',
  };

  return (
    <>
      {/* Invisible backdrop — click to dismiss */}
      <div
        className="absolute inset-0 z-30"
        onClick={onClose}
      />

      {/* Preview card */}
      <div className="absolute bottom-0 left-0 right-0 z-40 p-3 md:left-auto md:right-4 md:bottom-4 md:w-80 lg:w-96">
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()} // Don't close when clicking the card itself
        >
          {/* Hero image */}
          <div className="relative w-full h-44">
            <img
              src={
                imgError
                  ? 'https://via.placeholder.com/400x200?text=Trek+Image'
                  : `${GITHUB_CDN}/${trek.imageFilename}.jpg`
              }
              alt={trek.name}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />

            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              aria-label="Close preview"
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Tier badge */}
            <div className={`absolute top-3 left-3 px-2.5 py-1 ${tierColors[trek.tier] || 'bg-slate-500'} text-white text-xs font-bold rounded-full`}>
              Tier {trek.tier}
            </div>
          </div>

          {/* Info section */}
          <div className="p-4">
            {/* Name */}
            <h2 className="text-lg font-bold text-slate-900 leading-snug mb-1">
              {trek.name}
            </h2>

            {/* Country + Region */}
            <div className="flex items-center gap-1.5 text-slate-500 text-sm mb-3">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
              <span>{trek.country}{trek.region ? ` · ${trek.region}` : ''}</span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Clock className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                <p className="text-xs font-semibold text-slate-800">{trek.totalDays}</p>
                <p className="text-[10px] text-slate-400">Duration</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <Mountain className="w-3.5 h-3.5 text-blue-500 mx-auto mb-0.5" />
                <p className="text-xs font-semibold text-slate-800">{trek.distance}</p>
                <p className="text-[10px] text-slate-400">Distance</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 text-center">
                <span className="text-blue-500 text-xs block mb-0.5">↑</span>
                <p className="text-xs font-semibold text-slate-800">{trek.maxAltitude}</p>
                <p className="text-[10px] text-slate-400">Max Alt</p>
              </div>
            </div>

            {/* Season */}
            {trek.season && (
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-2">
                <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <span>{trek.season}</span>
              </div>
            )}

            {/* Key features */}
            {trek.keyFeatures && (
              <p className="text-slate-500 text-xs mb-4 line-clamp-2">
                {trek.keyFeatures}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleViewFull}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              View Full Trek
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}