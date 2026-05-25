"use client";

import { cn } from "@/utils/cn";

interface LevelSliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
  hideLabel?: boolean;
}

export default function LevelSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
}: LevelSliderProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-full cursor-pointer focus:outline-none"
          style={{ accentColor: "#004d40" }}
        />
        <div className="flex items-center gap-2 min-w-[40px] justify-end">
          <span className="text-sm font-bold text-gray-700">
            {value}/{max}
          </span>
        </div>
      </div>
    </div>
  );
}
