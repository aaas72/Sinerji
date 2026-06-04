"use client";

import { FiSearch, FiZap, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";

interface TasksFilterHeaderProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedWorkTypes: string[];
  toggleWorkType: (type: string) => void;
  selectedRewardTypes: string[];
  toggleRewardType: (reward: string) => void;
  resetFilters: () => void;
  viewMode: "all" | "recommended";
  setViewAllTasks: () => void;
  fetchRecommendedTasks: () => void;
  isRecommendedLoading: boolean;
}

export default function TasksFilterHeader({
  searchQuery,
  setSearchQuery,
  selectedWorkTypes,
  toggleWorkType,
  selectedRewardTypes,
  toggleRewardType,
  resetFilters,
  viewMode,
  setViewAllTasks,
  fetchRecommendedTasks,
  isRecommendedLoading,
}: TasksFilterHeaderProps) {
  const activeFiltersCount = selectedWorkTypes.length + selectedRewardTypes.length;

  return (
    <div className="w-full bg-transparent px-6 pt-6 pb-2 flex-shrink-0 select-none">
      <div className="mx-auto app-container flex flex-col gap-4">
        {/* Top Title & AI match Row */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-[#00342b] font-heading">Fırsatları Keşfet</h1>
          
          <button
            type="button"
            onClick={viewMode === "recommended" ? setViewAllTasks : fetchRecommendedTasks}
            disabled={isRecommendedLoading}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold transition-all border tracking-wider uppercase cursor-pointer select-none shadow-md",
              viewMode === "recommended"
                ? "bg-gradient-to-r from-[#e28743] to-[#f09653] border-none text-white shadow-[#e28743]/20"
                : "bg-white/50 border-[#bfc9c4]/50 text-gray-500 hover:text-gray-800 hover:bg-white hover:border-[#00342b]"
            )}
          >
            <FiZap className={cn("w-3.5 h-3.5 fill-current", viewMode === "recommended" ? "text-white animate-pulse" : "text-[#e28743]")} />
            {isRecommendedLoading ? "Eşleşiyor..." : "AI Eşleşen Görevler"}
          </button>
        </div>

        {/* Unified Sinerji Filter Bar */}
        <div className="bg-white/50 border border-[#dfded6] rounded-[50px] p-4 flex flex-col lg:flex-row items-center gap-4">
          
          {/* Search Field */}
          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
            <input
              type="text"
              placeholder="Fırsat veya yetenek ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-[#bfc9c4]/50 border rounded-full pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none text-xs font-semibold text-[#3f465c] transition-all placeholder-gray-400"
            />
          </div>

          {/* Work type filters */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar shrink-0 w-full lg:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline mr-1">Çalışma Şekli:</span>
            {['remote', 'hybrid', 'onsite'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleWorkType(type)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer select-none",
                  selectedWorkTypes.includes(type)
                    ? "bg-[#00342b] border-[#00342b] text-white"
                    : "bg-white/50 border-[#bfc9c4]/50 text-gray-500 hover:border-[#00342b] hover:text-[#00342b]"
                )}
              >
                {type === 'remote' ? 'Uzaktan' : type === 'hybrid' ? 'Hibrit' : 'Ofiste'}
              </button>
            ))}
          </div>

          {/* Reward type filters */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar shrink-0 w-full lg:w-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:inline mr-1">Ödül Türü:</span>
            {['Nakit', 'Hediye', 'Deneyim'].map((reward) => (
              <button
                key={reward}
                type="button"
                onClick={() => toggleRewardType(reward)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer select-none",
                  selectedRewardTypes.includes(reward)
                    ? "bg-[#e28743] border-[#e28743] text-white"
                    : "bg-white/50 border-[#bfc9c4]/50 text-gray-500 hover:border-[#e28743] hover:text-[#e28743]"
                )}
              >
                {reward}
              </button>
            ))}
          </div>

          {/* Clear Actions */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <div className="lg:ml-auto w-full lg:w-auto flex justify-end shrink-0">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full lg:w-auto bg-transparent border-0 outline-none text-[#565e74]/70 hover:text-[#00342b] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-2 px-1"
              >
                <FiX className="w-4 h-4 text-current" />
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
