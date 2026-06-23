"use client";

import { useState, useEffect } from "react";
import TaskBrowsingCard from "./TaskBrowsingCard";
import { taskService } from "@/services/task.service";
import EmptyState from "@/components/ui/EmptyState";
import TaskDetail from "./TaskDetail";
import { Task } from "./types";
import { FiSearch, FiZap, FiFilter, FiX } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { studentService } from "@/services/student.service";
import { useAuthStore } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { useLazyRender } from "@/hooks/useLazyRender";
import InfiniteScrollTrigger from "@/components/ui/InfiniteScrollTrigger";

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
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  // Load saved task IDs on mount
  useEffect(() => {
    if (user?.role === "student") {
      studentService
        .getSavedTasks()
        .then((savedTasks) => {
          setSavedIds(savedTasks.map((t: any) => t.id.toString()));
        })
        .catch(console.error);
    }
  }, [user?.role]);

  // Handle toggling bookmark from the browsing card
  const handleToggleSaveFromCard = async (taskId: string) => {
    if (user?.role !== "student") {
      showToast("Sadece öğrenciler görev kaydedebilir.", "error");
      return;
    }
    const isCurrentlySaved = savedIds.includes(taskId);
    const numericTaskId = Number(taskId);
    try {
      if (isCurrentlySaved) {
        await studentService.unsaveTask(numericTaskId);
        setSavedIds((prev) => prev.filter((id) => id !== taskId));
        showToast("Görev kaydedilenlerden çıkarıldı.", "success");
      } else {
        await studentService.saveTask(numericTaskId);
        setSavedIds((prev) => [...prev, taskId]);
        showToast("Görev başarıyla kaydedildi!", "success");
      }
    } catch (error) {
      showToast("Bir hata oluştu.", "error");
    }
  };

  // Sync state when detail toggles bookmark
  const handleToggleSaveStateOnly = (taskId: string) => {
    setSavedIds((prev) => {
      if (prev.includes(taskId)) {
        return prev.filter((id) => id !== taskId);
      } else {
        return [...prev, taskId];
      }
    });
  };

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

  const { visibleItems: visibleTasks, hasMore, loadMore } = useLazyRender(filteredTasks, 10);

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

  const selectedTask = filteredTasks.find((t) => t.id === selectedId) ?? filteredTasks[0];

  return (
    <div className="w-full bg-[#faf9f6] px-6 py-2 flex items-start justify-center">
      <div className="w-full app-container bg-white rounded-t-none rounded-b-2xl rounded-bl-2xl rounded-br-2xl border border-[#dfded6] shadow-2xs flex flex-col md:flex-row items-start">
        {/* Left Column: Master Opportunity List */}
        <div className="w-full md:w-[450px] lg:w-[490px] flex flex-col border-r border-[#dfded6] bg-white px-6 py-6 shrink-0 rounded-bl-2xl">
          
          {/* Scrollable list */}
          <div className="space-y-4 px-2 -mx-2 pb-8 pt-1">
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
              <>
                {visibleTasks.map((t) => (
                  <TaskBrowsingCard
                    key={t.id}
                    task={t}
                    selected={t.id === selectedId}
                    onClick={() => setSelectedId(t.id)}
                    isSaved={savedIds.includes(t.id)}
                    onToggleSave={() => handleToggleSaveFromCard(t.id)}
                  />
                ))}
                <InfiniteScrollTrigger onTrigger={loadMore} hasMore={hasMore} />
              </>
            )}
          </div>
        </div>

        {/* Right Column: Spec Detail Pane */}
        <div className="hidden md:flex flex-1 sticky top-16 h-[calc(100vh-64px)] bg-[#F1F0EA] overflow-hidden relative rounded-br-2xl rounded-tr-none">
          {selectedTask ? (
            <div className="w-full h-full overflow-hidden">
              <TaskDetail 
                task={selectedTask} 
                isSaved={savedIds.includes(selectedTask.id)}
                onToggleSave={() => handleToggleSaveStateOnly(selectedTask.id)}
              />
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
