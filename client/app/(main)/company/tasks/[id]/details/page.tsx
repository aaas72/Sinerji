"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/ui/layouts/MainSection";
import Button from "@/components/ui/Button";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { taskService } from "@/services/task.service";
import { Task } from "@/types/task";
import {
  FiArrowLeft,
  FiEdit2,
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

// ── helpers ────────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  open:        { label: "Açık",         color: "bg-[#065043]/10 text-[#065043] border border-[#065043]/20",   dot: "bg-[#065043]" },
  review:      { label: "İnceleniyor",  color: "bg-[#e28743]/10 text-[#e28743] border border-[#e28743]/20",   dot: "bg-[#e28743] animate-pulse" },
  in_progress: { label: "Devam Ediyor", color: "bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20",   dot: "bg-[#004d40]" },
  closed:      { label: "Kapandı",      color: "bg-[#3f4945]/15 text-[#3f4945] border border-[#3f4945]/20",    dot: "bg-[#3f4945]" },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

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
    <div className="rounded-2xl border border-[#dfded6] bg-transparent overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white hover:border-[#004d40]/50 hover:shadow-md hover:rounded-none group/card">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[#dfded6] bg-[#004d40]/5 group-hover/card:bg-[#004d40]/10 transition-colors">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white border border-[#dfded6] text-[#004d40]">
          <Icon size={16} className="text-[#004d40]" />
        </div>
        <h3 className="text-[14px] font-semibold text-[#0b1c30] tracking-wide break-words flex-1">{title}</h3>
      </div>
      <div className="px-5 py-5 bg-transparent">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#dfded6]/50 last:border-0">
      <Icon className="text-[#004d40]/60 shrink-0" size={16} />
      <span className="text-[12px] font-semibold text-[#565e74] w-32 md:w-40 shrink-0 break-words">{label}</span>
      <span className="text-[14px] font-medium text-[#0b1c30] break-words whitespace-pre-wrap flex-1 min-w-0">{value}</span>
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

function StatBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dfded6] bg-transparent px-6 py-4 min-w-[120px] transition-all duration-300 hover:scale-[1.05] hover:bg-white hover:border-[#004d40]/50 hover:shadow-md hover:rounded-none cursor-pointer">
      <span className="text-3xl font-semibold text-[#0b1c30] leading-none">{value}</span>
      <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74] mt-2.5">{label}</span>
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
    <div className="min-h-screen p-0 mx-auto">
      <Breadcrumb items={[
        { label: "Panel",       href: "/company/dashboard" },
        { label: "Görevlerim", href: "/company/tasks" },
        { label: task.title,   active: true },
      ]} />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">

        {/* ── Top bar ── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0">
            {/* Title + badges */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
              {statusInfo && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              )}
              {task.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20 break-words max-w-full">
                  {task.category}{task.subcategory ? ` › ${task.subcategory}` : ""}
                </span>
              )}
            </div>

            <h1 className="text-[28px] md:text-[36px] font-extrabold leading-tight text-[#00342b] font-heading break-words">{task.title}</h1>

            {task.created_at && (
              <p className="text-xs text-[#565e74] font-medium flex items-center gap-1 mt-1">
                <FiCalendar size={13} className="text-[#004d40]/60" />
                Oluşturulma: {new Date(task.created_at).toLocaleDateString("tr-TR")}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
            <Button
              variant="outline"
              icon={FiArrowLeft}
              className="rounded-full px-5 py-2 border-[#dfded6] hover:bg-white text-gray-700 transition-all duration-300 font-semibold text-sm cursor-pointer"
              onClick={() => router.push("/company/tasks")}
            >
              Görevlerim
            </Button>
            <Button
              variant="outline"
              icon={FiUsers}
              className="rounded-full px-5 py-2 border-[#dfded6] hover:bg-white text-gray-700 transition-all duration-300 font-semibold text-sm cursor-pointer"
              onClick={() => router.push(`/company/tasks/${task.id}/applicants`)}
            >
              Başvurular
              {task._count?.submissions !== undefined && task._count.submissions > 0 && (
                <span className="ml-1.5 px-2 py-0.5 rounded-full bg-[#004d40] text-white text-[10px] font-bold leading-none">
                  {task._count.submissions}
                </span>
              )}
            </Button>
            <PrimaryButton
              icon={FiEdit2}
              onClick={() => router.push(`/company/tasks/${task.id}/edit`)}
            >
              Düzenle
            </PrimaryButton>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="flex flex-wrap gap-4 mb-8">
          {task._count?.submissions !== undefined && (
            <StatBadge value={task._count.submissions} label="Başvuru" />
          )}
          {task.positions && (
            <StatBadge value={task.positions} label="Pozisyon" />
          )}
          {task.deadline && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[#dfded6] bg-transparent px-6 py-4 min-w-[120px] transition-all duration-300 hover:scale-[1.05] hover:bg-white hover:border-[#004d40]/50 hover:shadow-md hover:rounded-none cursor-pointer">
              <span className="text-[16px] font-semibold text-[#0b1c30] leading-none">
                {new Date(task.deadline).toLocaleDateString("tr-TR")}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#565e74] mt-2.5">Son Başvuru</span>
            </div>
          )}
        </div>

        {/* ── Content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-5 min-w-0">

            {/* Description */}
            {task.description && (
              <SectionCard icon={FiFileText} title="Açıklama">
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
              <SectionCard icon={FiCheckCircle} title="Gerekli Beceriler">
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills.map((ts) => (
                    <span
                      key={ts.skill_id}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-colors"
                    >
                      {ts.skill.name}
                    </span>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-5 min-w-0">

            {/* Task info */}
            {(task.work_type || task.experience_level || task.positions || task.preferred_major || task.location || task.deadline) && (
              <SectionCard icon={FiInfo} title="Görev Bilgileri">
                {task.work_type        && <InfoRow icon={FiBriefcase} label="Çalışma Tipi"         value={task.work_type} />}
                {task.experience_level && <InfoRow icon={FiBook}      label="Deneyim Seviyesi"     value={task.experience_level} />}
                {task.positions        && <InfoRow icon={FiUsers}     label="Pozisyon Sayısı"      value={String(task.positions)} />}
                {task.preferred_major  && <InfoRow icon={FiTag}       label="Tercih Edilen Bölüm"  value={task.preferred_major} />}
                {task.location         && <InfoRow icon={FiMapPin}    label="Konum"                value={task.location} />}
                {task.deadline         && <InfoRow icon={FiClock}     label="Son Başvuru"          value={new Date(task.deadline).toLocaleDateString("tr-TR")} />}
              </SectionCard>
            )}

            {/* Category */}
            {(task.category || task.subcategory) && (
              <SectionCard icon={FiLayers} title="Kategori">
                {task.category   && <InfoRow icon={FiLayers} label="Kategori"      value={task.category} />}
                {task.subcategory && <InfoRow icon={FiTag}   label="Alt Kategori"  value={task.subcategory} />}
              </SectionCard>
            )}

            {/* Reward */}
            {task.reward_type && (
              <div
                className="rounded-2xl overflow-hidden border border-[#004d40]/30 shadow-xs hover:shadow-md transition-all duration-300 hover:scale-[1.01] hover:rounded-none"
                style={{ background: "linear-gradient(135deg, #004d40 0%, #00342b 100%)" }}
              >
                {/* Card header */}
                <div className="flex items-center gap-3 px-5 py-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(255, 213, 79, 0.18)", border: "1.5px solid #ffd54f" }}
                  >
                    <FiAward style={{ color: "#ffd54f" }} size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-white tracking-wide">Ödül / Kazanım</h3>
                </div>

                {/* Divider */}
                <div className="mx-5" style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />

                {/* Card body — rows with white text */}
                <div className="px-5 py-4 space-y-0">
                  <RewardRow icon={FiAward}    label="Ödül Türü" value={task.reward_type} highlight />
                  {(() => {
                    const rt = task.reward_type;
                    if (rt === "Nakit" || rt === "cash") {
                      const amount = task.budget || task.reward_amount;
                      return amount ? <RewardRow icon={FiHash} label="Tutar" value={`${amount} ${task.currency || ""}`.trim()} /> : null;
                    }
                    if (rt === "Staj" || rt === "internship") return (
                      <>
                        {task.internship_duration   && <RewardRow icon={FiClock}     label="Staj Süresi" value={task.internship_duration} />}
                        {task.internship_department && <RewardRow icon={FiBriefcase} label="Departman"   value={task.internship_department} />}
                        {task.internship_is_paid    && <RewardRow icon={FiHash}      label="Ücretli mi?" value={task.internship_is_paid === "true" ? "Evet" : "Hayır"} />}
                      </>
                    );
                    if (rt === "Sertifika" || rt === "certificate") return (
                      <>
                        {task.certificate_name   && <RewardRow icon={FiAward} label="Sertifika Adı" value={task.certificate_name} />}
                        {task.certificate_issuer && <RewardRow icon={FiHash}  label="Veren Kurum"   value={task.certificate_issuer} />}
                      </>
                    );
                    return null;
                  })()}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-8 pt-4 border-t border-[#dfded6] flex items-center justify-between text-xs text-[#565e74] font-semibold">
          <span>Görev #{task.id}</span>
          {task.created_at && (
            <span>Son güncelleme: {new Date(task.created_at).toLocaleDateString("tr-TR")}</span>
          )}
        </div>

      </MainSection>
    </div>
  );
}
