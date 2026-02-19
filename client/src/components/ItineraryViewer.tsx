import { useState } from 'react';

type Props = {
  itinerary: any[]; // Or create proper type
};

export default function ItineraryViewer({ itinerary }: Props) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  if (!itinerary || itinerary.length === 0) {
    return (
      <section className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Day-by-Day Itinerary</h2>
        <p className="text-muted-foreground">No itinerary available for this trek.</p>
      </section>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Day-by-Day Itinerary</h2>

      <div className="grid gap-3">
        {itinerary.map(day => {
          const isExpanded = expandedDay === day.day;

          return (
            <div
              key={day.day}
              className="p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setExpandedDay(isExpanded ? null : day.day)}
            >
              {/* Day header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <strong className="block text-lg">
                    Day {day.day}: {day.route}
                  </strong>

                  {/* Stats row */}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {day.distanceKm && day.distanceKm !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-primary">📏</span>
                        {day.distanceKm} km
                      </span>
                    )}
                    {day.distance && day.distance !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-primary">📏</span>
                        {day.distance}
                      </span>
                    )}
                    {day.maxAltM && day.maxAltM !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-primary">⛰️</span>
                        {parseFloat(day.maxAltM).toLocaleString()} m
                      </span>
                    )}
                    {day.maxAltitude && day.maxAltitude !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-primary">⛰️</span>
                        {day.maxAltitude}
                      </span>
                    )}
                    {day.maxAlt && day.maxAlt !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-primary">⛰️</span>
                        {parseFloat(day.maxAlt).toLocaleString()} m
                      </span>
                    )}
                    {day.elevGainM && day.elevGainM !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-green-500">↗</span>
                        +{day.elevGainM} m
                      </span>
                    )}
                    {day.elevGain && day.elevGain !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-green-500">↗</span>
                        +{day.elevGain}
                      </span>
                    )}
                    {day.elevLossM && day.elevLossM !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">↘</span>
                        -{day.elevLossM} m
                      </span>
                    )}
                    {day.elevLoss && day.elevLoss !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-red-500">↘</span>
                        -{day.elevLoss}
                      </span>
                    )}
                    {day.elevChange && day.elevChange !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-blue-500">↕</span>
                        {day.elevChange}
                      </span>
                    )}
                    {day.elevGainLoss && day.elevGainLoss !== "—" && (
                      <span className="flex items-center gap-1">
                        <span className="text-blue-500">↕</span>
                        {day.elevGainLoss} m
                      </span>
                    )}
                  </div>
                </div>

                {/* Expand/collapse indicator */}
                <span className="text-muted-foreground ml-2">
                  {isExpanded ? '−' : '+'}
                </span>
              </div>

              {/* Expandable details */}
              {isExpanded && day.description && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-muted-foreground">{day.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}