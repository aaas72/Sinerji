"use client";

import { useState, useEffect } from "react";
import { FiBookmark } from "react-icons/fi";
import { studentService } from "@/services/student.service";
import TaskCard from "@/components/ui/cards/TaskCard";
import { Skeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function SavedTasksPage() {
  const [savedTasks, setSavedTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const fetchSavedTasks = async () => {
    try {
      const data = await studentService.getSavedTasks();
      setSavedTasks(data);
    } catch (error) {
      console.error("Failed to fetch saved tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (taskId: number) => {
    try {
      await studentService.unsaveTask(taskId);
      setSavedTasks(savedTasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error("Failed to unsave task:", error);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-[-0.01em] text-[#00342b] leading-tight">Kaydedilen Görevler</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            Daha sonra başvurmak için kaydettiğiniz görevler
          </p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider select-none bg-transparent">
            <FiBookmark className="w-3.5 h-3.5" />
            <span>{savedTasks.length} Görev Kaydedildi</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-[200px] w-full rounded-2xl" />
        </div>
      ) : savedTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTasks.map((task, idx) => (
            <TaskCard
              key={task.id}
              id={task.id}
              index={idx + 1}
              title={task.title}
              description={task.description}
              date={new Date(task.created_at).toLocaleDateString("tr-TR")}
              companyName={task.company?.company_name || "Şirket Bilgisi Yok"}
              companyId={task.company?.user_id}
              rating={5}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full min-h-[40vh] flex">
          <EmptyState 
            icon={FiBookmark} 
            title="Henüz Kaydedilmiş Görev Yok" 
            message="Daha sonra başvurmak için ilginizi çeken görevleri kaydedebilirsiniz." 
          />
        </div>
      )}
    </div>
  );
}
