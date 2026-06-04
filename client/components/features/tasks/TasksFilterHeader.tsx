"use client";

import { FiSearch, FiZap, FiFilter, FiX } from "react-icons/fi";
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
    <header className="w-full bg-white border-b border-[#dfded6]/30 shadow-xs px-6 py-4 flex-shrink-0 select-none">
      <div className="mx-auto app-container flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Title & AI Match Toggler */}
        <div className="flex items-center justify-between lg:justify-start gap-4 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight font-heading">Fırsatlar</h1>
          
          <button
            type="button"
            onClick={viewMode === "recommended" ? setViewAllTasks : fetchRecommendedTasks}
            disabled={isRecommendedLoading}
            className={cn(
              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-extrabold transition-all border tracking-wider uppercase cursor-pointer select-none",
              viewMode === "recommended"
                ? "bg-[#e28743]/10 border-[#e28743]/20 text-[#e28743] hover:bg-[#e28743]/20 shadow-xs"
                : "bg-gray-50 border-gray-250 text-gray-400 hover:text-gray-600 hover:border-gray-300"
            )}
          >
            <FiZap className="w-3 h-3 fill-current animate-pulse" />
            {isRecommendedLoading ? "Eşleşiyor..." : "AI Eşleşme"}
          </button>
        </div>

        {/* Search Input & Filtering options */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-4xl lg:justify-end">
          
          {/* Real-time search bar */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Fırsatlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-250/80 rounded-full bg-gray-50/50 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:border-[#004d40] focus:bg-white transition-all font-semibold text-gray-700 shadow-2xs"
            />
          </div>

          {/* Work Type Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Çalışma:</span>
            {['remote', 'hybrid', 'onsite'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleWorkType(type)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none",
                  selectedWorkTypes.includes(type)
                    ? "bg-[#004d40]/10 border-[#004d40]/30 text-[#004d40] font-black"
                    : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-300"
                )}
              >
                {type === 'remote' ? 'Uzaktan' : type === 'hybrid' ? 'Hibrit' : 'Ofiste'}
              </button>
            ))}
          </div>

          {/* Reward Type Selection */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar shrink-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:inline">Ödül:</span>
            {['Nakit', 'Hediye', 'Deneyim'].map((reward) => (
              <button
                key={reward}
                type="button"
                onClick={() => toggleRewardType(reward)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer select-none",
                  selectedRewardTypes.includes(reward)
                    ? "bg-[#e28743]/10 border-[#e28743]/30 text-[#e28743] font-black"
                    : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-300"
                )}
              >
                {reward}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          {(activeFiltersCount > 0 || searchQuery) && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer select-none shrink-0 flex items-center gap-1 justify-center py-2 px-1"
            >
              <FiX className="w-3.5 h-3.5" />
              Temizle
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
