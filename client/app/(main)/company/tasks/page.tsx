"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CompanyTaskCard from "@/components/ui/cards/CompanyTaskCard";
import Link from "next/link";
import { FiPlus, FiBriefcase } from "react-icons/fi";
import Tabs from "@/components/ui/Tabs";
import Button from "@/components/ui/Button";
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
      
      {/* ── Page Header ── */}
      <header className="relative overflow-hidden rounded-2xl border border-[#dfded6] bg-white p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff4ff] to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40] shrink-0">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[36px] font-extrabold leading-tight text-[#00342b] font-heading">
                Görevlerim
              </h1>
              <p className="text-sm text-[#565e74] font-medium mt-0.5">
                Şirketiniz tarafından oluşturulan tüm aktif ve geçmiş görevleri yönetin
              </p>
            </div>
          </div>
          <Link href="/company/tasks/new" className="shrink-0 self-start sm:self-center">
            <Button
              variant="primary"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#004d40] hover:bg-[#00342b] text-white text-sm font-semibold transition-all shadow-xs"
            >
              <FiPlus />
              Yeni Görev
            </Button>
          </Link>
        </div>
      </header>

      {/* ── Tabs & Grid Content ── */}
      <div className="flex flex-col gap-6">
        <div className="overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            <div className="col-span-full bg-white rounded-2xl border border-[#dfded6] shadow-2xs p-12 text-center text-gray-500">
              <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              Yükleniyor...
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
            <div className="col-span-full bg-white rounded-2xl border border-[#dfded6] shadow-2xs p-12 text-center text-gray-500 flex flex-col items-center justify-center min-h-[250px]">
              <FiBriefcase className="w-12 h-12 text-[#004d40]/10 mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Görev Bulunmuyor</h3>
              <p className="text-xs text-[#565e74] font-medium max-w-xs">
                Seçtiğiniz kategoride şirketiniz tarafından eklenmiş bir görev bulunmamaktadır.
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
