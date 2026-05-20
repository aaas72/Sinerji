"use client";

import { useState, useEffect } from "react";
import { FiBookmark } from "react-icons/fi";
import { studentService } from "@/services/student.service";
import TaskCard from "@/components/ui/cards/TaskCard";

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
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight font-heading">Kaydedilen Görevler</h1>
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
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="rounded-2xl border border-[#f1f0ea] overflow-hidden select-none">
          <div className="text-center py-20 bg-transparent">
            <div className="w-16 h-16 bg-transparent border border-[#f1f0ea] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
              <FiBookmark className="w-6 h-6" />
            </div>
            <p className="text-gray-400 text-sm font-semibold">
              Henüz kaydedilmiş bir görev bulunmamaktadır.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
