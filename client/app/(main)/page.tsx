"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { publicService, PublicStats, PublicTask } from "@/services/public.service";
import {
  FiBriefcase,
  FiUsers,
  FiAward,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
  FiArrowRight,
  FiZap,
  FiBell,
  FiUserPlus,
  FiMapPin,
  FiGithub,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi";
import Navbar from "@/components/layout/Navbar";
import SkillBadge from "@/components/ui/SkillBadge";

const studentSteps = [
  {
    title: "Profilini Oluştur & Doğrula",
    desc: "E-Devlet ile öğrenci durumunu doğrula, GitHub'ını bağla ve yeteneklerini tanımla.",
    icon: FiUsers,
  },
  {
    title: "AI Eşleşen Görevleri Bul",
    desc: "Yapay zeka motorumuz yeteneklerine göre en uyumlu ve yüksek ödüllü görevleri anında listeler.",
    icon: FiZap,
  },
  {
    title: "Görevleri Tamamla & Rozet Kazan",
    desc: "Görevleri başarıyla tamamla, şirketlerden doğrulanmış rozetler ve değerlendirmeler kazan.",
    icon: FiAward,
  },
];

const companySteps = [
  {
    title: "Görev / Proje Yayınla",
    desc: "Proje detaylarını, aranan yetenekleri ve bütçeyi belirterek görevi anında yayınla.",
    icon: FiBriefcase,
  },
  {
    title: "AI Sıralamalı Adayları İncele",
    desc: "Başvuran adayları yapay zeka tarafından otomatik hesaplanan uyum puanına göre incelersiniz.",
    icon: FiTrendingUp,
  },
  {
    title: "Ödeme Yap & Rozet Dağıt",
    desc: "Onaylanan görevler için ödemeyi aktar, adayın profiline doğrulanmış rozetini ekle.",
    icon: FiCheckCircle,
  },
];

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { openRegister, openLogin } = useAuthModal();

  const [activeStudentStep, setActiveStudentStep] = useState(0);
  const [activeCompanyStep, setActiveCompanyStep] = useState(0);
  const [stats, setStats] = useState<PublicStats>({
    students: 0,
    companies: 0,
    tasks: 0,
    badges: 0,
  });
  const [latestTasks, setLatestTasks] = useState<PublicTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      publicService.getStats().then(setStats).catch(() => {}),
      publicService.getLatestTasks().then(setLatestTasks).catch(() => {})
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6]">
        <Navbar authenticated={isAuthenticated} role={user?.role as any} />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <Navbar authenticated={isAuthenticated} role={user?.role as any} />
      <section className="hero-gradient text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#e28743] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative app-container px-6 pt-16 pb-8 lg:pt-20 lg:pb-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="text-[#e28743] font-semibold tracking-wider uppercase text-sm">
                Yetenek ve Fırsat Buluşma Noktası
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] font-heading">
                Geleceğini <span className="text-[#e28743]">Şekillendir,</span> Yeteneğini Kanıtla
              </h1>

              <p className="text-lg text-white/80 max-w-lg leading-relaxed">
                Öğrenciler gerçek dünya projeleriyle deneyim kazanır.
                Şirketler en parlak yetenekleri keşfeder.
              </p>

              <div className="flex items-center gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#e28743]" />
                  <span>Ücretsiz kayıt</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#e28743]" />
                  <span>Gerçek projeler</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-[#e28743]" />
                  <span>Onaylı rozetler</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-550 text-sm">Son Görevler</span>
                      {latestTasks.length > 0 && (
                        <span className="bg-[#e28743] text-white text-xs font-bold px-3 py-1 rounded-full">
                          Yeni
                        </span>
                      )}
                    </div>

                    {latestTasks.length === 0 ? (
                      <div className="text-center py-10 text-gray-300 italic">
                        Henüz görev bulunmuyor
                      </div>
                    ) : (
                      latestTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                            <span className="text-xs text-gray-400">{task.company}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {task.skills.map((skill) => (
                              <SkillBadge key={skill} label={skill} />
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3">
                  <div className="flex items-center justify-center">
                    <FiAward className="text-[#e28743]" size={28} />
                  </div>
                  <div>
                    <p className="text-[#004d40] font-bold text-sm">Rozet Sistemi</p>
                    <p className="text-gray-400 text-xs">Yeteneklerini kanıtla</p>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        size={14}
                        className="text-[#e28743] fill-[#e28743]"
                      />
                    ))}
                  </div>
                  <span className="text-[#004d40] font-bold text-sm">Real Stats</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats Banner */}
          <div className="mt-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {[
                { value: stats.students.toString(), label: "Öğrenci", icon: FiUsers },
                { value: stats.companies.toString(), label: "Şirket", icon: FiBriefcase },
                { value: stats.tasks.toString(), label: "Görev", icon: FiTrendingUp },
                { value: stats.badges.toString(), label: "Rozet", icon: FiAward },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="flex items-center justify-center">
                    <stat.icon className="text-[#e28743]" size={36} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white font-heading leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-sm text-white/70 font-medium">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STUDENT JOURNEY SECTION */}
      <section className="py-24 bg-[#faf9f6] relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#004d40]/2 rounded-full blur-3xl" />

        <div className="relative app-container px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#e28743] text-sm font-bold tracking-wider uppercase mb-4">
              Öğrenciler İçin
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
              Sinerji Öğrenci Süreci
            </h2>
            <p className="text-gray-550 max-w-xl mx-auto text-sm leading-relaxed">
              Yeteneklerinizi doğrulayın, yapay zeka ile eşleşen gerçek projelere katılın ve doğrulanmış rozetler kazanarak itibarınızı oluşturun.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-stretch">
            {/* Left side: Interactive Steps */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              {/* Desktop version steps */}
              <div className="hidden lg:flex flex-col space-y-4">
                {studentSteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeStudentStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStudentStep(idx)}
                      className={`text-left w-full p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 hover-card-effect ${
                        isActive
                          ? "active-card-effect translate-x-2"
                          : "bg-white/40 border-transparent"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-[#004d40] text-white shadow-lg shadow-[#004d40]/20"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm transition-colors duration-300 ${isActive ? "text-[#004d40]" : "text-gray-800"}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-550 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile version tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                {studentSteps.map((step, idx) => {
                  const isActive = activeStudentStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStudentStep(idx)}
                      className={`flex-none px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#004d40] text-white shadow-md"
                          : "bg-white border border-gray-100 text-gray-500"
                      }`}
                    >
                      {step.title.split(" ")[0]} {step.title.split(" ")[1] || ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Sinerji Internal Dashboard Simulation */}
            <div className="lg:col-span-7 flex items-center justify-center animate-fade-up">
              <div className="w-full bg-white border border-[#dfded6] shadow-xl rounded-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between hover-card-effect">
                {/* Simulated Browser Titlebar */}
                <div className="bg-[#e6e5e0] border-b border-[#dfded6]/65 h-[42px] px-4 flex items-center justify-between shrink-0 select-none">
                  {/* Left: Dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d89694] border border-[#d89694]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f5ac7b] border border-[#f5ac7b]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#004d40] border border-[#004d40]/10" />
                  </div>
                  
                  {/* Center: Address Bar Capsule */}
                  <div className="flex-1 max-w-lg mx-6 bg-[#f1f0ea] border border-[#dfded6]/40 rounded-full h-6 flex items-center justify-center text-[10px] text-[#004d40] font-semibold font-mono select-none px-4 truncate">
                    {activeStudentStep === 0 && "sinerji.app/v3/profile/verify"}
                    {activeStudentStep === 1 && "sinerji.app/v3/matching/engine"}
                    {activeStudentStep === 2 && "sinerji.app/v3/profile/reputation"}
                  </div>
                  
                  {/* Right: Refresh Icon */}
                  <div className="flex items-center justify-end shrink-0 w-8">
                    <FiRefreshCw className="text-[#004d40] w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                  </div>
                </div>

                {/* Mini Sinerji Navigation Bar */}
                <div className="bg-white border-b border-[#dfded6]/40 shadow-xs h-[52px] px-4 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-6">
                    <span className="font-bold text-sm tracking-tight text-[#004d40]">Sinerji</span>
                    <div className="hidden sm:flex items-center gap-4">
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeStudentStep === 1 ? "text-[#004d40] border-[#004d40]" : "text-gray-400 border-transparent"}`}>
                        Görevler
                      </span>
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeStudentStep === 0 ? "text-[#004d40] border-[#004d40]" : "text-gray-400 border-transparent"}`}>
                        Profil
                      </span>
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeStudentStep === 2 ? "text-[#004d40] border-[#004d40]" : "text-gray-400 border-transparent"}`}>
                        Repütasyon
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                      <FiBell size={12} />
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#004d40]/10 text-[#004d40] flex items-center justify-center font-bold text-[10px]">
                      EY
                    </div>
                  </div>
                </div>

                {/* Simulated Dashboard Main Body */}
                <div className="flex-1 bg-[#faf9f6] p-6 flex items-center justify-center">
                  {activeStudentStep === 0 && (
                    <div className="w-full max-w-sm space-y-4 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Aşama 1: Profil & Akademik Doğrulama
                      </div>
                      
                      {/* Sinerji Authentic StudentExploreCard Mockup */}
                      <div className="bg-white border border-[#dfded6] rounded-3xl p-6 shadow-sm text-left flex flex-col justify-between hover-card-effect relative overflow-hidden">
                        {/* E-Devlet Verified Badge in absolute top-right */}
                        <div className="absolute top-6 right-6 flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[9px] font-bold border border-emerald-200">
                          <FiCheckCircle className="w-3 h-3 text-emerald-600" />
                          E-Devlet Onaylı
                        </div>

                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 text-[#004d40] flex items-center justify-center text-xl font-bold shrink-0">
                            EY
                          </div>
                          <div className="flex-1 min-w-0 pr-20">
                            <h3 className="text-base font-bold text-[#0b1c30] truncate">Emre Yılmaz</h3>
                            <p className="text-xs font-semibold text-gray-500 truncate mt-0.5">Frontend Developer</p>
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 font-medium">
                              <FiGithub className="w-3 h-3" />
                              github.com/emreyilmaz
                            </div>
                          </div>
                        </div>

                        {/* Student info lines */}
                        <div className="space-y-2 mb-4 text-xs text-[#565e74] border-t border-[#dfded6]/30 pt-3">
                          <div className="flex items-center gap-2">
                            <FiBriefcase className="w-3.5 h-3.5 text-[#00342b]/60" />
                            <span className="font-medium text-gray-700">Marmara Üniversitesi • Bilgisayar Mühendisliği</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-3.5 h-3.5 text-[#00342b]/60" />
                            <span className="font-medium text-gray-700">İstanbul, Türkiye</span>
                          </div>
                        </div>

                        {/* Skills as Sinerji badges */}
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Yetenekler</p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              React
                            </span>
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              Node.js
                            </span>
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              TypeScript
                            </span>
                          </div>
                        </div>

                        {/* Bottom action button */}
                        <div className="pt-3 border-t border-[#dfded6]/50">
                          <button className="w-full bg-[#004d40] hover:bg-[#00695c] text-white font-bold py-2 rounded-full text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-xs">
                            <FiUserPlus className="w-3.5 h-3.5" />
                            Profili Güncelle
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStudentStep === 1 && (
                    <div className="w-full max-w-md space-y-3.5 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>Aşama 2: AI Eşleştirme Motoru</span>
                        <span className="flex items-center gap-1 text-[9px] text-[#e28743] font-bold bg-[#e28743]/10 px-2 py-0.5 rounded-full">
                          <FiZap className="w-2.5 h-2.5 animate-pulse" /> Motor Aktif
                        </span>
                      </div>

                      {/* Authentic Sinerji TaskDetail matching preview */}
                      <div className="bg-white border border-[#dfded6] rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover-card-effect relative overflow-hidden">
                        
                        {/* Task Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center font-extrabold text-[#004d40] text-xs border border-gray-200 shrink-0">
                            TC
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[10px] text-gray-500 uppercase tracking-wider block">
                              TechCorp Çözümleri
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] text-[#e28743] font-bold mt-0.5">
                              <span className="flex items-center">
                                4.2 <FiStar className="w-2.5 h-2.5 ml-0.5 fill-[#e28743]" />
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400 font-semibold">Mentor Destekli</span>
                            </div>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-gray-900 leading-tight mb-3">
                          Backend Developer (Node.js/Redis)
                        </h4>

                        {/* Horizontal Metadata Divider Bar */}
                        <div className="border-y border-[#dfded6]/30 py-2.5 mb-4 flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <FiAward className="w-3.5 h-3.5 text-[#004d40]" />
                            <div>
                              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">Ödül</p>
                              <p className="font-bold text-gray-800">₺15,000</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiMapPin className="w-3.5 h-3.5 text-[#004d40]" />
                            <div>
                              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">Konum</p>
                              <p className="font-bold text-gray-800">Uzaktan</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiZap className="w-3.5 h-3.5 text-[#e28743]" />
                            <div>
                              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">AI Uyum</p>
                              <p className="font-extrabold text-[#e28743]">%94 Eşleşme</p>
                            </div>
                          </div>
                        </div>

                        {/* Sinerji's exact AI Match Evaluation Quote Box */}
                        <div className="border-l-2 border-[#e28743] pl-3.5 py-1.5 bg-[#e28743]/2 rounded-r-xl">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#e28743] mb-1 flex items-center gap-1 select-none">
                            <FiZap className="animate-pulse fill-current" /> Yapay Zeka Eşleşme Değerlendirmesi
                          </p>
                          <p className="italic text-gray-600 text-[11px] leading-relaxed">
                            "GitHub tecrübeleriniz ve akademik başarınız bu görevin Node.js/Redis gereksinimleriyle %94 oranında eşleşiyor."
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStudentStep === 2 && (
                    <div className="w-full max-w-sm space-y-3.5 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Aşama 3: Rozet Kazanma & İtibar Sistemi
                      </div>

                      {/* Reputation Card */}
                      <div className="bg-white border border-[#dfded6] rounded-2xl p-4 shadow-xs text-left space-y-3">
                        <div className="flex justify-between items-center border-b border-[#dfded6]/40 pb-2">
                          <div>
                            <span className="text-[9px] font-extrabold text-[#e28743] uppercase tracking-wider block">Profil İtibarı</span>
                            <h4 className="font-bold text-xs text-gray-800">Emre Yılmaz</h4>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-extrabold text-[#004d40] block">4.9 / 5.0</span>
                            <div className="flex gap-0.5 text-[#e28743]">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} size={8} className="fill-[#e28743] text-[#e28743]" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {/* Badge 1 */}
                          <div className="flex gap-3 items-start bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 shadow-xs border border-amber-200">
                              <FiAward className="w-4 h-4 text-[#e28743]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-gray-900 leading-tight">Verified Node.js Specialist</h5>
                              <p className="text-[9px] text-[#e28743] font-semibold mt-0.5">TechCorp Çözümleri Tarafından Verildi</p>
                              <p className="text-[9px] text-gray-500 italic mt-1 font-medium">"Harika teslimat, çok temiz kod."</p>
                            </div>
                          </div>

                          {/* Badge 2 */}
                          <div className="flex gap-3 items-start bg-teal-50/30 p-2.5 rounded-xl border border-teal-100">
                            <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-[#004d40] shrink-0 border border-teal-200">
                              <FiAward className="w-4 h-4 text-[#004d40]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[11px] font-bold text-gray-900 leading-tight">Verified React Developer</h5>
                              <p className="text-[9px] text-[#004d40] font-semibold mt-0.5">InnovateSoft Tarafından Verildi</p>
                              <p className="text-[9px] text-gray-500 italic mt-1 font-medium">"Arayüz tasarımı harika oldu."</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer simulation */}
                <div className="text-center text-[9px] text-[#004d40] bg-white pt-3 pb-3 border-t border-[#dfded6]/30 select-none font-mono font-bold tracking-wider">
                  Sinerji Core v2.0 // Active Matching Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY JOURNEY SECTION */}
      <section className="py-24 bg-[#004d40] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-10 w-96 h-96 bg-[#e28743] rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative app-container px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#e28743] text-sm font-bold tracking-wider uppercase mb-4">
              Şirketler İçin
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
              Sinerji Şirket Süreci
            </h2>
            <p className="text-white/80 max-w-xl mx-auto text-sm leading-relaxed">
              Projelerinizi yayınlayın, yapay zeka ile sıralanmış aday havuzunu inceleyin, güvenli ödeme yapın ve doğrulanmış dijital rozetler dağıtın.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10 items-stretch">
            {/* Left side: Interactive Steps */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
              {/* Desktop version steps */}
              <div className="hidden lg:flex flex-col space-y-4">
                {companySteps.map((step, idx) => {
                  const Icon = step.icon;
                  const isActive = activeCompanyStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCompanyStep(idx)}
                      className={`text-left w-full p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 hover:scale-[1.02] hover:shadow-lg hover:z-10 ${
                        isActive
                          ? "bg-white/15 border-white/25 translate-x-2 shadow-lg text-white"
                          : "bg-transparent border-transparent text-white/70 hover:bg-white/5 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-xl transition-all duration-300 ${
                          isActive
                            ? "bg-[#e28743] text-white shadow-lg shadow-[#e28743]/20"
                            : "bg-white/5 text-white/40"
                        }`}
                      >
                        <Icon size={20} />
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-bold text-sm transition-colors duration-300 ${isActive ? "text-[#e28743]" : "text-white/95"}`}>
                          {step.title}
                        </h4>
                        <p className="text-xs text-white/60 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Mobile version tabs */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                {companySteps.map((step, idx) => {
                  const isActive = activeCompanyStep === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveCompanyStep(idx)}
                      className={`flex-none px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                        isActive
                          ? "bg-[#e28743] text-white shadow-md"
                          : "bg-white/5 border border-white/10 text-white/60"
                      }`}
                    >
                      {step.title.split(" ")[0]} {step.title.split(" ")[1] || ""}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right side: Sinerji Internal Dashboard Simulation */}
            <div className="lg:col-span-7 flex items-center justify-center animate-fade-up">
              <div className="w-full bg-white border border-[#dfded6] shadow-2xl rounded-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between hover-card-effect text-gray-900">
                {/* Simulated Browser Titlebar */}
                <div className="bg-[#e6e5e0] border-b border-[#dfded6]/65 h-[42px] px-4 flex items-center justify-between shrink-0 select-none">
                  {/* Left: Dots */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#d89694] border border-[#d89694]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#f5ac7b] border border-[#f5ac7b]/10" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#004d40] border border-[#004d40]/10" />
                  </div>
                  
                  {/* Center: Address Bar Capsule */}
                  <div className="flex-1 max-w-lg mx-6 bg-[#f1f0ea] border border-[#dfded6]/40 rounded-full h-6 flex items-center justify-center text-[10px] text-[#004d40] font-semibold font-mono select-none px-4 truncate">
                    {activeCompanyStep === 0 && "sinerji.app/v3/company/tasks/new"}
                    {activeCompanyStep === 1 && "sinerji.app/v3/company/ranking/candidates"}
                    {activeCompanyStep === 2 && "sinerji.app/v3/company/payout/review"}
                  </div>
                  
                  {/* Right: Refresh Icon */}
                  <div className="flex items-center justify-end shrink-0 w-8">
                    <FiRefreshCw className="text-[#004d40] w-3.5 h-3.5 cursor-pointer hover:rotate-180 transition-transform duration-500" />
                  </div>
                </div>

                {/* Mini Sinerji Navigation Bar */}
                <div className="bg-white border-b border-[#dfded6]/40 shadow-xs h-[52px] px-4 flex items-center justify-between shrink-0 select-none">
                  <div className="flex items-center gap-6 text-gray-800">
                    <span className="font-bold text-sm tracking-tight text-[#004d40]">Sinerji</span>
                    <div className="hidden sm:flex items-center gap-4">
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeCompanyStep === 0 ? "text-[#004d40] border-[#004d40]" : "text-gray-450 border-transparent"}`}>
                        Görevler
                      </span>
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeCompanyStep === 1 ? "text-[#004d40] border-[#004d40]" : "text-gray-450 border-transparent"}`}>
                        Aday Sıralama
                      </span>
                      <span className={`text-[11px] font-bold pb-1 border-b-2 transition-all ${activeCompanyStep === 2 ? "text-[#004d40] border-[#004d40]" : "text-gray-450 border-transparent"}`}>
                        Ödemeler
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-450">
                      <FiBell size={12} />
                    </span>
                    <div className="w-6 h-6 rounded-full bg-[#004d40]/10 text-[#004d40] flex items-center justify-center font-bold text-[10px]">
                      CO
                    </div>
                  </div>
                </div>

                {/* Simulated Dashboard Main Body */}
                <div className="flex-1 bg-[#faf9f6] p-6 flex items-center justify-center">
                  {activeCompanyStep === 0 && (
                    <div className="w-full max-w-sm space-y-4 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Aşama 1: Görev & Proje Yayınlama
                      </div>
                      
                      {/* Sinerji Mock Task Detail Preview */}
                      <div className="bg-white border border-[#dfded6] rounded-3xl p-5 shadow-sm text-left flex flex-col justify-between hover-card-effect relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center font-extrabold text-[#004d40] text-xs border border-gray-200 shrink-0">
                            TC
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-[10px] text-gray-500 uppercase tracking-wider block">
                              TechCorp Çözümleri
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] text-[#e28743] font-bold mt-0.5">
                              <span className="flex items-center">
                                4.2 <FiStar className="w-2.5 h-2.5 ml-0.5 fill-[#e28743]" />
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-400 font-semibold">Aktif İlan</span>
                            </div>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-sm text-gray-900 leading-tight mb-3">
                          Backend Developer (Node.js/Redis)
                        </h4>

                        <div className="border-y border-[#dfded6]/30 py-2.5 mb-4 flex items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <FiAward className="w-3.5 h-3.5 text-[#004d40]" />
                            <div>
                              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">Bütçe</p>
                              <p className="font-bold text-gray-800">₺15,000</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FiMapPin className="w-3.5 h-3.5 text-[#004d40]" />
                            <div>
                              <p className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">Konum</p>
                              <p className="font-bold text-gray-800">Uzaktan</p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Aranan Beceriler</p>
                          <div className="flex flex-wrap gap-1.5">
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              Node.js
                            </span>
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              Redis
                            </span>
                            <span className="bg-[#004d40]/5 text-[#004d40] text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#004d40]/10">
                              TypeScript
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#dfded6]/30">
                          <p className="text-gray-550 text-[11px] leading-relaxed">
                            Backend altyapımızda kullanılmak üzere API geliştirmesi ve Redis önbellekleme entegrasyonu yapacak yetenekli adaylar aranıyor.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCompanyStep === 1 && (
                    <div className="w-full max-w-sm space-y-3.5 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                        <span>Aşama 2: AI Sıralamalı Adaylar (Şirket Arayüzü)</span>
                        <span className="w-2 h-2 rounded-full bg-[#e28743] animate-ping" />
                      </div>

                      {/* Sinerji Authentic ApplicantCard Mockup */}
                      <div className="bg-white border border-[#dfded6] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover-card-effect text-left">
                        {/* Top Progress Bar Header */}
                        <div className="relative h-5 w-full overflow-hidden shrink-0 select-none">
                          <div className="absolute inset-0 bg-[#e8e7e1]" />
                          <div className="absolute inset-0 flex items-center justify-center gap-1 text-[9px] font-normal text-[#b5b2ab] whitespace-nowrap">
                            <FiAward className="w-2.5 h-2.5" />
                            AI Uyumlu %94.00
                          </div>
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00342b] to-[#005c4b] overflow-hidden"
                            style={{ width: "94%" }}
                          >
                            <div
                              className="absolute inset-y-0 left-0 flex items-center justify-center gap-1 text-[9px] font-normal text-[#e8e7e1] whitespace-nowrap"
                              style={{ width: `${(100 / 94) * 100}%` }}
                            >
                              <FiAward className="w-2.5 h-2.5" />
                              AI Uyumlu %94.00
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="w-12 h-12 bg-gradient-to-tr from-[#00342b] to-[#005c4b] rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-md shrink-0">
                                E
                              </div>
                              <span className="bg-[#004d40]/10 text-[#004d40] text-[9px] font-bold px-2 py-0.5 rounded border border-[#004d40]/20 uppercase tracking-wider">
                                Mülakat Teklifi
                              </span>
                            </div>

                            <div className="mb-3">
                              <h5 className="text-sm font-bold text-[#00342b]">Emre Yılmaz</h5>
                              <p className="text-[11px] text-[#565e74] mt-0.5">Marmara Üniversitesi • Bilgisayar Müh.</p>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-3.5">
                              <span className="bg-[#eff4ff] text-[#3f465c] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-gray-200">
                                ₺15,000 Bütçe
                              </span>
                              <span className="bg-[#eff4ff] text-[#3f465c] px-2 py-0.5 rounded-lg text-[9px] font-bold border border-gray-200">
                                5 Gün Teslim
                              </span>
                            </div>

                            <div className="pt-3 border-t border-[#dfded6]/30">
                              <p className="text-gray-550 text-[11px] italic leading-relaxed">
                                "Node.js ile performans odaklı API geliştirmesi yapabilirim. Projenizi belirtilen bütçe dahilinde başarıyla tamamlayabilirim."
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#dfded6]/20 mt-auto text-[9px] font-bold text-[#565e74]">
                            <span className="flex items-center gap-1">
                              20.06.2026
                            </span>
                            <span className="text-[#00342b] font-bold text-xs flex items-center gap-1 cursor-pointer">
                              İncele <FiArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeCompanyStep === 2 && (
                    <div className="w-full max-w-sm space-y-3.5 animate-fadeIn">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Aşama 3: Güvenli Ödeme & Değerlendirme
                      </div>

                      {/* Payout & Review Card */}
                      <div className="bg-white border border-[#dfded6] rounded-2xl p-5 shadow-xs text-left space-y-4">
                        <div className="border-b border-[#dfded6]/40 pb-3 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-extrabold text-[#004d40] uppercase tracking-wider block">Ödeme ve Geri Bildirim</span>
                            <h4 className="font-bold text-xs text-gray-800">Backend Developer Görevi</h4>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider">
                            Tamamlandı
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex items-center justify-between bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/50">
                            <span className="font-medium text-gray-700">Ödenen Bütçe: ₺15,000</span>
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <FiCheckCircle className="w-3.5 h-3.5" /> Aktarıldı
                            </span>
                          </div>

                          <div className="space-y-1.5 border border-[#dfded6]/50 p-3 rounded-lg bg-gray-50/50">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[10px] text-gray-400 uppercase">Aday Değerlendirmesi</span>
                              <div className="flex gap-0.5 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar key={i} size={10} className="fill-[#e28743] text-[#e28743]" />
                                ))}
                              </div>
                            </div>
                            <p className="text-[11px] text-gray-550 italic">"Süper kod kalitesi ve hızlı teslimat."</p>
                          </div>

                          <div className="flex gap-3 items-center bg-amber-50/30 p-2.5 rounded-lg border border-amber-100">
                            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 border border-amber-200">
                              <FiAward className="w-3.5 h-3.5 text-[#e28743]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h5 className="text-[10px] font-bold text-gray-900 leading-tight">Verified Node.js Specialist</h5>
                              <p className="text-[8px] text-gray-450 font-semibold">Cüzdana Rozet Gönderildi</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer simulation */}
                <div className="text-center text-[9px] text-[#004d40] bg-white pt-3 pb-3 border-t border-[#dfded6]/30 select-none font-mono font-bold tracking-wider">
                  Sinerji Core v2.0 // Active Matching Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#faf9f6] relative overflow-hidden">
        <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-[#004d40]/3 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-[#e28743]/5 rounded-full blur-3xl" />

        <div className="relative app-container px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-[#004d40] text-sm font-bold tracking-wider uppercase mb-4">
                Öğrenciler İçin
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-heading">
                Kariyerine Burada Başla
              </h2>
              <p className="text-gray-550 text-lg mb-8 leading-relaxed">
                Üniversitende öğrendiklerini gerçek projelerde uygula.
              </p>

              <button
                onClick={openRegister}
                className="bg-[#004d40] hover:bg-[#00695c] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2"
              >
                Öğrenci Olarak Katıl
                <FiArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { value: stats.students.toString(), label: "Öğrenci", icon: FiUsers, color: "#004d40" },
                { value: "4.9", label: "Ortalama Puan", icon: FiStar, color: "#e28743" },
                { value: stats.badges.toString(), label: "Rozet", icon: FiAward, color: "#004d40" },
                { value: "%94", label: "Memnuniyet", icon: FiTrendingUp, color: "#e28743" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-center mx-auto mb-3">
                    <stat.icon size={36} style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 font-heading">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-550 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY BENEFITS SECTION */}
      <section className="py-24 bg-[#00342b] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#e28743] rounded-full blur-3xl" />
          <div className="absolute top-10 right-10 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative app-container px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Stats & Cards */}
            <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
              {[
                { value: stats.companies.toString(), label: "Aktif Şirket", icon: FiBriefcase, color: "#e28743" },
                { value: "%100", label: "AI Filtreleme Gücü", icon: FiZap, color: "#e28743" },
                { value: "₺150k+", label: "Ödenen Proje Bütçesi", icon: FiAward, color: "#e28743" },
                { value: "%40+", label: "Maliyet Tasarrufu", icon: FiTrendingUp, color: "#e28743" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center shadow-md"
                >
                  <div className="flex items-center justify-center mx-auto mb-3">
                    <stat.icon size={36} style={{ color: stat.color }} />
                  </div>
                  <p className="text-2xl font-bold text-white font-heading">
                    {stat.value}
                  </p>
                  <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Right Column: Text & CTA */}
            <div className="space-y-6 order-1 lg:order-2">
              <span className="inline-block text-[#e28743] text-sm font-bold tracking-wider uppercase">
                Şirketler İçin
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white font-heading">
                Proje Maliyetlerinizi %40'a Varan Oranlarda Düşürün
              </h2>
              <p className="text-white/80 text-base leading-relaxed">
                Sinerji, şirketlerin üniversitelerin en parlak beyinlerine doğrudan ulaşmasını sağlar. Yapay zeka destekli otomatik aday filtreleme sistemiyle mülakat süreçlerini sıfıra indirir, onaylı akademik profiller sayesinde risk almadan projelerinizi teslim alırsınız.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  "Gereksiz mülakat süreçlerini AI uyum puanı ile sonlandırın.",
                  "E-Devlet onaylı öğrencilerle güvenli ve resmi çalışma yapın.",
                  "Ödemeyi Escrow sistemiyle güvence altına alın, iş onaylanınca aktarın."
                ].map((point, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-white/90">
                    <FiCheckCircle className="text-[#e28743] shrink-0 mt-1" size={16} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={openRegister}
                  className="bg-[#e28743] hover:bg-[#cf7b3c] text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-2 shadow-lg shadow-[#e28743]/20"
                >
                  Şirket Olarak Kaydol
                  <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY & TRUST PROTOCOL SECTION */}
      <section className="py-24 bg-[#faf9f6] relative overflow-hidden border-t border-[#dfded6]/30">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#004d40]/1.5 rounded-full blur-3xl" />

        <div className="relative app-container px-6">
          <div className="text-center mb-16">
            <span className="inline-block text-[#e28743] text-sm font-bold tracking-wider uppercase mb-4">
              Güvenlik ve Şeffaflık
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
              Sinerji Güven Protokolü
            </h2>
            <p className="text-gray-550 max-w-xl mx-auto text-sm leading-relaxed">
              Hem öğrenciler hem de şirketler için sıfır risk ve maksimum güvenle çalışabileceğiniz dijital altyapı.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "e-Devlet Akademik Doğrulama",
                desc: "Öğrencilerin akademik durumları resmi e-Devlet YÖK sisteminden Puppeteer scraper altyapısıyla anında doğrulanır. Sahte profil riski sıfırdır.",
                icon: FiCheckCircle,
                badge: "Resmi Entegrasyon",
                badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
              {
                title: "Güvenli Havuz (Escrow) Sistemi",
                desc: "Şirket bütçeyi görev başlamadan önce sisteme aktarır ve dondurulur. Öğrenci işi tamamlayıp şirket onay verince ödeme hesaba aktarılır.",
                icon: FiShield,
                badge: "Finansal Güvence",
                badgeBg: "bg-amber-50 text-amber-700 border-amber-100",
              },
              {
                title: "Doğrulanmış Başarı Rozetleri",
                desc: "Tamamlanan projeler sonrasında şirketlerin verdiği rozetler ve değerlendirmeler öğrencinin profiline kalıcı olarak kaydedilir ve değiştirilemez.",
                icon: FiAward,
                badge: "Kalıcı İtibar",
                badgeBg: "bg-teal-50 text-teal-700 border-teal-100",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#dfded6] rounded-3xl p-8 hover-card-effect shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-6">
                  {/* Top Badge & Icon */}
                  <div className="flex justify-between items-center">
                    <span className="w-12 h-12 rounded-2xl bg-[#004d40]/5 text-[#004d40] flex items-center justify-center">
                      <item.icon size={24} />
                    </span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 text-lg tracking-tight font-heading">
                      {item.title}
                    </h3>
                    <p className="text-gray-550 text-xs leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#004d40] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#e28743] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">
            Harekete Geç, <span className="text-[#e28743]">Fırsatı Yakala</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="app-container px-6 text-center">
          <h4 className="text-white font-bold text-xl mb-4 font-heading">
            BridgePlatform
          </h4>
          <p className="text-sm">
            © {new Date().getFullYear()} BridgePlatform. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
