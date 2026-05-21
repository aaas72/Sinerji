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
    <div className={`bg-white rounded-2xl border border-[#f1f0ea] p-6 md:p-8 shadow-2xs hover:shadow-sm transition-all ${className}`}>
      <div className="flex items-center gap-4 mb-6 select-none">
        <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SidebarCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f0ea] p-6 shadow-2xs">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-900 mb-5 flex items-center gap-2 select-none">
        <span className="w-1.5 h-4 bg-[#e28743] rounded-full"></span>
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
    <div className="flex-grow w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col lg:flex-row gap-16">
      
      {/* Left: Main Feed (2/3) */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        
        {/* Editorial Header */}
        <header className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between pb-6 border border-[#f1f0ea] relative overflow-hidden rounded-xl p-6 bg-[#ffffff]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#eff4ff] to-transparent opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 flex items-center gap-5">
            {/* ── Avatar ── */}
            <div className="shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#004d40] flex items-center justify-center shadow-md select-none">
              <span className="text-white font-extrabold text-xl md:text-2xl tracking-wide leading-none">
                {profile.full_name
                  .split(" ")
                  .slice(0, 2)
                  .map((n) => n[0]?.toUpperCase())
                  .join("")}
              </span>
            </div>

            {/* ── Name + Info ── */}
            <div>
              <h1 className="text-[22px] md:text-[32px] leading-tight font-extrabold text-[#00342b] mb-1">{profile.full_name}</h1>
              <p className="text-[16px] font-semibold text-[#565e74]">{profile.major || "UX/UI Designer & Systems Thinker"}</p>
              
              <div className="flex items-center flex-wrap gap-4 mt-4">
                <div className="flex gap-2">
                  <span className="px-4 py-1 rounded-full bg-[#e28743]/10 text-[#e28743] text-sm font-semibold border border-[#e28743]/20">Sinerji Yeteneği</span>
                  {profile.availability_status === 'available' ? (
                    <span className="px-4 py-1 rounded-full bg-[#00342b]/10 text-[#00342b] text-sm font-semibold border border-[#00342b]/20">Yeni Rollere Açık</span>
                  ) : (
                    <span className="px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-semibold border border-gray-200">Şu An Çalışıyor</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-[#565e74] ml-2">
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#333] transition-colors" title="GitHub">
                      <FiGithub size={18} />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#0077b5] transition-colors" title="LinkedIn">
                      <FiLinkedin size={18} />
                    </a>
                  )}
                  {profile.twitter_url && (
                    <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#1DA1F2] transition-colors" title="Twitter">
                      <FiTwitter size={18} />
                    </a>
                  )}
                  {profile.website_url && (
                    <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-[#004d40] transition-colors" title="Website">
                      <FiGlobe size={18} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 relative z-10 shrink-0">
            {/* Activity Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="40" stroke="#f1f0ea" strokeWidth="8"></circle>
                <circle 
                  cx="50" cy="50" fill="none" r="40" stroke="#004d40" 
                  strokeDasharray="251" 
                  strokeDashoffset={251 - (251 * Math.min(100, Math.round((stats.completedTasks / 10) * 100))) / 100} 
                  strokeLinecap="round" strokeWidth="8"
                  className="transition-all duration-500"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-bold text-lg text-[#00342b]">{stats.completedTasks}</span>
                <span className="text-[10px] text-[#565e74] uppercase tracking-wider">Activity</span>
              </div>
            </div>
            
            {/* Impact Gauge */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="40" stroke="#f1f0ea" strokeWidth="8"></circle>
                <circle 
                  cx="50" cy="50" fill="none" r="40" stroke="#e28743" 
                  strokeDasharray="251" 
                  strokeDashoffset={251 - (251 * Math.min(100, Math.round((stats.averageRating / 5) * 100))) / 100} 
                  strokeLinecap="round" strokeWidth="8"
                  className="transition-all duration-500"
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-bold text-lg text-[#00342b]">{stats.averageRating ? stats.averageRating.toFixed(1) : "0.0"}</span>
                <span className="text-[10px] text-[#565e74] uppercase tracking-wider">Impact</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hakkımda (About Me) */}
        {profile.bio && (
          <section className="flex flex-col gap-4 relative mb-4">
            <h2 className="text-[20px] font-semibold text-[#00342b] flex items-center gap-2">
              <FiUser className="w-6 h-6" /> Hakkımda
            </h2>
            <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-6 mt-2 transition-shadow bg-[#ffffff]/50 backdrop-blur-sm">
              <p className="text-[#565e74] text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          </section>
        )}

        {/* Experience & Education */}
        <section className="flex flex-col gap-4 relative">
          <h2 className="text-[20px] font-semibold text-[#00342b] flex items-center gap-2">
            <FiBriefcase className="w-6 h-6" /> Experience & Education
          </h2>
          
          <div className="relative pl-6 ml-2 mt-4">
            
            {/* Timeline Line */}
            <div className="absolute left-[20px] top-[24px] bottom-[24px] w-[1px] bg-gradient-to-b from-[#004d40] to-transparent opacity-20 z-0" />

            {/* Submissions (Tasks) */}
            {profile.submissions && profile.submissions.map((submission: any, index: number) => (
              <div key={submission.id} className="relative mb-6 group">
                <div className="absolute left-[-32px] top-1 w-6 h-6 rounded-full bg-[#ffffff] border-2 border-[#00342b] flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-[#00342b]"></div>
                </div>
                
                <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-4 ml-1 transition-shadow bg-[#ffffff]/50 backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-[#00342b]">{submission.task.title}</h3>
                    <span className="text-sm text-[#565e74] flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                      <FiCalendar className="w-4 h-4" /> {new Date(submission.submitted_at).getFullYear()}
                    </span>
                  </div>
                  
                  <h4 className="text-[#565e74] font-medium mb-2 flex items-center gap-1">
                    <FiAward className="w-4 h-4" /> {submission.task.company.company_name}
                  </h4>
                  
                  <p className="text-[#3f4945] text-sm">
                    {submission.task.description}
                  </p>

                  {submission.review && (
                    <div className="border-t border-[#f1f0ea] pt-3 mt-4 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400 select-none">Şirket Değerlendirmesi</span>
                      <div className="flex gap-1 text-[#e28743]">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FiStar key={i} className={`w-3.5 h-3.5 ${i < submission.review.rating ? 'fill-current' : 'opacity-30'}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Education Node */}
            <div className="relative mb-6 group">
              <div className="absolute left-[-32px] top-1 w-6 h-6 rounded-full bg-[#ffffff] border-2 border-[#e28743] flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-[#e28743]"></div>
              </div>
              
              <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-4 ml-1 transition-shadow bg-[#ffffff]/50 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-[#00342b]">{profile.university || "B.S. Interaction Design"}</h3>
                  <span className="text-sm text-[#565e74] flex items-center gap-1 shrink-0 mt-1 sm:mt-0">
                    <FiCalendar className="w-4 h-4" /> {profile.graduation_year ? `${profile.graduation_year} Mezunu` : "2020 - 2024"}
                  </span>
                </div>
                
                <h4 className="text-[#565e74] font-medium mb-2 flex items-center gap-1">
                  <FiBookOpen className="w-4 h-4" /> {profile.major || "State University"}
                </h4>
              </div>
            </div>

          </div>
        </section>

        {/* Recommendations Block */}
        {profile.recommendations && profile.recommendations.length > 0 && (
          <section className="flex flex-col gap-4 relative mt-4">
            <h2 className="text-[20px] font-semibold text-[#00342b] flex items-center gap-2">
              <FiAward className="w-6 h-6" /> Tavsiyeler
            </h2>
            <div className="flex flex-col gap-4 mt-2">
              {profile.recommendations.map((rec: any, index: number) => (
                <div key={rec.id} className="bg-transparent border border-[#f1f0ea] rounded-xl p-6 transition-shadow bg-[#ffffff]/50 backdrop-blur-sm">
                  <p className="text-[#565e74] text-sm italic mb-4 leading-relaxed">"{rec.content}"</p>
                  <div className="flex justify-between items-center border-t border-[#f1f0ea] pt-4">
                    <div>
                      <h4 className="font-bold text-[#00342b] text-sm">{rec.company.company_name}</h4>
                      <span className="text-xs text-[#565e74]">{rec.company.industry || "Şirket Temsilcisi"}</span>
                    </div>
                    <div className="flex gap-1 text-[#e28743]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar key={i} className={`w-3.5 h-3.5 ${i < (rec.rating || 5) ? 'fill-current' : 'opacity-30'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Right: Sidebar (1/3) */}
      <aside className="w-full lg:w-1/3 flex flex-col gap-6">
        
        {/* Core Skills Deck */}
        <div className="bg-[#004d40] text-[#ffffff] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-5 rounded-full blur-xl"></div>
          
          <h3 className="text-[20px] font-bold mb-6 text-[#afefdd] flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg> 
            Core Skills
          </h3>
          
          <div className="flex flex-col gap-6">
            {skillsData.length > 0 ? (
              skillsData.map((section, idx) => (
                <div key={idx} className="space-y-3 relative z-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e28743] border-b border-white/10 pb-1.5 select-none">
                    {section.subtitle}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {section.items.map((skillItem, skillIdx) => {
                      const percentage = skillItem.level * 10;
                      return (
                        <div key={skillIdx}>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-[#ffffff]/90">{skillItem.name}</span>
                            <span className="text-[#e28743] text-[10px] font-extrabold">{percentage}%</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className="bg-[#e28743] h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="relative z-10">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#ffffff]/90">UI/UX Design</span>
                    <span className="text-[#e28743] font-bold">95%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-[#e28743] h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#ffffff]/90">Design Systems</span>
                    <span className="text-[#e28743] font-bold">88%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-[#e28743] h-2 rounded-full" style={{ width: "88%" }}></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-6 relative overflow-hidden bg-[#ffffff]">
          <h3 className="text-[16px] font-bold mb-4 text-[#00342b] flex items-center gap-2">
            <FiMail className="w-5 h-5" /> İletişim Bilgileri
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#f1f0ea] flex items-center justify-center text-[#565e74]">
                <FiMail size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-extrabold text-[#565e74] uppercase tracking-widest">E-posta</p>
                <p className="text-sm font-bold text-[#00342b] truncate">{profile.user.email}</p>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#f1f0ea] flex items-center justify-center text-[#565e74]">
                  <FiPhone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-extrabold text-[#565e74] uppercase tracking-widest">Telefon</p>
                  <p className="text-sm font-bold text-[#00342b] truncate">{profile.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Interests Card */}
        {profile.categories_of_interest && profile.categories_of_interest.trim() !== "" && (
          <div className="bg-transparent border border-[#f1f0ea] rounded-xl p-6 relative overflow-hidden bg-[#ffffff]">
            <h3 className="text-[16px] font-bold mb-4 text-[#00342b] flex items-center gap-2">
              <FiLayers className="w-5 h-5" /> İlgi Alanları
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.categories_of_interest.split(',').map((cat: string) => cat.trim()).filter((cat: string) => cat !== "").map((cat: string, idx: number) => (
                <span key={idx} className="bg-[#eff4ff] text-[#004d40] px-3 py-1.5 rounded-lg border border-[#f1f0ea] text-xs font-bold hover:border-[#004d40]/30 transition-colors cursor-default select-none">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

      </aside>
    </div>
  );
}
