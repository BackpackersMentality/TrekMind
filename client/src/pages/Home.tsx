import { useState, useMemo } from "react";
import { getAllTreks } from "../lib/treks";
import { TrekCard } from "@/components/TrekCard";
import { Map, LayoutGrid, Info } from "lucide-react";
import { useFilterStore } from "@/store/useFilterStore";
import { filterTreks } from "@/lib/filterTreks";
import { GlobeIntegration } from "@/components/GlobeIntegration";

export default function Home() {
  const treks = useMemo(() => getAllTreks(), []);
  const [viewMode, setViewMode] = useState<"globe" | "cards">("globe");

  const { 
    tier, region, duration, difficulty, accommodation 
  } = useFilterStore();

  const filters = useMemo(() => ({ tier, region, duration, difficulty, accommodation }), [tier, region, duration, difficulty, accommodation]);

  const filteredTreks = useMemo(() => {
    return filterTreks(treks as any[], filters as any);
  }, [treks, filters]);

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Top Banner / Brand Header */}
      <header className="bg-foreground text-background py-6 px-4 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
        <div className="absolute inset-0 bg-black/50 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-xl md:text-3xl font-display font-bold mb-1 tracking-tight text-white drop-shadow-lg">
            TrekMind
          </h1>
          <p className="text-xs md:text-sm text-white/85 max-w-xl mx-auto font-light leading-relaxed">
            Discover the world's most breathtaking trekking routes.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 relative">
        {/* View Toggle Button */}
        <button 
          onClick={() => setViewMode(viewMode === "globe" ? "cards" : "globe")} 
          className="absolute top-4 left-4 z-50 px-4 py-2 rounded-full bg-background/20 backdrop-blur-md border border-white/20 text-white text-sm font-medium shadow-lg hover:bg-background/30 transition-all flex items-center gap-2"
          data-testid="button-view-toggle"
        >
          {viewMode === "globe" ? <LayoutGrid className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {viewMode === "globe" ? "View Cards" : "View Globe"}
        </button>

        {/* Globe Container */}
        {viewMode === "globe" && (
          <GlobeIntegration height="85vh" className="animate-in fade-in duration-500" />
        )}

        {/* Trek Cards View Container */}
        {viewMode === "cards" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
              {filteredTreks.map((trek: any, index: number) => (
                <div key={trek.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-backwards" style={{ animationDelay: `${index * 50}ms` }}>
                  <TrekCard trek={trek} />
                </div>
              ))}
              
              {filteredTreks.length === 0 && (
                <div className="col-span-full py-20 text-center" data-testid="text-no-results">
                  <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-foreground">No treks match your filters.</h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6 shrink-0 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="font-display font-bold text-sm mb-1 text-foreground">TrekMind</p>
          <p className="text-[10px] text-muted-foreground">© 2024 TrekMind. Adventure responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
