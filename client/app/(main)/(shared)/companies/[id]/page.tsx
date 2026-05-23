"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import { Task } from "@/types/task";
import TaskCard from "@/components/ui/cards/TaskCard";
import SectionCard from "@/components/ui/cards/SectionCard";
import { FiMapPin, FiGlobe, FiBriefcase, FiMail, FiEdit2 } from "react-icons/fi";

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  
  const companyId = Number(params.id);
  const isOwner = user?.role === 'company' && user?.id === companyId;

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.id) {
          const [profileData, tasksData] = await Promise.all([
            companyService.getCompanyById(companyId),
            companyService.getCompanyTasks(companyId),
          ]);
          setProfile(profileData);
          setTasks(tasksData);
        }
      } catch (error) {
        console.error("Failed to fetch company data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Yükleniyor...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen mt-12 container mx-auto flex justify-center items-center text-gray-500">
        Şirket bulunamadı.
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 container mx-auto pb-12 px-4 max-w-[1200px]">
      {/* ── Premium Hero Card ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#004d40] to-[#0f172a] text-white mb-8 shadow-md">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743] opacity-10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Main hero content */}
        <div className="relative px-8 pb-8 pt-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="shrink-0 space-y-3 relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[32px] tracking-[-0.01em] font-semibold text-white overflow-hidden backdrop-blur-sm">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt={profile.company_name} className="w-full h-full object-cover" />
              ) : (
                profile.company_name.charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Name & meta */}
          <div className="grow space-y-2">
            <div className="flex items-center gap-4 mb-1">
              <h1 className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px]">
                {profile.company_name}
              </h1>
              {isOwner && (
                <button 
                  onClick={() => router.push('/company/profile/edit')}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <FiEdit2 size={14} /> Profili Düzenle
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 text-[14px] font-medium">
                {profile.industry && (
                  <span className="text-white/90">
                    {profile.industry}
                  </span>
                )}
                {profile.industry && profile.location && (
                  <span className="w-1 h-1 rounded-full bg-white/40" />
                )}
                {profile.location && (
                  <span className="text-white/90">
                    {profile.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* ── Left column (2/3) ──────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About */}
          <SectionCard icon={FiBriefcase} title="Şirket Hakkında">
             <p className="text-[15px] text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
               {profile.description || "Şirket açıklaması bulunmuyor."}
             </p>
          </SectionCard>

          {/* Active Tasks */}
          <SectionCard icon={FiBriefcase} title={`Açık İlanlar (${tasks.length})`}>
            {tasks.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    index={task.id}
                    title={task.title}
                    description={task.description}
                    date={
                      task.created_at
                        ? new Date(task.created_at).toLocaleDateString("tr-TR")
                        : "Tarih bulunamadı"
                    }
                    companyName={profile.company_name}
                    companyId={Number(params.id)}
                    rating={0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-500">
                Bu şirkete ait açık ilan bulunmamaktadır.
              </div>
            )}
          </SectionCard>

        </div>

        {/* ── Right column (1/3) ─────────────────────── */}
        <div className="space-y-8">
          {/* Contact Info */}
          <div className="bg-white border border-[#f1f0ea] rounded-[24px] p-6 shadow-2xs hover:shadow-sm transition-all">
            <h3 className="text-[18px] font-semibold text-[#0b1c30] mb-5">İletişim Bilgileri</h3>
            <div className="space-y-1">
               {profile.website_url && (
                 <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6">
                   <FiGlobe className="text-[#004d40] shrink-0" size={18} />
                   <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-medium text-[#0b1c30] hover:text-[#004d40] transition-colors truncate">
                     {profile.website_url}
                   </a>
                 </div>
               )}
               <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6">
                 <FiMail className="text-[#004d40] shrink-0" size={18} />
                 <span className="text-[14px] font-medium text-[#0b1c30] truncate">{profile.user.email}</span>
               </div>
               {profile.location && (
                 <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6">
                   <FiMapPin className="text-[#004d40] shrink-0" size={18} />
                   <span className="text-[14px] font-medium text-[#0b1c30] truncate">{profile.location}</span>
                 </div>
               )}
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
