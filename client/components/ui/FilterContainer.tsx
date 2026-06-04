import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface FilterContainerProps {
  children: ReactNode;
  className?: string;
}

export default function FilterContainer({ children, className }: FilterContainerProps) {
  return (
    <div
      className={cn(
        "bg-[#F1F0EA] border border-[#dfded6] rounded-[50px] p-4 flex flex-col lg:flex-row items-center gap-4 select-none",
        className
      )}
    >
      {children}
    </div>
  );
}
