"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import { useToast } from "@/context/ToastContext";
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
  FiExternalLink,
  FiAward,
  FiX,
  FiSave,
  FiImage,
} from "react-icons/fi";

// ─── shared input style ────────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2 border border-[#004d40]/25 rounded-xl bg-white/95 focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] outline-none transition-all text-[#004d40] font-semibold text-sm placeholder:text-[#004d40]/35 placeholder:font-normal";
const bodyInputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] outline-none transition-all hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm";

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

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open:        { label: "Açık",         cls: "bg-green-50 text-green-700 border border-green-150 font-semibold" },
  review:      { label: "İnceleniyor",  cls: "bg-blue-50 text-blue-700 border border-blue-150 font-semibold" },
  in_progress: { label: "Devam Ediyor", cls: "bg-amber-50 text-amber-700 border border-amber-150 font-semibold" },
  closed:      { label: "Kapandı",      cls: "bg-gray-50 text-gray-500 border border-gray-150 font-semibold" },
};

const APP_STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Bekliyor",    cls: "bg-yellow-50 text-yellow-700 border border-yellow-150 font-semibold" },
  approved: { label: "Onaylandı",   cls: "bg-green-50 text-green-700 border border-green-150 font-semibold" },
  rejected: { label: "Reddedildi",  cls: "bg-red-50 text-red-700 border border-red-150 font-semibold" },
};

