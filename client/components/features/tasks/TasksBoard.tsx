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
  searchQuery: string;
  selectedWorkTypes: string[];
  selectedRewardTypes: string[];
}

export default function TasksBoard({
  tasks = [],
  viewMode = "all",
  setViewAllTasks,
  fetchRecommendedTasks,
  isRecommendedLoading = false,
  searchQuery,
  selectedWorkTypes,
  selectedRewardTypes,
}: TasksBoardProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

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
    <div className="w-full flex-1 min-h-0 bg-[#faf9f6] p-6 overflow-hidden flex items-center justify-center">
      <div className="w-full app-container h-full bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden flex flex-col md:flex-row">
        {/* Left Column: Master Opportunity List */}
        <div className="w-full md:w-[450px] lg:w-[490px] h-full flex flex-col border-r border-[#f1f0ea] bg-white px-6 py-6 overflow-hidden shrink-0">
          
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


