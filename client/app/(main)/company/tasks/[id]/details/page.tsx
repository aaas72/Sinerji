"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/ui/layouts/MainSection";
import Button from "@/components/ui/Button";
import SectionCard from "@/components/ui/cards/SectionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";
import {
  FiArrowLeft,
  FiUsers,
  FiBriefcase,
  FiBook,
  FiTag,
  FiMapPin,
  FiClock,
  FiAward,
  FiCheckCircle,
  FiFileText,
  FiHash,
  FiCalendar,
  FiInfo,
  FiLayers,
} from "react-icons/fi";
import StatusBadge from "@/components/ui/badges/StatusBadge";

// ── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: "Açık",         color: "bg-[#065043]/10 text-[#065043] border border-[#065043]/20",   dot: "bg-[#065043]" },
  review:      { label: "İnceleniyor",  color: "bg-[#e28743]/10 text-[#e28743] border border-[#e28743]/20",   dot: "bg-[#e28743]" },
  in_progress: { label: "Devam Ediyor", color: "bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20",   dot: "bg-[#004d40]" },
  closed:      { label: "Kapandı",      color: "bg-[#3f4945]/15 text-[#3f4945] border border-[#3f4945]/20",    dot: "bg-[#3f4945]" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────



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

function RewardRow({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
      <Icon size={16} style={{ color: highlight ? "#ffd54f" : "rgba(255,255,255,0.6)", flexShrink: 0 }} />
      <span className="text-[12px] font-semibold w-32 md:w-40 shrink-0 break-words" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</span>
      <span className="text-[14px] font-semibold break-words whitespace-pre-wrap flex-1 min-w-0" style={{ color: highlight ? "#ffd54f" : "#ffffff" }}>{value}</span>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TaskDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const taskId = Number(params.id);
    if (!taskId) return;
    taskService
      .getTaskById(taskId)
      .then(setTask)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen p-0 mx-auto flex justify-center items-center text-gray-400 text-sm">
        Yükleniyor...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen p-0 mx-auto flex flex-col justify-center items-center gap-4 text-gray-500">
        <p>Görev bulunamadı.</p>
        <Button variant="outline" className="rounded-full px-5 py-2 border-[#dfded6]" onClick={() => router.back()}>Geri Dön</Button>
      </div>
    );
  }

  const statusInfo = task.status
    ? STATUS_MAP[task.status] ?? { label: task.status, color: "bg-gray-100 text-gray-500 border border-gray-200", dot: "bg-gray-400" }
    : null;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      <Breadcrumb items={[
        { label: "Dashboard",   href: "/company/dashboard" },
        { label: "Tasks",       href: "/company/tasks" },
        { label: task.title,   active: true },
      ]} />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">

        {/* ── Header Section ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {task.status && (
                <StatusBadge status={task.status} />
              )}
              {task.category && (
                <span className="bg-[#dce9ff] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0b1c30] select-none shrink-0">
                  {task.category}{task.subcategory ? ` › ${task.subcategory}` : ""}
                </span>
              )}
            </div>
            <h1 className="text-[22px] md:text-[28px] font-bold leading-tight text-[#00342b] font-sans break-words tracking-tight">
              {task.title}
            </h1>
            {task.created_at && (
              <p className="text-sm text-[#565e74] font-medium">
                Oluşturulma Tarihi: {new Date(task.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => router.push("/company/tasks")}
              className="px-4 py-2 border border-[#dfded6] hover:border-[#00342b] text-[#00342b] rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer bg-white/60 hover:bg-[#004d40]/5 hover:scale-[1.02] active:scale-[0.98]"
            >
              Görevlerim
            </button>
            <button
              onClick={() => router.push(`/company/tasks/${task.id}/applicants`)}
              className="px-4 py-2 border border-[#dfded6] hover:border-[#00342b] text-[#00342b] rounded-full text-xs font-semibold flex items-center gap-2 transition-all duration-300 cursor-pointer bg-white/60 hover:bg-[#004d40]/5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Başvurular</span>
              <span className="bg-[#00342b] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold select-none shrink-0">
                {task._count?.submissions ?? 0}
              </span>
            </button>
            <button
              onClick={() => router.push(`/company/tasks/${task.id}/edit`)}
              className="px-4 py-2 bg-[#004d40] hover:bg-[#00342b] text-white rounded-full text-xs font-semibold transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              Düzenle
            </button>
          </div>
        </div>

        {/* ── KPI Bar ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatBadge 
            value={task._count?.submissions ?? 0} 
            label="Submissions" 
            subtext="Başvuru" 
          />
          <StatBadge 
            value={task.positions ?? 1} 
            label="Positions" 
            subtext="Pozisyon" 
          />
          <div className="flex flex-col justify-between rounded-2xl border border-[#DFDED6] bg-[#F1F0EA] p-5 min-w-[160px] flex-1 transition-all duration-300">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">Deadline</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[24px] md:text-[26px] font-bold text-[#00342b] leading-none shrink-0">
                {task.deadline 
                  ? new Date(task.deadline).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })
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
            {task.description && (
              <SectionCard icon={FiFileText} title="Role Overview">
                <div
                  className="prose prose-sm prose-slate max-w-none text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: task.description }}
                />
              </SectionCard>
            )}

            {/* Detail body */}
            {task.detail_title && (
              <SectionCard icon={FiFileText} title={task.detail_title}>
                {task.detail_body && (
                  <div
                    className="prose prose-sm prose-slate max-w-none text-sm text-gray-600 leading-relaxed break-words whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: task.detail_body }}
                  />
                )}
              </SectionCard>
            )}

            {/* Required Skills */}
            {task.requiredSkills && task.requiredSkills.length > 0 && (
              <SectionCard icon={FiHash} title="Required Skills">
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.map((ts) => (
                    <span
                      key={ts.skill_id}
                      className="bg-[#eff4ff] px-4 py-2 rounded-full text-xs font-semibold text-[#565e74] border border-[#dfded6] hover:border-[#004d40]/40 hover:bg-[#004d40]/5 hover:text-[#004d40] transition-colors cursor-pointer"
                    >
                      {ts.skill.name}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Sidebar (1/3) */}
          <div className="space-y-6 min-w-0">

            {/* Task Details Info */}
            {(task.work_type || task.experience_level || task.positions || task.preferred_major || task.location || task.deadline) && (
              <SectionCard icon={FiInfo} title="Task Details">
                {task.work_type        && <InfoRow icon={FiBriefcase} label="Work Type"          value={task.work_type} />}
                {task.experience_level && <InfoRow icon={FiBook}      label="Experience"         value={task.experience_level} />}
                {task.positions        && <InfoRow icon={FiUsers}     label="Positions"          value={String(task.positions)} />}
                {task.preferred_major  && <InfoRow icon={FiTag}       label="Majors"             value={task.preferred_major} />}
                {task.location         && <InfoRow icon={FiMapPin}    label="Location"           value={task.location} />}
              </SectionCard>
            )}

            {/* Category */}
            {(task.category || task.subcategory) && (
              <SectionCard icon={FiLayers} title="Category Information">
                <div className="flex items-center gap-3.5">
                  <FiLayers size={22} className="text-[#004d40] shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">Parent Category</p>
                    <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{task.category || "Belirtilmemiş"}</p>
                  </div>
                </div>
                {task.subcategory && (
                  <div className="mt-4 pt-3 border-t border-[#dfded6]/50">
                    <p className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74]">Sub-category</p>
                    <p className="text-sm font-bold text-[#0b1c30] mt-0.5">{task.subcategory}</p>
                  </div>
                )}
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
                    <span className="text-[10px] uppercase tracking-wider font-extrabold">Incentive Reward</span>
                  </div>
                  <div>
                    <p className="text-xs text-[#94d3c1] font-semibold">
                      {task.reward_type === "Nakit" ? "Cash Reward Completion" : `Reward: ${task.reward_type}`}
                    </p>
                    {task.reward_type === "Nakit" && (task.budget || task.reward_amount) ? (
                      <h2 className="text-[36px] font-extrabold text-[#e28743] tracking-tight mt-1">
                        ₺{(task.budget || task.reward_amount)?.toLocaleString("tr-TR")}
                      </h2>
                    ) : task.reward_type === "Staj" ? (
                      <div className="mt-2 text-white space-y-1">
                        <p className="text-sm font-bold">{task.internship_department || "Departman Belirtilmemiş"}</p>
                        <p className="text-xs text-[#94d3c1]">{task.internship_duration || "Süre Belirtilmemiş"}</p>
                      </div>
                    ) : (
                      <div className="mt-2 text-white space-y-1">
                        <p className="text-sm font-bold">{task.certificate_name || "Sertifika"}</p>
                        <p className="text-xs text-[#94d3c1]">{task.certificate_issuer || "Sinerji Network"}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action button inside card */}
                  <button 
                    onClick={() => router.push(`/company/tasks/${task.id}/applicants`)}
                    className="w-full mt-4 py-3 bg-[#e28743] hover:bg-[#d47632] text-[#00342b] rounded-full font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm cursor-pointer shadow-md"
                  >
                    Başvuruları İncele ({task._count?.submissions || 0})
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-12 pt-6 border-t border-[#dfded6] flex flex-col md:flex-row justify-between items-center text-xs text-[#565e74] font-semibold gap-3">
          <div className="flex items-center gap-3">
            <span>Task ID: <span className="text-[#004d40] font-bold">T-{task.id}</span></span>
            <div className="w-1.5 h-1.5 bg-[#dfded6] rounded-full hidden md:block" />
            {task.created_at && (
              <span>Last Updated: {new Date(task.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
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