function SectionCard({
  icon: Icon,
  title,
  accent = false,
  children,
}: {
  icon: React.ElementType;
  title: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border ${accent ? "border-[#004d40]/15 bg-[#004d40]/[0.01]" : "border-[#f1f0ea] bg-white"} overflow-hidden shadow-3xs`}>
      <div className={`flex items-center gap-2.5 px-5 py-3.5 border-b ${accent ? "border-[#004d40]/10 bg-[#004d40]/5" : "border-[#f1f0ea] bg-gray-50/50"}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent ? "bg-[#004d40]/10 text-[#004d40]" : "bg-white border border-[#f1f0ea] text-gray-500"}`}>
          <Icon className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 font-heading">{title}</h3>
      </div>
      <div className="px-5 py-5">{children}</div>
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
    <div className="flex items-center gap-3 py-3 border-b border-[#f1f0ea]/50 last:border-0">
      <Icon className="text-gray-400 shrink-0" size={16} />
      <span className="text-xs text-gray-500 w-24 shrink-0 font-medium">{label}</span>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-[#004d40] hover:underline flex items-center gap-1 truncate">
          {value}
          <FiExternalLink size={12} />
        </a>
      ) : (
        <span className="text-sm font-semibold text-gray-800 truncate">{value}</span>
      )}
    </div>
  );
}

function StatBubble({ value, label, icon: Icon }: { value: number | string; label: string; icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center gap-1 bg-[#004d40]/10 rounded-2xl px-5 py-3 backdrop-blur-xs border border-[#004d40]/15 text-[#004d40] text-center min-w-[95px] shadow-3xs select-none">
      <Icon size={16} className="text-[#004d40]/70 mb-0.5" />
      <span className="text-xl font-black font-heading">{value}</span>
      <span className="text-[10px] font-bold text-[#004d40]/80 leading-tight uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

interface FormData {
  company_name: string;
  industry: string;
  location: string;
  logo_url: string;
  website_url: string;
  description: string;
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<FormData>({ company_name: "", industry: "", location: "", logo_url: "", website_url: "", description: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          companyService.getMyProfile(),
          companyService.getMyStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setForm({
          company_name: profileData.company_name ?? "",
          industry:     profileData.industry ?? "",
          location:     profileData.location ?? "",
          logo_url:     profileData.logo_url ?? "",
          website_url:  profileData.website_url ?? "",
          description:  profileData.description ?? "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const startEdit = () => {
    if (!profile) return;
    setForm({
      company_name: profile.company_name ?? "",
      industry:     profile.industry ?? "",
      location:     profile.location ?? "",
      logo_url:     profile.logo_url ?? "",
      website_url:  profile.website_url ?? "",
      description:  profile.description ?? "",
    });
    setIsEditing(true);
  };

  const cancelEdit = () => setIsEditing(false);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      const updated = await companyService.updateMyProfile({
        company_name: form.company_name,
        industry:     form.industry     || null,
        location:     form.location     || null,
        logo_url:     form.logo_url     || null,
        website_url:  form.website_url  || null,
        description:  form.description  || null,
      } as Partial<CompanyProfile>);
      setProfile(updated);
      setIsEditing(false);
      showToast("Profil başarıyla güncellendi.", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Güncelleme başarısız.";
      showToast(msg, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-3 min-h-[40vh] justify-center text-gray-500">
        <FiBriefcase className="w-8 h-8 text-red-400" />
        <p>Profil verileri yüklenemedi. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const displayName    = isEditing ? form.company_name  : profile.company_name;
  const displayIndustry= isEditing ? form.industry       : (profile.industry ?? "");
  const displayLocation= isEditing ? form.location       : (profile.location ?? "");
  const displayLogo    = isEditing ? form.logo_url       : (profile.logo_url ?? "");
  const displayWebsite = isEditing ? form.website_url    : (profile.website_url ?? "");
  const displayDesc    = isEditing ? form.description    : (profile.description ?? "");

  const joinedYear = profile.user?.created_at
    ? new Date(profile.user.created_at).getFullYear()
    : null;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-0">

      {/* ── Hero Card ─────────────────────────────────────────────────────── */}
      <div
        className="overflow-hidden rounded-t-2xl shadow-3xs"
        style={{ background: "linear-gradient(135deg, #f59e0b 0%, #fbb049 55%, #fcd97a 100%)" }}
      >
        {/* Top bar */}
        <div className="flex justify-end items-center gap-2 px-6 pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" icon={FiX} onClick={cancelEdit}
                className="text-xs border-[#004d40]/30 text-[#004d40] hover:bg-[#004d40]/10 bg-[#004d40]/5 rounded-lg py-1 px-3">
                İptal
              </Button>
              <Button variant="outline" icon={FiSave} onClick={handleSave} isLoading={isSaving}
                className="text-xs border-[#004d40]/60 text-[#004d40] hover:bg-[#004d40]/15 bg-[#004d40]/10 font-semibold rounded-lg py-1 px-3">
                Kaydet
              </Button>
            </>
          ) : (
            <Button variant="outline" icon={FiEdit2} onClick={startEdit}
              className="text-xs border-transparent text-[#004d40] hover:bg-[#004d40]/10 bg-[#004d40]/5 rounded-lg py-1 px-3">
              Profili Düzenle
            </Button>
          )}
        </div>

        {/* Main hero content */}
        <div className="px-6 pb-6 pt-2 flex flex-col md:flex-row gap-6 items-start md:items-end">
          {/* Logo */}
          <div className="shrink-0 space-y-2">
            <div className="w-24 h-24 rounded-2xl border-2 border-[#004d40]/25 bg-[#004d40]/10 flex items-center justify-center text-3xl font-extrabold text-[#004d40] shadow-lg overflow-hidden">
              {displayLogo ? (
                <Image src={displayLogo} alt={displayName} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            {isEditing && (
              <div className="flex items-center gap-1.5 max-w-[96px]">
                <FiImage size={11} className="text-[#004d40]/50 shrink-0" />
                <input {...field("logo_url")} placeholder="Logo URL" className={`${inputCls} text-[10px] py-0.5 px-1.5 rounded-md`} />
              </div>
            )}
          </div>

          {/* Name & meta */}
          <div className="grow space-y-3">
            {isEditing ? (
              <input {...field("company_name")} placeholder="Şirket Adı" className={`${inputCls} text-xl font-bold`} />
            ) : (
              <h1 className="text-2xl md:text-3xl font-black text-[#004d40] leading-tight font-heading">
                {displayName}
              </h1>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <div className="flex items-center gap-1.5">
                    <FiLayers size={13} className="text-[#004d40]/50 shrink-0" />
                    <input {...field("industry")} placeholder="Sektör" className={`${inputCls} py-1 px-2.5 rounded-lg text-xs`} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin size={13} className="text-[#004d40]/50 shrink-0" />
                    <input {...field("location")} placeholder="Konum" className={`${inputCls} py-1 px-2.5 rounded-lg text-xs`} />
                  </div>
                </div>
              ) : (
                <>
                  {displayIndustry && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20 select-none">
                      <FiLayers size={11} /> {displayIndustry}
                    </span>
                  )}
                  {displayLocation && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20 select-none">
                      <FiMapPin size={11} /> {displayLocation}
                    </span>
                  )}
                  {joinedYear && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#004d40]/10 text-[#004d40] border border-[#004d40]/20 select-none">
                      <FiCalendar size={11} /> {joinedYear}&apos;den beri
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats bubbles */}
          {stats && (
            <div className="flex gap-3 flex-wrap md:flex-nowrap shrink-0 w-full md:w-auto mt-4 md:mt-0 justify-start md:justify-end">
              <StatBubble icon={FiBriefcase} value={stats.activeTasks}       label="Açık İlan" />
              <StatBubble icon={FiUsers}     value={stats.totalApplications} label="Başvuru" />
              <StatBubble icon={FiAward}     value={stats.hiredStudents}     label="İşe Alım" />
            </div>
          )}
        </div>
      </div>

      {/* ── Content Card ── */}
      <div className="bg-white rounded-b-2xl border-x border-b border-[#f1f0ea] p-6 md:p-8 shadow-2xs">
        
        {/* ── Body Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left column (2/3) ──────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <SectionCard icon={FiBriefcase} title="Şirket Hakkında" accent>
              {isEditing ? (
                <textarea
                  {...field("description")}
                  rows={6}
                  placeholder="Şirketiniz hakkında tanıtıcı bir açıklama yazın..."
                  className={`${bodyInputCls} resize-none`}
                />
              ) : displayDesc ? (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{displayDesc}</p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 italic">Henüz şirket açıklaması eklenmemiş.</p>
                  <button onClick={startEdit} className="text-xs text-[#004d40] font-bold underline underline-offset-4 mt-2 inline-block">
                    Açıklama ekle
                  </button>
                </div>
              )}
            </SectionCard>

            {/* Recent Tasks */}
            <SectionCard icon={FiTrendingUp} title="Son Görevler">
              {stats && stats.recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentTasks.map((task) => {
                    const s = STATUS_MAP[task.status] ?? { label: task.status, cls: "bg-gray-100 text-gray-500 border border-gray-200" };
                    return (
                      <Link key={task.id} href={`/company/tasks/${task.id}/details`}
                        className="flex items-center justify-between p-4 rounded-xl border border-[#f1f0ea] hover:border-[#004d40]/20 hover:bg-[#004d40]/5 transition-all group">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#004d40]/5 flex items-center justify-center shrink-0 text-[#004d40]">
                            <FiBriefcase size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#004d40] transition-colors">{task.title}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                              {new Date(task.created_at).toLocaleDateString("tr-TR")} &bull; {task._count.submissions} başvuru
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3 ${s.cls}`}>{s.label}</span>
                      </Link>
                    );
                  })}
                  <div className="pt-2">
                    <Link href="/company/tasks" className="text-xs text-[#004d40] hover:text-[#00342b] font-bold underline underline-offset-4">
                      Tüm görevleri gör →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400 italic">Henüz görev oluşturulmamış.</p>
                  <Link href="/company/tasks/new" className="text-xs text-[#004d40] hover:text-[#00342b] font-bold underline underline-offset-4 mt-2 inline-block">
                    İlk görevi oluştur
                  </Link>
                </div>
              )}
            </SectionCard>

            {/* Recent Applications */}
            {stats && stats.recentApplications.length > 0 && (
              <SectionCard icon={FiUsers} title="Son Başvurular">
                <div className="space-y-3">
                  {stats.recentApplications.map((app) => {
                    const a = APP_STATUS_MAP[app.status] ?? { label: app.status, cls: "bg-gray-100 text-gray-500 border border-gray-200" };
                    return (
                      <div key={app.id} className="flex items-center justify-between p-4 rounded-xl border border-[#f1f0ea] hover:shadow-3xs transition-shadow">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#004d40]/5 flex items-center justify-center text-[#004d40] text-sm font-bold shrink-0">
                            {app.student.full_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate">{app.student.full_name}</p>
                            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">{app.task.title}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3 ${a.cls}`}>{a.label}</span>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>

          {/* ── Right column (1/3) ──────────────────────── */}
          <div className="space-y-6">

            {/* Contact Info */}
            <SectionCard icon={FiMail} title="İletişim Bilgileri">
              <InfoRow icon={FiMail} label="E-posta" value={profile.user.email} />
              {isEditing ? (
                <div className="flex flex-col gap-2 py-3 border-b border-[#f1f0ea]/50">
                  <div className="flex items-center gap-2">
                    <FiGlobe className="text-gray-400 shrink-0" size={16} />
                    <span className="text-xs text-gray-500 w-24 shrink-0 font-medium">Website</span>
                  </div>
                  <input {...field("website_url")} placeholder="https://..." className={bodyInputCls} />
                </div>
              ) : displayWebsite ? (
                <InfoRow icon={FiGlobe} label="Website" value={displayWebsite} href={displayWebsite} />
              ) : null}
              {displayLocation && !isEditing && <InfoRow icon={FiMapPin}   label="Konum"   value={displayLocation} />}
              {displayIndustry && !isEditing && <InfoRow icon={FiLayers}   label="Sektör"  value={displayIndustry} />}
              {joinedYear && (
                <InfoRow icon={FiCalendar} label="Katılım" value={`${joinedYear} yılında katıldı`} />
              )}
            </SectionCard>

            {/* Stats Detail */}
            {stats && (
              <SectionCard icon={FiTrendingUp} title="Performans Verileri">
                <div className="space-y-3.5">
                  {[
                    { icon: FiBriefcase,  label: "Toplam Görev",      value: stats.totalTasks },
                    { icon: FiCheckCircle,label: "Aktif Görevler",     value: stats.activeTasks },
                    { icon: FiUsers,      label: "Toplam Başvuru",    value: stats.totalApplications },
                    { icon: FiClock,      label: "Bekleyen Başvuru",  value: stats.pendingApplications },
                    { icon: FiAward,      label: "İşe Alınanlar",     value: stats.hiredStudents },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-[#f1f0ea]/50 last:border-0">
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-[#565e74]">
                        <Icon size={14} className="text-gray-400" /> {label}
                      </div>
                      <span className="text-sm font-bold text-[#004d40] font-heading">{value}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Quick Actions */}
            <SectionCard icon={FiBriefcase} title="Hızlı İşlemler">
              <div className="space-y-2">
                {isEditing ? (
                  <>
                    <Button variant="primary" className="w-full text-xs py-2.5 justify-start gap-2 bg-[#004d40] hover:bg-[#00342b] text-white rounded-xl font-semibold shadow-xs" icon={FiSave}
                      onClick={handleSave} isLoading={isSaving}>
                      Kaydet
                    </Button>
                    <Button variant="outline" className="w-full text-xs py-2.5 justify-start gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold" icon={FiX}
                      onClick={cancelEdit}>
                      İptal
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="primary" className="w-full text-xs py-2.5 justify-start gap-2 bg-[#004d40] hover:bg-[#00342b] text-white rounded-xl font-semibold shadow-xs animate-pulse" icon={FiEdit2}
                      onClick={startEdit}>
                      Profili Düzenle
                    </Button>
                    <Button variant="outline" className="w-full text-xs py-2.5 justify-start gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold" icon={FiBriefcase}
                      onClick={() => router.push("/company/tasks")}>
                      Görevlerim
                    </Button>
                    <Button variant="outline" className="w-full text-xs py-2.5 justify-start gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold" icon={FiUsers}
                      onClick={() => router.push("/company/tasks")}>
                      Başvurular
                    </Button>
                  </>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

      </div>

    </div>
  );
}
