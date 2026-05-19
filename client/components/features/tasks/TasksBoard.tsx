"use client";

import { useState, useEffect } from "react";
import TaskBrowsingCard from "./TaskBrowsingCard";
import TaskDetail from "./TaskDetail";
import { Task } from "./types";
import { FiSearch, FiZap, FiFilter } from "react-icons/fi";
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

  // Sync selection to first task when task list changes
  useEffect(() => {
    if (tasks.length > 0) {
      // Set to first task if current selected is not in the list
      const exists = tasks.some((t) => t.id === selectedId);
      if (!exists) {
        setSelectedId(tasks[0].id);
      }
    } else {
      setSelectedId(undefined);
    }
  }, [tasks, selectedId]);

  // Real-time client-side filter
  const filteredTasks = tasks.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.company.name.toLowerCase().includes(query) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const selectedTask = tasks.find((t) => t.id === selectedId) ?? filteredTasks[0] ?? tasks[0];

  return (
    <div className="w-full h-[calc(100vh-4.5rem)] bg-[#faf9f6] p-6 overflow-hidden flex items-center justify-center">
      <div className="w-full max-w-6xl h-full bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden flex flex-col md:flex-row">
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
              
              <span className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all cursor-pointer">
                <FiFilter size={13} />
              </span>
            </div>
          </div>

          {/* Real-time search bar */}
          <div className="relative mb-5 flex-shrink-0">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200/80 rounded-xl bg-gray-50/50 text-[12px] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#004d40] focus:border-[#004d40] focus:bg-white transition-all font-medium text-gray-700"
            />
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 no-scrollbar pr-1 pb-8">
            {filteredTasks.length === 0 ? (
              <div className="bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-8 text-center mt-4">
                <p className="text-gray-400 text-xs font-semibold">
                  {viewMode === "recommended"
                    ? "Profil uyumluluğunuza göre henüz eşleşen görev bulunamadı."
                    : "Gösterilecek görev bulunamadı."}
                </p>
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
        <div className="hidden md:flex flex-1 h-full bg-[#faf9f6] overflow-hidden relative">
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


