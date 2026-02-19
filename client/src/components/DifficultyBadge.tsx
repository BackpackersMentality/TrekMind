import { cn } from "@/lib/utils";
import { Mountain, Gauge, Activity } from "lucide-react";

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function DifficultyBadge({ difficulty, className, size = "md" }: DifficultyBadgeProps) {
  // Normalize difficulty string
  const level = difficulty.toLowerCase();

  const config = {
    easy: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: Mountain },
    moderate: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: Activity },
    hard: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: Gauge },
    expert: { color: "bg-red-100 text-red-800 border-red-200", icon: Gauge },
  };

  const current = config[level as keyof typeof config] || config.moderate;
  const Icon = current.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-3 py-1 gap-1.5",
    lg: "text-base px-4 py-1.5 gap-2",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border shadow-sm",
        current.color,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(
        size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"
      )} />
      {difficulty}
    </span>
  );
}
