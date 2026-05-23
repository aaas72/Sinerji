"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { companyService } from "@/services/company.service";
import { CompanyProfile } from "@/types/company";
import { useToast } from "@/context/ToastContext";
import {
  FiMapPin,
  FiGlobe,
  FiMail,
  FiBriefcase,
  FiCalendar,
  FiLayers,
  FiX,
  FiSave,
  FiImage,
} from "react-icons/fi";
import Input from "@/components/ui/Input";

// ─── shared input style ────────────────────────────────────────────────────────
const heroInputCls = "px-3 py-1 bg-white/10 text-white font-semibold text-sm placeholder:text-white/50 placeholder:font-normal border border-white/20 focus:border-white/50 focus:bg-white/20 focus:ring-0 transition-all rounded-lg outline-none";
const bodyInputCls = "px-4 py-2.5 text-[#004d40] bg-gray-50 border border-gray-200 focus:border-[#004d40] focus:ring-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm rounded-xl transition-all outline-none";

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
  value,
}: {
  icon: React.ElementType;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 transition-colors -mx-6 px-6">
      <Icon className="text-[#004d40] shrink-0" size={18} />
      {value}
    </div>
  );
}

export default function EditCompanyProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  type FormData = {
    company_name: string;
    industry: string;
    location: string;
    logo_url: string;
    website_url: string;
    description: string;
  };
  const [form, setForm] = useState<FormData>({
    company_name: "",
    industry: "",
    location: "",
    logo_url: "",
    website_url: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileData = await companyService.getMyProfile();
        setProfile(profileData);
        setForm({
          company_name: profileData.company_name ?? "",
          industry: profileData.industry ?? "",
          location: profileData.location ?? "",
          logo_url: profileData.logo_url ?? "",
          website_url: profileData.website_url ?? "",
          description: profileData.description ?? "",
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const cancelEdit = () => router.push("/company/profile");

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await companyService.updateMyProfile({
        company_name: form.company_name,
        industry: form.industry || null,
        location: form.location || null,
        logo_url: form.logo_url || null,
        website_url: form.website_url || null,
        description: form.description || null,
      } as Partial<CompanyProfile>);
      
      showToast("Profil başarıyla güncellendi.", "success");
      router.push("/company/profile");
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

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 md:py-14 flex flex-col gap-8 min-h-screen font-sans">
      
      {/* ── Premium Hero Card ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#004d40] to-[#0f172a] text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743] opacity-10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />

        {/* Top bar Actions (Floating) */}
        <div className="absolute top-6 right-6 z-20 flex justify-end items-center gap-2">
          <button onClick={cancelEdit} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white transition-all hover:scale-105" title="İptal">
            <FiX size={15} />
          </button>
          <button onClick={handleSave} disabled={isSaving} className="w-8 h-8 flex items-center justify-center px-4 rounded-full bg-white text-[#004d40] hover:bg-white/90 transition-all shadow-md hover:scale-105 disabled:opacity-50 text-sm font-bold gap-2" title="Kaydet">
            {isSaving ? <div className="w-3.5 h-3.5 border-2 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin" /> : <><FiSave size={15} /> Kaydet</>}
          </button>
        </div>

        {/* Main hero content */}
        <div className="relative px-8 pb-8 pt-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Logo */}
          <div className="shrink-0 space-y-3 relative group">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[32px] tracking-[-0.01em] font-semibold text-white overflow-hidden backdrop-blur-sm">
              {form.logo_url ? (
                <Image src={form.logo_url} alt="Logo" width={112} height={112} className="w-full h-full object-cover" />
              ) : (
                form.company_name.charAt(0) || "C"
              )}
            </div>
            {/* Quick Logo Edit Bubble */}
            <div className="absolute -bottom-4 -left-4 right-0 w-[140%] flex justify-center">
              <div className="flex items-center gap-2 bg-[#0f172a]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                <FiImage size={14} className="text-white/70 shrink-0 ml-1" />
                <input {...field("logo_url")} placeholder="Logo URL (https://)" className="bg-transparent border-none outline-none text-xs text-white placeholder:text-white/50 w-full" />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full mt-6 md:mt-0">
            
            {/* Name Input */}
            <div className="mb-3">
              <input 
                {...field("company_name")} 
                placeholder="Şirket Adı" 
                className="w-full max-w-lg bg-white/10 hover:bg-white/20 focus:bg-white/20 border border-white/20 focus:border-white/50 text-white placeholder:text-white/50 text-[32px] tracking-[-0.01em] font-semibold leading-[40px] rounded-xl px-4 py-1.5 outline-none transition-all"
              />
            </div>

            {/* Meta Tags (Sector, Location) */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 focus-within:border-white/50 rounded-xl px-3 py-1.5 transition-all">
                <FiLayers size={14} className="text-white/70" />
                <input {...field("industry")} placeholder="Sektör" className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/50 w-32" />
              </div>
              <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 focus-within:border-white/50 rounded-xl px-3 py-1.5 transition-all">
                <FiMapPin size={14} className="text-white/70" />
                <input {...field("location")} placeholder="Konum" className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/50 w-32" />
              </div>
            </div>
            
            {/* Joined Year (Read Only) */}
            {profile.user?.created_at && (
              <p className="text-white/60 text-sm mt-4 flex items-center gap-2 font-medium">
                <FiCalendar size={14} /> {new Date(profile.user.created_at).getFullYear()} Yılında Katıldı
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left column (2/3) ──────────────────────── */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Company */}
          <SectionCard icon={FiBriefcase} title="Şirket Hakkında">
            <div className="bg-gray-50 p-2 rounded-xl border border-gray-200 focus-within:border-[#004d40] focus-within:ring-1 focus-within:ring-[#004d40] transition-all">
              <textarea
                {...field("description")}
                rows={8}
                placeholder="Şirketiniz hakkında tanıtıcı bir açıklama yazın..."
                className="w-full bg-transparent border-none outline-none resize-none text-[15px] text-gray-800 leading-relaxed placeholder:text-gray-400 p-2"
              />
            </div>
          </SectionCard>
        </div>

        {/* ── Right column (1/3) ──────────────────────── */}
        <div className="space-y-8">

          {/* Contact Info */}
          <SectionCard icon={FiMail} title="İletişim Bilgileri">
            <InfoRow icon={FiMail} value={<span className="text-[14px] font-medium text-[#0b1c30] truncate">{profile.user.email} <span className="text-[10px] text-gray-400 ml-2 font-normal">(Değiştirilemez)</span></span>} />
            
            <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] -mx-6 px-6 bg-gray-50/30">
              <FiGlobe className="text-[#004d40] shrink-0" size={18} />
              <input {...field("website_url")} placeholder="Website (https://...)" className="w-full bg-white border border-gray-200 focus:border-[#004d40] rounded-lg px-3 py-1.5 text-sm text-gray-800 outline-none transition-all" />
            </div>
          </SectionCard>
          
        </div>
      </div>

    </div>
  );
}
