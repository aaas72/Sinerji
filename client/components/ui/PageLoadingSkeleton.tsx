import React from "react";
import { Skeleton } from "./Skeleton";

export default function PageLoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#F1F0EA] p-6 rounded-2xl border border-[#DFDED6] shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
          <div className="space-y-3 w-full md:w-48">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Skeleton className="w-full md:w-24 h-10 rounded-lg" />
          <Skeleton className="w-full md:w-24 h-10 rounded-lg" />
        </div>
      </div>

      {/* Content Body Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#F1F0EA] p-6 rounded-2xl border border-[#DFDED6] shadow-sm space-y-4">
            <Skeleton className="w-1/3 h-7 mb-6" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-5/6 h-4" />
            <Skeleton className="w-4/5 h-4" />
            <br />
            <Skeleton className="w-full h-32 rounded-xl" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#F1F0EA] p-6 rounded-2xl border border-[#DFDED6] shadow-sm space-y-4">
            <Skeleton className="w-1/2 h-6 mb-4" />
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="w-16 h-6 rounded-full" />
              <Skeleton className="w-20 h-6 rounded-full" />
              <Skeleton className="w-14 h-6 rounded-full" />
              <Skeleton className="w-24 h-6 rounded-full" />
            </div>
          </div>
          <div className="bg-[#F1F0EA] p-6 rounded-2xl border border-[#DFDED6] shadow-sm space-y-4">
            <Skeleton className="w-1/2 h-6 mb-4" />
            <Skeleton className="w-full h-12 rounded-lg" />
            <Skeleton className="w-full h-12 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
