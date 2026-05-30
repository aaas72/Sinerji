"use client";

import { useState, useEffect } from "react";
import TaskBrowsingCard from "./TaskBrowsingCard";
import { taskService } from "@/services/task.service";
import EmptyState from "@/components/ui/EmptyState";
import TaskDetail from "./TaskDetail";
import { Task } from "./types";
import { FiSearch, FiZap, FiFilter, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";

interface TasksBoardProps {
  tasks: Task[];
  viewMode?: "all" | "recommended";
  setViewAllTasks?: () => void;
  fetchRecommendedTasks?: () => void;
  isRecommendedLoading?: boolean;
}

export default function TasksBoard({
  tasks = [],
  viewMode = "all",
  setViewAllTasks,
  fetchRecommendedTasks,
  isRecommendedLoading = false,
}: TasksBoardProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Interactive Smart Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<string[]>([]);
  const [selectedRewardTypes, setSelectedRewardTypes] = useState<string[]>([]);

  const toggleWorkType = (type: string) => {
    setSelectedWorkTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleRewardType = (reward: string) => {
    setSelectedRewardTypes((prev) =>
      prev.includes(reward) ? prev.filter((r) => r !== reward) : [...prev, reward]
    );
  };

  const resetFilters = () => {
    setSelectedWorkTypes([]);
    setSelectedRewardTypes([]);
    setSearchQuery("");
  };

  const activeFiltersCount = selectedWorkTypes.length + selectedRewardTypes.length;

  // Real-time multi-select client-side filter
  const filteredTasks = tasks.filter((t) => {
    // 1. Keyword search (Title, Company, Tags)
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      t.title.toLowerCase().includes(query) ||
      t.company.name.toLowerCase().includes(query) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(query)));

    // 2. Work environment filter
    const matchesWorkType =
      selectedWorkTypes.length === 0 ||
      selectedWorkTypes.includes(t.workType || "");

    // 3. Reward Type filter
    const matchesReward =
      selectedRewardTypes.length === 0 ||
      selectedRewardTypes.includes(t.rewardType || "");

    return matchesSearch && matchesWorkType && matchesReward;
  });

  // Sync selection to first task when task list changes
  useEffect(() => {
    if (filteredTasks.length > 0) {
      // Set to first task if current selected is not in the filtered list
      const exists = filteredTasks.some((t) => t.id === selectedId);
      if (!exists) {
        setSelectedId(filteredTasks[0].id);
      }
    } else {
      setSelectedId(undefined);
    }
  }, [filteredTasks, selectedId]);

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? filteredTasks[0] ?? tasks[0];

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-[#faf9f6] p-6 overflow-hidden flex items-center justify-center">
      <div className="w-full app-container h-full bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Master Opportunity List */}
        <div className="w-full md:w-[450px] lg:w-[490px] h-full flex flex-col border-r border-[#f1f0ea] bg-white px-6 py-6 overflow-hidden shrink-0">
          
          {/* Header and Toggle */}
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Opportunities</h1>
            
            <div className="flex items-center gap-2">
              {/* AI matching state toggler chip */}
              <button
                type="button"
                onClick={viewMode === "recommended" ? setViewAllTasks : fetchRecommendedTasks}
                disabled={isRecommendedLoading}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold transition-all border tracking-wider uppercase select-none cursor-pointer",
                  viewMode === "recommended"
                    ? "bg-[#e28743]/10 border-[#e28743]/20 text-[#e28743] hover:bg-[#e28743]/20"
                    : "bg-gray-50 border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300"
                )}
              >
                <FiZap className="w-3 h-3 fill-current animate-pulse" />
                {isRecommendedLoading ? "Eşleşiyor..." : "AI Match"}
              </button>
              
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={cn(
                  "w-7 h-7 rounded-full border flex items-center justify-center transition-all cursor-pointer",
                  isFilterOpen || activeFiltersCount > 0
                    ? "border-[#004d40]/30 bg-[#004d40]/10 text-[#004d40]"
                    : "border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                )}
                title="Filtreleri Göster"
              >
                <FiFilter size={13} />
              </button>
            </div>
          </div>

          {/* Real-time search bar */}
          <div className="relative mb-4 flex-shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200/80 rounded-xl bg-gray-50/50 text-[12px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:border-[#004d40] focus:bg-white transition-all font-medium text-gray-700"
            />
          </div>

          {/* Slide-Down smart filter panel */}
          {isFilterOpen && (
            <div className="border border-[#f1f0ea] rounded-xl p-4 mb-4 bg-transparent animate-slideDown flex-shrink-0 select-none">
              {/* Work Type Selection */}
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Çalışma Şekli</p>
                <div className="flex flex-wrap gap-1.5">
                  {['remote', 'hybrid', 'onsite'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleWorkType(type)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer",
                        selectedWorkTypes.includes(type)
                          ? "bg-[#004d40]/10 border-[#004d40]/30 text-[#004d40]"
                          : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-300"
                      )}
                    >
                      {type === 'remote' ? 'Uzaktan' : type === 'hybrid' ? 'Hibrit' : 'Ofiste'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reward Type Selection */}
              <div className="mb-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ödül Türü</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Nakit', 'Hediye', 'Deneyim'].map((reward) => (
                    <button
                      key={reward}
                      type="button"
                      onClick={() => toggleRewardType(reward)}
                      className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer",
                        selectedRewardTypes.includes(reward)
                          ? "bg-[#e28743]/10 border-[#e28743]/30 text-[#e28743]"
                          : "bg-transparent border-gray-200 text-gray-400 hover:border-gray-300"
                      )}
                    >
                      {reward}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={activeFiltersCount === 0 && !searchQuery}
                  className={cn(
                    "text-[10px] font-bold transition-all cursor-pointer",
                    activeFiltersCount > 0 || searchQuery
                      ? "text-red-500 hover:underline"
                      : "text-gray-300"
                  )}
                >
                  Filtreleri Temizle
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen(false)}
                  className="text-[10px] font-bold text-[#004d40] hover:underline cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            </div>
          )}

          {/* Active Filters Row */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-4 flex-shrink-0 select-none">
              <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider mr-1">Filtreler:</span>
              {selectedWorkTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleWorkType(type)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#004d40]/5 border border-[#004d40]/20 text-[#004d40] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer"
                >
                  <span>{type === 'remote' ? 'Uzaktan' : type === 'hybrid' ? 'Hibrit' : 'Ofiste'}</span>
                  <FiX className="w-2.5 h-2.5" />
                </button>
              ))}
              {selectedRewardTypes.map((reward) => (
                <button
                  key={reward}
                  onClick={() => toggleRewardType(reward)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#e28743]/5 border border-[#e28743]/20 text-[#e28743] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all cursor-pointer"
                >
                  <span>{reward}</span>
                  <FiX className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          )}

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar px-2 -mx-2 pb-8 pt-1">
            {filteredTasks.length === 0 ? (
              <div className="mt-4 flex min-h-[250px]">
                <EmptyState 
                  title="Görev Bulunamadı"
                  message={
                    viewMode === "recommended"
                      ? "Profil uyumluluğunuza göre henüz eşleşen görev bulunamadı."
                      : "Filtrelerinize uygun görev bulunamadı."
                  } 
                />
              </div>
            ) : (
              filteredTasks.map((t) => (
                <TaskBrowsingCard
                  key={t.id}
                  task={t}
                  selected={t.id === selectedId}
                  onClick={() => setSelectedId(t.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Spec Detail Pane */}
        <div className="hidden md:flex flex-1 h-full bg-[#F1F0EA] overflow-hidden relative">
          {selectedTask ? (
            <div className="w-full h-full overflow-hidden">
              <TaskDetail task={selectedTask} />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm font-semibold">
              Detayları görüntülemek için bir fırsat seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


