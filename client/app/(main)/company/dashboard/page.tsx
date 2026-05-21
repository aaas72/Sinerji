"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBriefcase,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiPlus,
  FiArrowRight,
  FiCalendar,
  FiAlertCircle,
  FiTrendingUp,
} from "react-icons/fi";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/cards/StatCard";
import ActiveTaskCard from "@/components/ui/cards/ActiveTaskCard";
import CompanyWelcomeHero from "@/components/ui/sections/CompanyWelcomeHero";

interface DashboardStats {
  activeTasks: number;
  totalTasks: number;
  totalApplications: number;
  pendingApplications: number;
  hiredStudents: number;
  recentTasks: {
    id: number;
    title: string;
    status: string;
    created_at: string;
    _count: { submissions: number };
  }[];
  recentApplications: {
    id: number;
    status: string;
    submitted_at: string;
    task: { title: string };
    student: { full_name: string; user: { email: string } };
  }[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; hasDot?: boolean; dotCls?: string }> = {
    open: { label: "Aktif", cls: "bg-[#065043]/10 text-[#065043]", hasDot: true, dotCls: "bg-[#065043]" },
    closed: { label: "Kapalı", cls: "bg-[#3f4945]/15 text-[#3f4945]" },
    pending: { label: "Bekliyor", cls: "bg-[#e28743]/10 text-[#e28743]", hasDot: true, dotCls: "bg-[#e28743] animate-pulse" },
    accepted: { label: "Kabul Edildi", cls: "bg-[#065043]/10 text-[#065043]", hasDot: true, dotCls: "bg-[#065043]" },
    rejected: { label: "Reddedildi", cls: "bg-[#ffdad6] text-[#93000a]" },
    hired: { label: "İşe Alındı", cls: "bg-[#065043]/10 text-[#065043]", hasDot: true, dotCls: "bg-[#065043]" },
  };
  const cfg = map[status?.toLowerCase()] ?? { label: status, cls: "bg-[#dce9ff] text-[#3f4945]" };
  return (
    <span className={`px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-[0.05em] leading-[16px] shrink-0 inline-flex items-center gap-1.5 ${cfg.cls}`}>
      {cfg.hasDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotCls}`} />
      )}
      {cfg.label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function CompanyDashboardPage() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          companyService.getMyProfile(),
          companyService.getMyStats(),
        ]);
        setProfile(p);
        setStats(s);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !profile || !stats) {
    return (
      <div className="flex flex-col items-center gap-3 min-h-[40vh] justify-center text-[#565e74]">
        <FiAlertCircle className="w-8 h-8 text-red-400" />
        <p>Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.hiredStudents / stats.totalTasks) * 100)
      : 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">

      {/* ── Hero Welcome Section ── */}
      <CompanyWelcomeHero companyName={profile.company_name} />

      {/* ── KPI Bar ── */}
      <section className="border border-[#dfded6] rounded-2xl grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#dfded6] mb-16 relative">
        <StatCard
          icon={<FiBriefcase className="text-[#00342b] w-6 h-6" />}
          label="Aktif Görev"
          value={stats.activeTasks}
          subtext={`${stats.totalTasks} toplam`}
          borderless
        />

        <StatCard
          icon={<FiUsers className="text-[#00342b] w-6 h-6" />}
          label="Toplam Başvuru"
          value={stats.totalApplications.toLocaleString("tr-TR")}
          borderless
        />

        <StatCard
          icon={<FiClock className="text-[#e28743] w-6 h-6" />}
          label="Bekleyen Başvuru"
          value={stats.pendingApplications}
          variant="pending"
          borderless
        />

        <StatCard
          icon={<FiCheckCircle className="text-[#065043] w-6 h-6" />}
          label="İşe Alınan"
          value={stats.hiredStudents}
          borderless
        />

        <StatCard
          icon={<FiTrendingUp className="text-[#00342b] w-6 h-6" />}
          label="Başarı Oranı"
          value={`${completionRate}%`}
          borderless
        />
      </section>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

        {/* Left: Recent Applications */}
        <section className="lg:col-span-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30]">Recent Applications</h2>
            <Link href="/company/tasks" className="text-[14px] tracking-[0.01em] font-medium leading-[20px] text-[#00342b] flex items-center gap-1 hover:underline cursor-pointer">
              Tümünü Gör
              <FiArrowRight className="w-[18px] h-[18px]" />
            </Link>
          </div>

          <div className="border border-[#dfded6] rounded-2xl divide-y divide-[#dfded6] relative">
            {stats.recentApplications.length === 0 ? (
              <div className="p-8 text-center text-[#565e74] bg-transparent">
                <FiUsers className="w-12 h-12 text-[#004d40]/10 mx-auto mb-3 animate-pulse" />
                <p className="text-sm font-medium">Henüz başvuru yok</p>
              </div>
            ) : (
              stats.recentApplications.map((app) => {
                const initials = app.student.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <div key={app.id} className="p-4 flex items-center justify-between group transition-all duration-300 ease-out cursor-pointer hover:z-10 hover:bg-white hover:scale-[1.02] bg-transparent border border-transparent hover:border-[#004d40]/50 hover:rounded-2xl hover:shadow-md">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar with fallback initials */}
                      <div className="w-12 h-12 rounded-full bg-[#004d40]/5 border border-[#dfded6] flex items-center justify-center text-[#004d40] font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-[14px] tracking-[0.01em] font-medium leading-[20px] text-[#0b1c30] truncate">{app.student.full_name}</h4>
                        <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74] truncate">{app.task.title}</p>
                      </div>
                    </div>
                    <div className="hidden md:block shrink-0">
                      <div className="flex items-center gap-1 text-[#565e74] text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
                        <FiCalendar className="w-4 h-4 text-[#004d40]/60" />
                        <span>{formatDate(app.submitted_at)}</span>
                      </div>
                    </div>
                    <div>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Visual Synapse Motif Decor */}
          <div className="mt-8 hidden md:block">
            <svg className="opacity-50 stroke-[#f1f0ea] stroke-[0.5] fill-none" height="60" viewBox="0 0 400 60" width="100%">
              <path d="M 0 30 Q 100 0 200 30 T 400 30"></path>
              <circle cx="200" cy="30" fill="#004d40" r="4"></circle>
            </svg>
          </div>
        </section>

        {/* Right: Recent Tasks */}
        <section className="lg:col-span-4">
          <h2 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30] mb-6">Active Tasks</h2>

          <div className="border border-[#dfded6] rounded-2xl divide-y divide-[#dfded6] relative mb-6">
            {stats.recentTasks.length === 0 ? (
              <div className="p-8 text-center text-[#565e74] bg-transparent">
                <FiBriefcase className="w-12 h-12 text-[#004d40]/10 mx-auto mb-3" />
                <p className="text-sm font-medium">Henüz aktif görev yok</p>
                <Link href="/company/tasks/new" className="text-xs text-[#004d40] hover:underline mt-2 inline-block font-semibold">
                  İlk görevi oluştur →
                </Link>
              </div>
            ) : (
              stats.recentTasks.map((task) => (
                <ActiveTaskCard
                  key={task.id}
                  id={task.id}
                  title={task.title}
                  submissionsCount={task._count.submissions}
                  createdAt={task.created_at}
                />
              ))
            )}
          </div>


        </section>

      </div>

    </div>
  );
}
