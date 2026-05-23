"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatCard from "@/components/ui/cards/StatCard";
import CompanyApplicationCard from "@/components/ui/cards/CompanyApplicationCard";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import {
  FiMapPin,
  FiGlobe,
  FiMail,
  FiBriefcase,
  FiEdit2,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiLayers,
  FiTrendingUp,
  FiAward,
} from "react-icons/fi";

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

// ─── helpers ───────────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#dfded6] bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <Icon className="text-[#004d40]" size={20} />
        <h3 className="text-base font-bold text-[#00342b] tracking-wide break-words">{title}</h3>
      </div>
      <div className="bg-transparent">{children}</div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6">
      <Icon className="text-[#004d40] shrink-0" size={18} />
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-[#0b1c30] hover:text-[#004d40] transition-colors truncate">
          {value}
        </a>
      ) : (
        <span className="text-[14px] font-medium text-[#0b1c30] truncate">{value}</span>
      )}
    </div>
  );
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          companyService.getMyProfile(),
          companyService.getMyStats() as Promise<DashboardStats>,
        ]);
        setProfile(profileData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[#004d40]/20 border-t-[#004d40] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-4 min-h-[50vh] justify-center text-gray-500">
        <FiBriefcase className="w-12 h-12 text-[#e28743]" />
        <p className="font-medium">Profil verileri yüklenemedi. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const displayName = profile.company_name;
  const displayIndustry = profile.industry ?? "";
  const displayLocation = profile.location ?? "";
  const displayLogo = profile.logo_url ?? "";
  const displayWebsite = profile.website_url ?? "";
  const displayDesc = profile.description ?? "";

  const joinedYear = profile.user?.created_at
    ? new Date(profile.user.created_at).getFullYear()
    : null;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-8 min-h-screen font-sans">

      {/* ── Premium Hero Card ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#004d40] to-[#0f172a] text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743] opacity-10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Top bar Actions (Floating) */}
        <div className="absolute top-6 right-6 z-20 flex justify-end items-center gap-2">
          <button onClick={() => router.push("/company/profile/edit")} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white transition-all hover:scale-105" title="Profili Düzenle">
            <FiEdit2 size={15} />
          </button>
        </div>

        {/* Main hero content */}
        <div className="relative px-8 pb-8 pt-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="shrink-0 space-y-3 relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[32px] tracking-[-0.01em] font-semibold text-white overflow-hidden backdrop-blur-sm">
              {displayLogo ? (
                <Image src={displayLogo} alt={displayName} width={112} height={112} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Name & meta */}
          <div className="grow space-y-2">
            <h1 className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] mb-1">
              {displayName}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 text-[14px] font-medium">
                {displayIndustry && (
                  <span className="text-white/90">
                    {displayIndustry}
                  </span>
                )}
                {displayIndustry && displayLocation && (
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                )}
                {displayLocation && (
                  <span className="text-white/90">
                    {displayLocation}
                  </span>
                )}
                {(displayIndustry || displayLocation) && joinedYear && (
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                )}
                {joinedYear && (
                  <span className="text-white/70">
                    {joinedYear}&apos;den beri
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="flex gap-2 flex-wrap md:flex-nowrap shrink-0 w-full md:w-auto mt-6 md:mt-0 justify-start md:justify-end">
              <StatCard
                icon={null}
                label="Açık İlan"
                value={stats.activeTasks}
                borderless
                theme="glass"
                className="w-auto min-w-[120px]"
              />
              <StatCard
                icon={null}
                label="Başvuru"
                value={stats.totalApplications}
                borderless
                theme="glass"
                className="w-auto min-w-[120px]"
              />
              <StatCard
                icon={null}
                label="İşe Alım"
                value={stats.hiredStudents}
                borderless
                theme="glass"
                className="w-auto min-w-[120px]"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

        {/* ── Left column (2/3) ──────────────────────── */}
        <div className="lg:col-span-2 space-y-8">

          {/* About */}
          <SectionCard icon={FiBriefcase} title="Şirket Hakkında">
            {displayDesc ? (
              <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{displayDesc}</p>
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 border border-gray-100">
                  <FiBriefcase className="text-gray-400" size={20} />
                </div>
                <p className="text-sm text-gray-500 font-medium">Henüz şirket açıklaması eklenmemiş.</p>
                <PrimaryButton onClick={() => router.push("/company/profile/edit")} className="mt-4" icon={FiEdit2}>
                  Hemen Ekle
                </PrimaryButton>
              </div>
            )}
          </SectionCard>

        {/* Recent Tasks */}
        <SectionCard icon={FiTrendingUp} title="Son Görevler">
          {stats && stats.recentTasks.length > 0 ? (
            <div className="space-y-4">
              {stats.recentTasks.map((task) => (
                <Link key={task.id} href={`/company/tasks/${task.id}/details`}
                  className="flex items-center justify-between p-4 rounded-2xl border border-[#f1f0ea] bg-white transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-gradient-to-br hover:from-[#004d40]/[0.045] hover:to-[#ffd54f]/[0.075] hover:border-[#004d40]/50 hover:shadow-md group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 text-[#004d40]">
                      <FiBriefcase size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-bold text-gray-900 truncate group-hover:text-[#004d40] transition-colors">{task.title}</p>
                      <p className="text-xs text-gray-500 font-medium mt-1 flex items-center gap-2">
                        <span className="flex items-center gap-1"><FiCalendar size={12} /> {new Date(task.created_at).toLocaleDateString("tr-TR")}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1 text-[#e28743] font-semibold"><FiUsers size={12} /> {task._count.submissions} Başvuru</span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 ml-4 group-hover:-translate-x-1 transition-transform">
                    <StatusBadge status={task.status} />
                  </div>
                </Link>
              ))}
                <div className="pt-4 flex justify-center">
                  <PrimaryButton href="/company/tasks">
                    Tüm Görevleri Gör
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Henüz görev oluşturulmamış.</p>
                <PrimaryButton href="/company/tasks/new" icon={FiTrendingUp} className="mt-4">
                  İlk Görevi Oluştur
                </PrimaryButton>
              </div>
            )}
          </SectionCard>

          {/* Recent Applications */}
          {stats && stats.recentApplications.length > 0 && (
            <SectionCard icon={FiUsers} title="Son Başvurular">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentApplications.map((app) => (
                  <CompanyApplicationCard
                    key={app.id}
                    studentName={app.student.full_name}
                    studentEmail={app.student.user.email}
                    taskTitle={app.task.title}
                    status={app.status}
                  />
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Right column (1/3) ──────────────────────── */}
        <div className="space-y-8">

          {/* Contact Info */}
          <SectionCard icon={FiMail} title="İletişim Bilgileri">
            <InfoRow icon={FiMail} label="E-posta" value={profile.user.email} />
            {displayWebsite ? (
              <InfoRow icon={FiGlobe} label="Website" value={displayWebsite} href={displayWebsite} />
            ) : null}
            {displayLocation && <InfoRow icon={FiMapPin} label="Konum" value={displayLocation} />}
            {displayIndustry && <InfoRow icon={FiLayers} label="Sektör" value={displayIndustry} />}
            {joinedYear && (
              <InfoRow icon={FiCalendar} label="Katılım" value={`${joinedYear} yılında katıldı`} />
            )}
          </SectionCard>

          {/* Stats Detail */}
          {stats && (
            <SectionCard icon={FiTrendingUp} title="Performans">
              <div className="space-y-1">
                {[
                  { icon: FiBriefcase, label: "Toplam Görev", value: stats.totalTasks },
                  { icon: FiCheckCircle, label: "Aktif Görevler", value: stats.activeTasks },
                  { icon: FiUsers, label: "Toplam Başvuru", value: stats.totalApplications },
                  { icon: FiClock, label: "Bekleyen Başvuru", value: stats.pendingApplications },
                  { icon: FiAward, label: "İşe Alınanlar", value: stats.hiredStudents },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-600">
                      <Icon size={16} className="text-[#004d40]" /> {label}
                    </div>
                    <span className="text-sm font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

        </div>
      </div>

    </div>
  );
}
