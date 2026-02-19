import { useState } from 'react';
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Ruler, Mountain, Calendar, ArrowRight } from "lucide-react";
import { getTrekImageUrl } from '@/lib/images';

export function TrekCard({ trek }: { trek: any }) {
  const [imgError, setImgError] = useState(false);

  return (
    <Link href={`/trek/${trek.id}`} className="group block h-full">
      <Card className="overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Header: Trek Name */}
        <div className="p-4 border-b bg-card/50">
          <h3 className="text-lg font-bold truncate group-hover:text-primary transition-colors">
            {trek.name}
          </h3>
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wider">
            <MapPin className="w-3 h-3" />
            {trek.region}, {trek.country}
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={imgError ? '/images/placeholder-trek.jpg' : getTrekImageUrl(trek.imageFilename)} 
            alt={trek.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm text-black border-none text-[10px]">
              {trek.terrain}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-primary-foreground text-[10px] uppercase tracking-wider">
              <Calendar className="w-3 h-3 mr-1" /> {trek.season || trek.best_season || "Year Round"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Clock className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Days</span>
              <span className="text-xs font-bold">{trek.totalDays}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Ruler className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">KM</span>
              <span className="text-xs font-bold">{trek.distance}</span>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30 border border-border/50 text-center">
              <Mountain className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Max Alt</span>
              <span className="text-xs font-bold">{trek.maxAltitude || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center justify-end text-primary text-xs font-bold group-hover:translate-x-1 transition-transform">
            View Journey <ArrowRight className="w-3 h-3 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
