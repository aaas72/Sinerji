"use client";

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth.service";
import { studentService } from "@/services/student.service";
import { uploadService } from "@/services/upload.service";
import { StudentProfile } from "@/types/student";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiBell,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiAlertTriangle,
  FiFileText,
  FiUser,
  FiMail,
  FiGithub,
  FiLinkedin,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import SectionCard from "@/components/ui/cards/SectionCard";
import { FormInput, FormButton } from "@/components/ui/form";
import Breadcrumb from "@/components/ui/Breadcrumb";

// Shared Toggle component
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-3.5 border-b border-[#f1f0ea] last:border-0 hover:bg-gray-50/50 px-4 -mx-4 rounded-xl transition-colors select-none group">
      <span className="text-[14px] font-medium text-[#0b1c30] group-hover:text-[#004d40] transition-colors">{label}</span>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#004d40]" : "bg-gray-200"
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function StudentSettingsPage() {
  const { showToast } = useToast();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  /* Password Form */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const pwField = (k: keyof typeof pw) => ({
    value: pw[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setPw((p) => ({ ...p, [k]: e.target.value })),
  });

  /* Profile Form */
  const [profile, setProfile] = useState<Partial<StudentProfile>>({});
  const [fetchingProfile, setFetchingProfile] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    studentService.getProfile().then((data) => {
      setProfile(data);
      setFetchingProfile(false);
    }).catch((err) => {
      console.error(err);
      setFetchingProfile(false);
    });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await studentService.updateProfile({
        full_name: profile.full_name ?? undefined,
        github_url: profile.github_url ?? undefined,
        linkedin_url: profile.linkedin_url ?? undefined,
        cv_url: profile.cv_url ?? undefined,
        bio: profile.bio ?? undefined,
      });
      showToast("Bilgileriniz güncellendi.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Bilgiler güncellenemedi.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const res = await uploadService.uploadFile(file);
        setProfile(prev => ({ ...prev, cv_url: res.url }));
        showToast("Özgeçmiş başarıyla yüklendi. Kaydetmeyi unutmayın.", "success");
      } catch (err) {
        showToast("Özgeçmiş yüklenirken hata oluştu.", "error");
      }
    }
  };

  /* Notification Preferences */
  const [notifs, setNotifs] = useState({
    newApplication: true,
    taskUpdate: true,
    systemAnnouncement: false,
    weeklyReport: false,
  });
  const toggle = (k: keyof typeof notifs) =>
    setNotifs((n) => ({ ...n, [k]: !n[k] }));

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next !== pw.confirm) {
      showToast("Yeni şifreler eşleşmiyor.", "error");
      return;
    }
    if (pw.next.length < 6) {
      showToast("Yeni şifre en az 6 karakter olmalıdır.", "error");
      return;
    }
    setPwLoading(true);
    try {
      await authService.changePassword(pw.current, pw.next);
      showToast("Şifreniz başarıyla değiştirildi.", "success");
      setPw({ current: "", next: "", confirm: "" });
    } catch (err: any) {
      showToast(err.response?.data?.message || "Şifre değiştirilemedi.", "error");
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 flex flex-col gap-8 min-h-screen font-sans">
      <Breadcrumb
        items={[
          { label: "Öğrenci Paneli", href: `/student/tasks` },
          { label: "Hesap Ayarları", active: true },
        ]}
      />
      
      {/* ── Page Header ── */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#00342b] tracking-tight mb-2">Hesap Ayarları</h1>
        <p className="text-[#565e74] font-medium text-sm">
          Güvenlik ayarlarınızı ve bildirim tercihlerinizi yönetin.
        </p>
      </div>

      <div className="w-full space-y-8">

        {/* ⓪ Hesap ve Profil Bilgileri */}
        <SectionCard
          icon={FiUser}
          title="Profil Bilgileri"
          description="Kişisel bilgilerinizi, sosyal medya hesaplarınızı ve özgeçmişinizi yönetin."
        >
          {fetchingProfile ? (
            <div className="py-4 text-sm text-gray-500 animate-pulse">Yükleniyor...</div>
          ) : (
            <form className="space-y-5 max-w-lg" onSubmit={handleProfileUpdate}>
              <FormInput
                label="Ad Soyad"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="!rounded-full px-5"
                icon={FiUser}
              />
              <FormInput
                label="E-posta Adresi (Oturum)"
                type="email"
                value={user?.email || ""}
                className="!rounded-full px-5 opacity-70"
                icon={FiMail}
                disabled
              />

              <FormInput
                label="GitHub Profil Linki"
                type="url"
                value={profile.github_url || ""}
                onChange={(e) => setProfile({ ...profile, github_url: e.target.value })}
                placeholder="https://github.com/kullaniciadi"
                className="!rounded-full px-5"
                icon={FiGithub}
              />

              <FormInput
                label="LinkedIn Profil Linki"
                type="url"
                value={profile.linkedin_url || ""}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/kullaniciadi"
                className="!rounded-full px-5"
                icon={FiLinkedin}
              />

              {/* CV Upload */}
              <div className="mt-4">
                <label className="block text-sm font-bold text-[#00342b] mb-2">Özgeçmiş (CV)</label>
                <div className="flex items-center gap-4 p-4 border border-[#dfded6] rounded-2xl bg-[#fcfbf7]">
                  <div className="w-12 h-12 bg-[#00342b]/10 rounded-full flex items-center justify-center shrink-0">
                    <FiFileText className="w-6 h-6 text-[#00342b]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {profile.cv_url ? (
                      <div>
                        <p className="text-sm font-bold text-[#0b1c30] truncate">Yüklü Özgeçmiş</p>
                        <a href={profile.cv_url} target="_blank" rel="noreferrer" className="text-xs text-[#004d40] hover:underline truncate block">Görüntüle</a>
                      </div>
                    ) : (
                      <p className="text-sm font-medium text-gray-500">Henüz CV yüklemediniz.</p>
                    )}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 px-4 py-2 bg-white border border-[#dfded6] rounded-full text-xs font-bold text-[#0b1c30] hover:bg-gray-50"
                  >
                    Yükle/Değiştir
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="application/pdf"
                    onChange={handleCVUpload}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-start">
                <FormButton type="submit" isLoading={profileLoading} className="!rounded-full px-8">
                  Değişiklikleri Kaydet
                </FormButton>
              </div>
            </form>
          )}
        </SectionCard>

        {/* ① Güvenlik ve Şifre */}
        <SectionCard
          icon={FiLock}
          title="Güvenlik ve Şifre"
          description="Hesabınızı güvende tutmak için şifrenizi düzenli aralıklarla güncelleyin."
        >
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
            <div className="relative">
              <FormInput
                label="Mevcut Şifre"
                type={showCurrent ? "text" : "password"}
                {...pwField("current")}
                className="pr-12 !rounded-full pl-5"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-4 bottom-3 text-gray-400 hover:text-[#004d40] transition-colors"
              >
                {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <FormInput
                label="Yeni Şifre"
                type={showNew ? "text" : "password"}
                {...pwField("next")}
                className="pr-12 !rounded-full pl-5"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                className="absolute right-4 bottom-3 text-gray-400 hover:text-[#004d40] transition-colors"
              >
                {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            <div>
              <FormInput
                label="Yeni Şifre (Tekrar)"
                type="password"
                {...pwField("confirm")}
                placeholder="••••••••"
                autoComplete="new-password"
                className="!rounded-full pl-5"
              />
            </div>

            <div className="pt-3 flex justify-start">
              <FormButton type="submit" isLoading={pwLoading} className="!rounded-full px-8">
                Şifreyi Güncelle
              </FormButton>
            </div>
          </form>
        </SectionCard>

        {/* ② Bildirim Tercihleri */}
        <SectionCard
          icon={FiBell}
          title="Bildirim Tercihleri"
          description="E-posta ve sistem üzerinden hangi güncellemeleri almak istediğinizi özelleştirin."
        >
          <div className="border border-[#f1f0ea] rounded-xl overflow-hidden max-w-2xl">
            <Toggle checked={notifs.newApplication} onChange={() => toggle("newApplication")} label="Başvurularım değerlendirildiğinde bildir" />
            <Toggle checked={notifs.taskUpdate} onChange={() => toggle("taskUpdate")} label="Yeni uygun görevler eklendiğinde haber ver" />
            <Toggle checked={notifs.systemAnnouncement} onChange={() => toggle("systemAnnouncement")} label="Sinerji sistem duyurularını ve güncellemelerini al" />
            <Toggle checked={notifs.weeklyReport} onChange={() => toggle("weeklyReport")} label="Haftalık performans ve özet raporunu e-posta ile gönder" />
          </div>
        </SectionCard>

        {/* ③ Oturum Yönetimi & Tehlike Bölgesi */}
        <SectionCard
          icon={FiAlertTriangle}
          title="Hesap İşlemleri"
          description="Oturumunuzu sonlandırabilir veya hesabınızı kalıcı olarak silebilirsiniz."
          accent
        >
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
              <div>
                <h4 className="text-sm font-bold text-red-700">Oturumu Kapat</h4>
                <p className="text-xs font-medium text-red-500 mt-0.5">Aktif hesabınızdan güvenli bir şekilde çıkış yapın.</p>
              </div>
              <FormButton variant="outline" icon={FiLogOut} className="text-red-600 border-red-200 hover:bg-red-50 bg-white !rounded-full" onClick={handleLogout}>
                Çıkış Yap
              </FormButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
              <div>
                <h4 className="text-sm font-bold text-red-700">Hesabı Sil</h4>
                <p className="text-xs font-medium text-red-500 mt-0.5">Bu işlem geri alınamaz ve tüm verileriniz silinir.</p>
              </div>
              <FormButton variant="danger" icon={FiAlertTriangle} className="shrink-0 !rounded-full" onClick={() => showToast("Hesap silme özelliği yakında kullanılabilir olacaktır.", "error")}>
                Hesabı Kalıcı Olarak Sil
              </FormButton>
            </div>
          </div>
        </SectionCard>

      </div>
    </div>
  );
}
