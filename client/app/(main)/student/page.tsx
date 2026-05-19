"use client";
import { useState, useEffect } from "react";
import SearchFilter, { SearchFilters } from "@/components/ui/SearchFilter";
import TasksBoard from "@/components/features/tasks/TasksBoard";
import { Task } from "@/components/features/tasks/types";
import { taskService } from "@/services/task.service";
import { studentService } from "@/services/student.service";
import { useAuthStore } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import Button from "@/components/ui/Button";
import {
  FiCheckCircle,
  FiRefreshCw,
  FiZap,
} from "react-icons/fi";

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

export default function StudentDashboard() {
  interface User {
    full_name?: string;
    // add other user properties if needed
  }
  const { user, _hasHydrated } = useAuthStore() as { user: User; _hasHydrated: boolean };
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recommendedTasks, setRecommendedTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecommendedLoading, setIsRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState("");
  const [viewMode, setViewMode] = useState<"all" | "recommended">("all");
  const [error, setError] = useState("");

  const mapBackendTask = (t: any): Task => ({
    id: t.id.toString(),
    title: t.title,
    tags: t.requiredSkills.map((s: any) => s.skill.name),
    rewardAmount: t.reward_amount || undefined,
    rewardType: t.reward_type || undefined,
    company: { id: t.company_user_id, name: t.company.company_name },
    createdAtLabel: t.created_at
      ? new Date(t.created_at).toLocaleDateString("tr-TR")
      : "Yeni",
    description: t.description || "",
    detailTitle: t.detail_title || "Görev Detayları",
    detailBody: t.detail_body || t.description || "",
    location: t.location || undefined,
    workType: t.work_type || undefined,
    matchPercentage: typeof t.matchPercentage === "number" ? t.matchPercentage : undefined,
    matchExplanation: t.matchExplanation || undefined,
    matchReasons: t.matchReasons || undefined,
  });

  useEffect(() => {
    fetchTasks();
    studentService
      .getMyStats()
      .then(setStats)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // لا تعرض أي شيء حتى يتم التأكد من حالة المصادقة
  if (!_hasHydrated) {
    return null;
  }

  const name = user?.full_name || "Öğrenci";

  const fetchTasks = async (filters?: SearchFilters) => {
    setIsLoading(true);
    try {
      const backendTasks = await taskService.getTasks({
        search: filters?.keyword,
        category: filters?.category,
      });
      setTasks(backendTasks.map(mapBackendTask));
    } catch (err) {
      console.error(err);
      setError("Görevler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendedTasks = async () => {
    setIsRecommendedLoading(true);
    setRecommendedError("");

    try {
      const backendTasks = await taskService.getRecommendedTasks();
      setRecommendedTasks(backendTasks.map(mapBackendTask));
      setViewMode("recommended");
    } catch (err) {
      console.error(err);
      setRecommendedError("AI eşleşen görevler alınamadı. Profil ve mikroservis bağlantısını kontrol edin.");
    } finally {
      setIsRecommendedLoading(false);
    }
  };

  // Duplicate useEffect removed to avoid calling hooks conditionally

  const handleSearch = (filters: SearchFilters) => {
    setViewMode("all");
    fetchTasks(filters);
  };

  const visibleTasks = viewMode === "recommended" ? recommendedTasks : tasks;

  if (isLoading && tasks.length === 0)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="w-full h-full bg-[#faf9f6]">
      {recommendedError && (
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
            {recommendedError}
          </p>
        </div>
      )}
      <TasksBoard
        tasks={visibleTasks}
        viewMode={viewMode}
        setViewAllTasks={() => setViewMode("all")}
        fetchRecommendedTasks={fetchRecommendedTasks}
        isRecommendedLoading={isRecommendedLoading}
      />
    </div>
  );
}
