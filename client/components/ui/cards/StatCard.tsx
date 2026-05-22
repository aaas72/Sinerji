import React from "react";
import { cn } from "@/utils/cn";

type StatCardProps = {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  subtext?: string;
  variant?: "default" | "pending";
  borderless?: boolean;
  className?: string;
  theme?: "light" | "glass";
};

export default function StatCard({
  value,
  label,
  icon,
  subtext,
  variant = "default",
  borderless = false,
  className,
  theme = "light",
}: StatCardProps) {
  const isGlass = theme === "glass";
  return (
    <div
      className={cn(
        "p-6 flex flex-col justify-between transition-all duration-300 ease-out w-full h-full cursor-pointer hover:z-10",
        borderless
          ? `bg-transparent border border-transparent ${isGlass ? 'hover:bg-white/10 hover:backdrop-blur-md hover:border-white/20 hover:rounded-2xl' : 'hover:bg-white hover:bg-gradient-to-br hover:from-[#004d40]/[0.045] hover:to-[#ffd54f]/[0.075] hover:border-[#004d40]/50 hover:shadow-md hover:rounded-none'} hover:scale-[1.05]`
          : cn(
            "rounded-xl border hover:scale-[1.03] hover:shadow-md",
            isGlass ? "border-white/20 hover:border-white/40" : (variant === "pending" ? "border-[#e28743] hover:border-[#004d40]/50" : "border-[#dfded6] hover:border-[#004d40]/50")
          ),
        className
      )}
    >
      <div>
        <div className="mb-4">
          {icon}
        </div>
        <p
          className={cn(
            "text-[12px] tracking-[0.05em] font-semibold leading-[16px]",
            isGlass ? "text-white/70" : (variant === "pending" ? "text-[#e28743]" : "text-[#565e74]")
          )}
        >
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className={cn("text-[32px] tracking-[-0.01em] font-semibold leading-[40px]", isGlass ? "text-white" : "text-[#0b1c30]")}>
          {value}
        </span>
        {subtext && (
          <span className={cn("text-[12px] tracking-[0.05em] font-semibold leading-[16px]", isGlass ? "text-white/60" : "text-[#00342b]")}>
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}


