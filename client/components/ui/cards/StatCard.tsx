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
};

export default function StatCard({
  value,
  label,
  icon,
  subtext,
  variant = "default",
  borderless = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-6 flex flex-col justify-between transition-all duration-300 ease-out w-full h-full cursor-pointer hover:z-10",
        borderless
          ? "bg-transparent hover:bg-white hover:scale-[1.05] hover:rounded-2xl"
          : cn(
              "rounded-xl border hover:scale-[1.03] hover:shadow-md",
              variant === "pending" ? "border-[#e28743]" : "border-[#f1f0ea]"
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


