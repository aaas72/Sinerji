"use client";

import React from "react";
import { useGlobalLoader } from "@/hooks/useGlobalLoader";
import SynergyLoader from "@/components/ui/SynergyLoader";

export default function GlobalLoaderOverlay() {
  const { isLoading, message, subMessage } = useGlobalLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#faf9f6]/90 backdrop-blur-lg transition-opacity duration-300">
      <div className="w-48 h-48 mb-2 -mt-8">
        <SynergyLoader />
      </div>
      <h3 className="text-sm font-semibold text-[#004d40] font-heading relative z-10 -mt-6 tracking-wide">
        {message}
      </h3>
      {subMessage && (
        <p className="text-xs text-[#004d40]/80 mt-1.5 font-medium">
          {subMessage}
        </p>
      )}
    </div>
  );
}
