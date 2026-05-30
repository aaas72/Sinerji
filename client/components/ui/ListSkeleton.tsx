import React from "react";
import { Skeleton } from "./Skeleton";

interface ListSkeletonProps {
  count?: number;
  variant?: "card" | "row";
}

export default function ListSkeleton({ count = 3, variant = "card" }: ListSkeletonProps) {
  return (
    <div className={`w-full ${variant === "card" ? "space-y-4" : "flex flex-col"}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`flex items-center gap-4 bg-white p-4 ${
            variant === "card" 
              ? "rounded-xl border border-[#DFDED6]" 
              : "border-b border-[#DFDED6] last:border-0"
          }`}
        >
          <Skeleton className="w-12 h-12 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-1/3 h-5" />
            <Skeleton className="w-1/4 h-3" />
          </div>
          <div className="hidden sm:block">
            <Skeleton className="w-20 h-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
