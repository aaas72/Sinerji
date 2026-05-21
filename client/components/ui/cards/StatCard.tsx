import React from "react";
import { cn } from "@/utils/cn";

type StatCardProps = {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  subtext?: string;
  variant?: "default" | "pending";
  className?: string;
};

export default function StatCard({
  value,
  label,
  icon,
  subtext,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-xl border flex flex-col justify-between transition-all duration-300",
        variant === "pending"
          ? "bg-[#e28743]/5 border-[#e28743]/20 animate-pulse"
          : "bg-white border-[#f1f0ea] hover:shadow-md",
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
            variant === "pending" ? "text-[#e28743]" : "text-[#565e74]"
          )}
        >
          {label}
        </p>
      </div>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30]">
          {value}
        </span>
        {subtext && (
          <span className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#00342b]">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

