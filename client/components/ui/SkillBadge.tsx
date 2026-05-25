import React from "react";
import { cn } from "@/utils/cn";

type SkillBadgeProps = {
  label: string;
  className?: string;
};

export default function SkillBadge({ label, className }: SkillBadgeProps) {
  return (
    <span
      className={cn(
        "px-3.5 py-1.5 bg-[#f0f5ff] text-[#2c4b75] rounded-full text-[14px] font-medium select-none shrink-0",
        className
      )}
    >
      {label}
    </span>
  );
}
