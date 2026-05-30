"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/ui/layouts/MainSection";
import MainSectionTitle from "@/components/ui/MainSectionTitle";
import PrimaryButton from "@/components/ui/PrimaryButton";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import SkillBadge from "@/components/ui/SkillBadge";
import Link from "next/link";
import {
  FiCalendar,
  FiAward,
  FiBriefcase,
  FiMapPin,
  FiGlobe,
  FiFileText,
} from "react-icons/fi";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";
import { useAuthStore } from "@/hooks/useAuth";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import SectionCard from "@/components/ui/cards/SectionCard";

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#dfded6]/50 last:border-0">
      <Icon className="text-[#004d40] shrink-0" size={18} />
      <div>
        <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">{label}</p>
        <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function StatBadge({ value, label, subtext }: { value: string | number; label: string; subtext: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#DFDED6] bg-[#F1F0EA] p-5 min-w-[160px] flex-1 transition-all duration-300">
      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">{label}</span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-[32px] font-bold text-[#00342b] leading-none">{value}</span>
        <span className="text-xs font-semibold text-[#565e74]">{subtext}</span>
      </div>
    </div>
  );
}

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (params.id) {
          const data = await taskService.getTaskById(Number(params.id));
          setTask(data);
        }
      } catch (error) {
        console.error("Failed to fetch task details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id]);

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!task) {
    return (
      <div className="min-h-screen mt-12 app-container flex justify-center items-center">
        <EmptyState title="Görev Bulunamadı" message="Aradığınız görev silinmiş veya erişime kapanmış olabilir." icon={FiFileText} />
      </div>
    );
  }

  // Format date
  const formattedDeadline = task.deadline
    ? new Date(task.deadline).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Belirtilmemiş";

  const isCompanyOwner =
    user?.role === "company" && user?.id === task.company_user_id;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8 font-sans">
      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {task.status && (
                <StatusBadge status={task.status} />
              )}
              {task.category && (
                <span className="text-sm font-medium text-[#565e74] select-none shrink-0">
                  {task.category}
                </span>
              )}
            </div>
            <h1 className="text-[22px] md:text-[28px] font-bold leading-tight text-[#00342b] font-sans break-words tracking-tight">
              {task.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-[#565e74] font-medium">
              <FiBriefcase className="text-[#004d40]" />
              <Link
                href={`/companies/${task.company_user_id}`}
                className="hover:text-[#004d40] hover:underline transition-colors"
              >
                {task.company?.company_name}
              </Link>
              <span className="text-gray-300 px-1">•</span>
              <span>Yayınlanma: {new Date(task.created_at || Date.now()).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {user?.role === "student" ? (
              <button
                onClick={() => router.push(`/tasks/${task.id}/apply`)}
                className="px-6 py-2.5 bg-[#004d40] hover:bg-[#00342b] text-white rounded-full text-[14px] font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              >
                Hemen Başvur
              </button>
            ) : isCompanyOwner ? (
              <>
                <button
                  onClick={() => router.push(`/company/tasks/${task.id}/applicants`)}
                  className="px-6 py-2.5 border border-[#dfded6] hover:border-[#00342b] text-[#00342b] rounded-full text-[14px] font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer bg-white/60 hover:bg-[#004d40]/5"
                >
                  <span>Başvurular</span>
                </button>
                <button
                  onClick={() => router.push(`/company/edit-task/${task.id}`)}
                  className="px-6 py-2.5 bg-[#004d40] hover:bg-[#00342b] text-white rounded-full text-[14px] font-bold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  Düzenle
                </button>
              </>
            ) : null}
            <button
              onClick={() => router.push(`/companies/${task.company_user_id}`)}
              className="px-6 py-2.5 border border-[#dfded6] hover:border-[#00342b] text-[#00342b] rounded-full text-[14px] font-bold flex items-center gap-2 transition-all duration-300 cursor-pointer bg-white/60 hover:bg-[#004d40]/5 hover:shadow-sm"
            >
              <FiGlobe size={16} />
              <span>Şirketi Gör</span>
            </button>
          </div>
        </div>

        {/* ── KPI Bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatBadge 
            value={task.reward_type === "money" ? `${task.reward_value || "?"} TL` : task.reward_type === "internship" ? "Staj" : "Sertifika"} 
            label="Ödül / Teşvik" 
            subtext="Fırsat Tipi" 
          />
          <StatBadge 
            value={task.positions ?? 1} 
            label="Positions" 
            subtext="Açık Pozisyon" 
          />
          <div className="flex flex-col justify-between rounded-2xl border border-[#DFDED6] bg-[#F1F0EA] p-5 min-w-[160px] flex-1 transition-all duration-300">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">Deadline</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] md:text-[26px] font-bold text-[#00342b] leading-none shrink-0">
                {task.deadline 
                  ? new Date(task.deadline).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })
                  : "Süresiz"}
              </span>
              <span className="text-xs font-semibold text-[#565e74] shrink-0">Son Başvuru</span>
            </div>
          </div>
        </div>

        {/* ── Content Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
          
          {/* Decorative Synapse Line (SVG) */}
          <svg className="absolute -z-10 w-full h-full pointer-events-none opacity-40" viewBox="0 0 1000 800">
            <path className="stroke-[#dfded6] stroke-[0.5] fill-none" d="M200,100 C350,150 400,50 600,200 S800,400 900,100" />
            <path className="stroke-[#dfded6] stroke-[0.5] fill-none" d="M100,500 C250,450 300,550 500,400 S700,200 850,500" />
          </svg>

          {/* Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {/* Description */}
            <SectionCard icon={FiBriefcase} title="Görev Detayları">
              <div
                className="prose prose-sm prose-slate max-w-none text-[15px] text-[#3f4945] leading-relaxed break-words whitespace-pre-wrap font-medium"
                dangerouslySetInnerHTML={{ __html: task.description || "Açıklama bulunmuyor." }}
              />
            </SectionCard>

            {/* Required Skills */}
            {task.requiredSkills && task.requiredSkills.length > 0 && (
              <SectionCard icon={FiAward} title="Gerekli Yetenekler">
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.map((skillObj: any, index: number) => (
                    <SkillBadge key={index} label={skillObj.skill.name} />
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6 min-w-0">
            {/* Task Details Info */}
            {(task.work_type || task.experience_level || task.positions || task.preferred_major || task.location || task.deadline) && (
              <SectionCard icon={FiBriefcase} title="Pozisyon Detayları">
                {task.work_type        && <InfoRow icon={FiBriefcase} label="Çalışma Şekli"    value={task.work_type} />}
                {task.experience_level && <InfoRow icon={FiAward}     label="Deneyim"          value={task.experience_level} />}
                {task.preferred_major  && <InfoRow icon={FiAward}     label="Bölüm"            value={task.preferred_major} />}
                {task.location         && <InfoRow icon={FiMapPin}    label="Lokasyon"         value={task.location} />}
              </SectionCard>
            )}

            {/* Reward Card */}
            {task.reward_type && (
              <div
                className="rounded-2xl p-6 shadow-md relative overflow-hidden group transition-all duration-300 border border-[#004d40]/30"
                style={{ background: "linear-gradient(135deg, #004d40 0%, #00342b 100%)" }}
              >
                {/* Background Glow */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#e28743]/10 opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />
                
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2 text-[#e28743]">
                    <FiAward size={18} className="text-[#e28743]" />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold">FIRSAT ÖDÜLÜ</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#94d3c1] font-semibold">
                      {task.reward_type === "money" ? "Nakit Ödül" : task.reward_type === "internship" ? "Staj Fırsatı" : "Sertifika & Rozet"}
                    </p>
                    {task.reward_type === "money" ? (
                      <h2 className="text-[36px] font-extrabold text-[#e28743] tracking-tight mt-1">
                        ₺{task.reward_value || 0}
                      </h2>
                    ) : task.reward_type === "internship" ? (
                      <div className="mt-2 text-white space-y-1">
                        <p className="text-sm font-bold">{task.company?.company_name} Bünyesinde</p>
                        <p className="text-xs text-[#94d3c1]">Staj İmkanı</p>
                      </div>
                    ) : (
                      <div className="mt-2 text-white space-y-1">
                        <p className="text-sm font-bold">Resmi Katılım Sertifikası</p>
                        <p className="text-xs text-[#94d3c1]">Sinerji Network Onaylı</p>
                      </div>
                    )}
                  </div>
                  
                  {user?.role === "student" && (
                    <button 
                      onClick={() => router.push(`/tasks/${task.id}/apply`)}
                      className="w-full mt-4 py-3 bg-[#e28743] hover:bg-[#d47632] text-[#00342b] rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm cursor-pointer shadow-md"
                    >
                      Hemen Başvur
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 pt-6 border-t border-[#dfded6] flex flex-col md:flex-row justify-between items-center text-xs text-[#565e74] font-semibold gap-3">
          <div className="flex items-center gap-3">
            <span>Görev ID: <span className="text-[#004d40] font-bold">T-{task.id}</span></span>
            <div className="w-1.5 h-1.5 bg-[#dfded6] rounded-full hidden md:block" />
            {task.created_at && (
              <span>Yayınlanma: {new Date(task.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🔒 Encrypted & Secured by Sinerji Network</span>
          </div>
        </div>
      </MainSection>
    </div>
  );
}
