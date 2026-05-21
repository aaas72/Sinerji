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
  FiLayers,
  FiCpu,
} from "react-icons/fi";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import Button from "@/components/ui/Button";

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
  const map: Record<string, { label: string; cls: string }> = {
    open:     { label: "Aktif",      cls: "bg-[#065043]/10 text-[#065043]" },
    closed:   { label: "Kapalı",    cls: "bg-[#3f4945]/15 text-[#3f4945]" },
    pending:  { label: "Bekliyor",  cls: "bg-[#dce9ff] text-[#3f4945]" },
    accepted: { label: "Kabul Edildi", cls: "bg-[#065043]/10 text-[#065043]" },
    rejected: { label: "Reddedildi",   cls: "bg-[#ffdad6] text-[#93000a]" },
    hired:    { label: "İşe Alındı", cls: "bg-[#065043]/10 text-[#065043]" },
  };
  const cfg = map[status?.toLowerCase()] ?? { label: status, cls: "bg-[#dce9ff] text-[#3f4945]" };
  return (
    <span className={`px-4 py-1 rounded-full text-[12px] font-semibold tracking-[0.05em] leading-[16px] shrink-0 ${cfg.cls}`}>
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
      <section className="mb-16 p-8 rounded-[24px] relative overflow-hidden bg-gradient-to-br from-[#004d40] to-[#0f172a] text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743] opacity-10 blur-3xl rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] mb-1">
              Hoş Geldiniz, {profile?.company_name}
            </h1>
            <p className="text-[16px] font-normal leading-[24px] text-[#94d3c1]">
              Manage your job postings, student applications, and recruitment pipelines.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.05em] font-semibold leading-[16px] opacity-80">
              <FiClock className="w-4 h-4" />
              <span>Son güncelleme: 21 Mayıs 2026</span>
            </div>
          </div>
          <Link href="/company/tasks/new" className="shrink-0 self-start md:self-center mt-4 md:mt-0">
            <button className="bg-[#afefdd] hover:bg-[#94d3c1] text-[#00201a] px-6 py-4 rounded-full text-[14px] tracking-[0.01em] font-medium leading-[20px] flex items-center gap-2 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer">
              <FiPlus className="w-4 h-4" />
              Yeni Görev Oluştur
            </button>
          </Link>
        </div>
      </section>

      {/* ── KPI Bar ── */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-16">
        {/* Aktif Görev */}
        <div className="bg-white p-6 rounded-xl border border-[#f1f0ea] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <FiBriefcase className="text-[#00342b] w-6 h-6 mb-4" />
            <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">Aktif Görev</p>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30]">{stats.activeTasks}</span>
            <span className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#00342b]">{stats.totalTasks} toplam</span>
          </div>
        </div>

        {/* Toplam Başvuru */}
        <div className="bg-white p-6 rounded-xl border border-[#f1f0ea] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <FiUsers className="text-[#00342b] w-6 h-6 mb-4" />
            <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">Toplam Başvuru</p>
          </div>
          <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30] mt-2">{stats.totalApplications.toLocaleString("tr-TR")}</span>
        </div>

        {/* Bekleyen Başvuru */}
        <div className="bg-[#e28743]/5 p-6 rounded-xl border border-[#e28743]/20 shadow-xs animate-pulse flex flex-col justify-between">
          <div>
            <FiClock className="text-[#e28743] w-6 h-6 mb-4" />
            <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#e28743]">Bekleyen Başvuru</p>
          </div>
          <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30] mt-2">{stats.pendingApplications}</span>
        </div>

        {/* İşe Alınan */}
        <div className="bg-white p-6 rounded-xl border border-[#f1f0ea] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <FiCheckCircle className="text-[#065043] w-6 h-6 mb-4" />
            <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">İşe Alınan</p>
          </div>
          <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30] mt-2">{stats.hiredStudents}</span>
        </div>

        {/* Başarı Oranı */}
        <div className="bg-white p-6 rounded-xl border border-[#f1f0ea] shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <FiTrendingUp className="text-[#00342b] w-6 h-6 mb-4" />
            <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">Başarı Oranı</p>
          </div>
          <span className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] text-[#0b1c30] mt-2">{completionRate}%</span>
        </div>
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

          <div className="flex flex-col gap-4">
            {stats.recentApplications.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#f1f0ea] text-center text-[#565e74]">
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
                  <div key={app.id} className="bg-white p-4 rounded-xl border border-[#f1f0ea] flex items-center justify-between group hover:border-[#004d40] transition-all hover:scale-[1.01]">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Avatar with fallback initials */}
                      <div className="w-12 h-12 rounded-full bg-[#004d40]/5 border border-[#f1f0ea] flex items-center justify-center text-[#004d40] font-bold text-sm shrink-0">
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
          <div className="flex flex-col gap-6">
            {stats.recentTasks.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-[#f1f0ea] text-center text-[#565e74]">
                <FiBriefcase className="w-12 h-12 text-[#004d40]/10 mx-auto mb-3" />
                <p className="text-sm font-medium">Henüz aktif görev yok</p>
                <Link href="/company/tasks/new" className="text-xs text-[#004d40] hover:underline mt-2 inline-block font-semibold">
                  İlk görevi oluştur →
                </Link>
              </div>
            ) : (
              stats.recentTasks.map((task) => {
                const progressWidth = Math.min(100, Math.max(15, (task._count.submissions / 10) * 100));
                const isClosed = task.status?.toLowerCase() === "closed";
                const statusCls = isClosed 
                  ? "bg-[#dae2fd] text-[#5c647a]"
                  : "bg-[#004d40] text-[#7ebdac]";
                const statusText = isClosed ? "Reviewing" : "Active";

                return (
                  <Link key={task.id} href={`/company/tasks/${task.id}/details`} className="block group">
                    <div className="bg-white p-6 rounded-xl border border-[#f1f0ea] shadow-xs relative overflow-hidden hover:border-[#004d40] transition-all hover:scale-[1.01]">
                      <span className={`px-2 py-0.5 rounded-lg text-[12px] font-semibold tracking-[0.05em] leading-[16px] inline-block mb-4 ${statusCls}`}>
                        {statusText}
                      </span>
                      <h3 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30] mb-2 group-hover:text-[#004d40] transition-colors line-clamp-1">{task.title}</h3>
                      <div className="flex items-center gap-6 text-[#565e74] mb-4">
                        <div className="flex items-center gap-1 text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
                          <FiUsers className="w-[18px] h-[18px]" />
                          <span>{task._count.submissions} başvuru</span>
                        </div>
                        <div className="flex items-center gap-1 text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
                          <FiClock className="w-[18px] h-[18px]" />
                          <span>{formatDate(task.created_at)}</span>
                        </div>
                      </div>
                      <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00342b] h-full transition-all duration-500" style={{ width: `${progressWidth}%` }}></div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}

            {/* AI Match Indicator Preview (Smart Matching) */}
            <div className="mt-2 p-6 bg-[#e5eeff] rounded-xl border border-[#004d40]/20 flex flex-col items-center justify-center text-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#00342b] bg-[#00342b]/10 flex items-center justify-center shrink-0">
                  <FiLayers className="text-[#00342b] w-6 h-6" />
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-[#e28743] bg-[#e28743]/10 flex items-center justify-center shrink-0">
                  <FiCpu className="text-[#e28743] w-6 h-6" />
                </div>
              </div>
              <div>
                <h4 className="text-[14px] tracking-[0.01em] font-medium leading-[20px] text-[#0b1c30]">Smart Matching</h4>
                <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">
                  Adaylarımızın nitelikleri ve geçmiş başarıları sizin belirlediğiniz kriterlerle eşleştiriliyor.
                </p>
              </div>
              <Link href="/company/tasks">
                <button className="text-[#00342b] font-bold text-[12px] tracking-[0.05em] leading-[16px] hover:underline cursor-pointer">
                  Adayları İncele →
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
