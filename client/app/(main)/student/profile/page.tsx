"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {  
  FiEdit,
  FiAward,
  FiCheckCircle,
  FiStar,
  FiSend,
  FiBriefcase,
  FiGlobe,
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiMail,
  FiPhone,
  FiBookOpen,
  FiCpu,
  FiSmile,
  FiCalendar,
  FiMapPin,
  FiLayers,
  FiUser,
  FiAtSign,
} from "react-icons/fi";
import { studentService } from "@/services/student.service";
import { StudentProfile, StudentSkill } from "@/types/student";
import SkillBadge from "@/components/ui/SkillBadge";
import TaskCard from "@/components/ui/cards/TaskCard";
import RecommendationCard from "@/components/ui/cards/RecommendationCard";

// ── Helpers ──────────────────────────────────────────────────────────────────

const transformSkills = (skills: StudentSkill[]) => {
  const grouped: Record<string, { name: string; level: number }[]> = {};

  skills.forEach((skill) => {
    const category = skill.category || "Diğer Yetenekler";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ name: skill.skill.name, level: skill.level });
  });

  return Object.keys(grouped).map((category) => ({
    subtitle: category,
    items: grouped[category],
  }));
};

interface StudentStats {
  completedTasks: number;
  totalApplications: number;
  averageRating: number;
  badgesEarned: number;
}

// ── Sub-components ───────────────────────────────────────────────────────────

function ProfileSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wider">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-[#fbb049] rounded-full"></span>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    completedTasks: 0,
    totalApplications: 0,
    averageRating: 0,
    badgesEarned: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, statsData] = await Promise.all([
          studentService.getProfile(),
          studentService.getMyStats(),
        ]);
        setProfile(profileData);
        setStats(statsData);
      } catch (err: any) {
        setError(err.message || "Profil yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Profil Hazırlanıyor...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <FiAtSign size={32} />
        </div>
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="text-sm text-[#004d40] underline">Tekrar Dene</button>
      </div>
    );

  if (!profile) return null;

  const skillsData = transformSkills(profile.skills);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      
      {/* ── Header Card ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-8">
        <div className="h-48 bg-linear-to-r from-[#004d40] via-[#00695c] to-[#004d40] relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fbb049]/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
          
          <Link
            href="/student/settings"
            className="absolute top-6 right-6 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-2xl text-sm font-bold text-white hover:bg-white/25 transition-all shadow-lg group"
          >
            <FiEdit className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Profili Düzenle
          </Link>
        </div>

        <div className="px-8 pb-10 relative">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="-mt-16 relative">
              <div className="w-36 h-36 rounded-3xl bg-white border-8 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                  <span className="text-5xl font-black text-[#004d40]">
                    {profile.full_name.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg">
                <div className={`w-4 h-4 rounded-full ${profile.availability_status === 'available' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`} />
              </div>
            </div>

            {/* Title & Basics */}
            <div className="flex-1 pt-2">
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{profile.full_name}</h1>
                <span className={`text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg font-black border ${
                  profile.availability_status === 'available' 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {profile.availability_status === 'available' ? 'Müsait' : 'Meşgul'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm font-medium text-gray-600">
                <div className="flex items-center gap-2">
                  <FiBookOpen className="text-[#004d40]" />
                  <span>{profile.university || "Üniversite belirtilmemiş"}</span>
                </div>
                {profile.major && (
                  <div className="flex items-center gap-2">
                    <FiLayers className="text-[#004d40]" />
                    <span>{profile.major}</span>
                  </div>
                )}
                {profile.graduation_year ? (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="text-[#004d40]" />
                    <span>{profile.graduation_year} Mezunu</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto lg:min-w-[300px]">
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#004d40]">{stats.completedTasks}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Görevler</span>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#fbb049]">{stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Puan</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Me / Description */}
          <ProfileSection icon={FiUser} title="Hakkımda" subtitle="Kişisel Özet">
            <div className="prose prose-sm prose-slate max-w-none">
              <p className="text-gray-600 leading-relaxed text-base whitespace-pre-wrap">
                {profile.bio || "Henüz bir biyografi eklenmemiş. Kendinizi tanıtmak, hedeflerinizi ve tutkularınızı paylaşmak için profilinizi düzenleyin."}
              </p>
            </div>
          </ProfileSection>

          {/* Education Details */}
          <ProfileSection icon={FiBookOpen} title="Eğitim Bilgileri" subtitle="Akademik Geçmiş">
            <div className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:rounded-full">
              <div className="relative">
                <div className="absolute -left-[37px] top-1.5 w-4 h-4 rounded-full border-4 border-white bg-[#004d40] shadow-sm" />
                <h4 className="text-lg font-bold text-gray-900">{profile.university || "Belirtilmemiş"}</h4>
                <p className="text-[#004d40] font-semibold mt-1">{profile.major || "Bölüm belirtilmemiş"}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FiCalendar className="w-4 h-4" />
                    <span>Mezuniyet: {profile.graduation_year || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="w-4 h-4" />
                    <span>Türkiye</span>
                  </div>
                </div>
              </div>
            </div>
          </ProfileSection>

          {/* Completed Tasks / Portfolio */}
          <ProfileSection icon={FiBriefcase} title="Tamamlanan Görevler" subtitle="Deneyim & Portfolyo">
            <div className="space-y-4">
              {profile.submissions && profile.submissions.length > 0 ? (
                profile.submissions.map((submission: any, index: number) => (
                  <TaskCard
                    key={submission.id}
                    id={submission.task.id}
                    index={index + 1}
                    title={submission.task.title}
                    description={submission.task.description}
                    date={new Date(submission.submitted_at).toLocaleDateString("tr-TR")}
                    companyName={submission.task.company.company_name}
                    companyId={submission.task.company.id}
                    rating={submission.review?.rating || 0}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FiBriefcase className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Henüz tamamlanmış bir görev bulunmuyor.</p>
                </div>
              )}
            </div>
          </ProfileSection>

          {/* Recommendations */}
          <ProfileSection icon={FiAward} title="Tavsiyeler" subtitle="İş Birliği Geri Bildirimleri">
            <div className="space-y-5">
              {profile.recommendations && profile.recommendations.length > 0 ? (
                profile.recommendations.map((rec: any, index: number) => (
                  <RecommendationCard
                    key={rec.id}
                    index={index + 1}
                    text={rec.content}
                    recommenderName={rec.company.company_name}
                    recommenderTitle={rec.company.industry || "Şirket Temsilcisi"}
                    rating={rec.rating || 5}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                  <FiStar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm font-medium">Henüz bir tavsiye mektubu alınmamış.</p>
                </div>
              )}
            </div>
          </ProfileSection>
        </div>

        {/* RIGHT COLUMN (1/3) - Sidebar */}
        <div className="space-y-8">
          
          {/* Skills Sidebar */}
          <div className="bg-[#004d40] rounded-3xl p-8 shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <FiCpu className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Yetenekler</h2>
            </div>

            <div className="space-y-8">
              {skillsData.length > 0 ? (
                skillsData.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fbb049]">
                      {section.subtitle}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {section.items.map((skillItem, skillIdx) => (
                        <div
                          key={skillIdx}
                          className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group cursor-default"
                          title={`Seviye: ${skillItem.level}/10`}
                        >
                          {skillItem.name}
                          <span className="text-[10px] text-white/40 group-hover:text-white/60">{skillItem.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/50 text-xs text-center py-4">Henüz yetenek eklenmemiş.</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <SidebarCard title="İletişim & Sosyal">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#004d40] transition-colors">
                  <FiMail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-posta</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{profile.user.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 group transition-all hover:bg-white hover:shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-[#004d40] transition-colors">
                    <FiPhone size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telefon</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{profile.phone}</p>
                  </div>
                </div>
              )}

              {/* Social Grid */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#0077b5] hover:text-white hover:border-[#0077b5] transition-all">
                    <FiLinkedin size={20} />
                  </a>
                )}
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#333] hover:text-white hover:border-[#333] transition-all">
                    <FiGithub size={20} />
                  </a>
                )}
                {profile.twitter_url && (
                  <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all">
                    <FiTwitter size={20} />
                  </a>
                )}
                {profile.website_url && (
                  <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="w-full aspect-square rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all">
                    <FiGlobe size={20} />
                  </a>
                )}
              </div>
            </div>
          </SidebarCard>

          {/* Interests Card */}
          {profile.categories_of_interest && profile.categories_of_interest.trim() !== "" && (
            <SidebarCard title="İlgi Alanları">
              <div className="flex flex-wrap gap-2">
                {profile.categories_of_interest.split(',').map(cat => cat.trim()).filter(cat => cat !== "").map((cat, idx) => (
                  <span key={idx} className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-xl border border-gray-100 text-xs font-bold hover:border-[#fbb049]/30 transition-colors cursor-default">
                    {cat}
                  </span>
                ))}
              </div>
            </SidebarCard>
          )}

        </div>
      </div>
    </div>
  );
}
