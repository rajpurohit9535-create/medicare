"use client";

import {
  Pill,
  Utensils,
  Droplet,
  Footprints,
  Bed,
  Phone,
  Sun,
  Sparkles,
  Bath,
  Tv,
  Heart,
  Check,
  LucideIcon,
} from "lucide-react";

export const taskIconMap: Record<
  string,
  { label: string; icon: LucideIcon }
> = {
  pill: { label: "Medicine", icon: Pill },
  utensils: { label: "Meal / Food", icon: Utensils },
  droplet: { label: "Water / Drink", icon: Droplet },
  walk: { label: "Walk / Exercise", icon: Footprints },
  bed: { label: "Rest / Nap", icon: Bed },
  phone: { label: "Call Family", icon: Phone },
  sun: { label: "Wake Up", icon: Sun },
  toothbrush: { label: "Brush Teeth", icon: Sparkles },
  shower: { label: "Shower / Bath", icon: Bath },
  tv: { label: "TV / Music", icon: Tv },
  heart: { label: "Gentle Care", icon: Heart },
  check: { label: "General Task", icon: Check },
};

interface IconPickerProps {
  value: string;
  onChange: (iconKey: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
      {Object.entries(taskIconMap).map(([key, { label, icon: Icon }]) => {
        const isSelected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer touch-manipulation text-center select-none ${
              isSelected
                ? "border-[#2E7D32] bg-green-50 ring-2 ring-[#2E7D32] text-[#2E7D32]"
                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
            }`}
          >
            <Icon className="w-6 h-6 shrink-0" />
            <span className="text-xs font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function RenderTaskIcon({
  iconKey,
  className = "w-6 h-6",
}: {
  iconKey: string;
  className?: string;
}) {
  const item = taskIconMap[iconKey] || taskIconMap.check;
  const Icon = item.icon;
  return <Icon className={className} />;
}

