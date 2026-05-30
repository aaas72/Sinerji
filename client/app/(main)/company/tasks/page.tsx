"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyTaskCard from '@/components/features/tasks/CompanyTaskCard';
import ListSkeleton from "@/components/ui/ListSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import Link from "next/link";
import { FiPlus, FiBriefcase } from "react-icons/fi";
import Tabs from "@/components/ui/Tabs";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Tümü");
  const tabs = ["Tümü", "Açık", "İnceleniyor", "Devam Eden", "Tamamlanan"];

  const filterMap: Record<string, string> = {
    Açık: "open",
    İnceleniyor: "review",
    "Devam Eden": "in_progress",
    Tamamlanan: "closed",
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getCompanyTasks();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDelete = async (taskId: number) => {
    if (confirm("Bu görevi silmek istediğinize emin misiniz?")) {
      try {
        await taskService.deleteTask(taskId);
        setTasks(tasks.filter((t) => t.id !== taskId));
      } catch (error) {
        console.error("Failed to delete task", error);
        alert("Görev silinirken bir hata oluştu.");
      }
    }
  };

  const filteredTasks =
    activeTab === "Tümü"
      ? tasks
      : tasks.filter((t) => t.status === filterMap[activeTab]);

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      
      {/* ── Tabs & Grid Content ── */}
      <div className="flex flex-col gap-6">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          rightAction={
            <div className="shrink-0 pb-3">
              <PrimaryButton href="/company/tasks/new" icon={FiPlus}>
                Yeni Görev
              </PrimaryButton>
            </div>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full">
              <ListSkeleton count={4} />
            </div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <CompanyTaskCard
                key={task.id}
                title={task.title}
                description={task.description || ""}
                date={new Date(task.deadline || task.id).toLocaleDateString()}
                status={
                  task.status === "open"
                    ? "Open"
                    : task.status === "in_progress"
                    ? "In Progress"
                    : task.status === "closed"
                    ? "Completed"
                    : task.status === "review"
                    ? "Review"
                    : "Open"
                }
                applicantCount={task._count?.submissions || 0}
                onEdit={() => router.push(`/company/tasks/${task.id}/edit`)}
                onDelete={() => handleDelete(task.id)}
                onViewApplicants={() =>
                  router.push(`/company/tasks/${task.id}/applicants`)
                }
                onViewDetails={() =>
                  router.push(`/company/tasks/${task.id}/details`)
                }
              />
            ))
          ) : (
            <div className="col-span-full min-h-[300px] flex">
              <EmptyState 
                icon={FiBriefcase} 
                title="Görev Bulunmuyor" 
                message="Seçtiğiniz kategoride şirketiniz tarafından eklenmiş bir görev bulunmamaktadır." 
              />
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
