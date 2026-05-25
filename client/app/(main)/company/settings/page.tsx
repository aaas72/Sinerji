"use client";

import { useState, useEffect, useRef } from "react";
import SectionCard from "@/components/ui/cards/SectionCard";
import {
  FiLock,
  FiBell,
  FiShield,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiUser,
  FiMail,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import { companyService } from "@/services/company.service";
import { uploadService } from "@/services/upload.service";
import { CompanyProfile } from "@/types/company";
import { FormInput, FormButton, FormTextarea } from "@/components/ui/form";
import { FiCamera } from "react-icons/fi";

// ─── shared styles ────────────────────────────────────────────────────────

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

export default function CompanySettingsPage() {
  const { showToast } = useToast();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  /* şifre formu */
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const pwField = (k: keyof typeof pw) => ({
    value: pw[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setPw((p) => ({ ...p, [k]: e.target.value })),
  });

  /* Company Profile State */
  const [profile, setProfile] = useState<Partial<CompanyProfile>>({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    companyService.getMyProfile().then((data) => {
      setProfile(data);
      setFetching(false);
    }).catch((err) => {
      console.error(err);
      setFetching(false);
    });
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await companyService.updateMyProfile(profile);
      showToast("Şirket bilgileriniz güncellendi.", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || "Bilgiler güncellenemedi.", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const res = await uploadService.uploadFile(file);
        setProfile(prev => ({ ...prev, logo_url: res.url }));
        showToast("Logo başarıyla yüklendi. Kaydetmeyi unutmayın.", "success");
      } catch (err) {
        showToast("Logo yüklenirken hata oluştu.", "error");
      }
    }
  };

  /* bildirim tercihleri */
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
      
      {/* ── Page Header ── */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#00342b] tracking-tight mb-2">Ayarlar</h1>
        <p className="text-[#565e74] font-medium text-sm">
          Hesap bilgilerinizi, güvenlik ayarlarınızı ve bildirim tercihlerinizi buradan yönetebilirsiniz.
        </p>
      </div>

      <div className="w-full space-y-8">
          
        {/* ① Hesap Bilgileri */}
        <SectionCard
          icon={FiUser}
          title="Şirket Bilgileri"
          description="Şirketinize ait genel bilgileri ve iletişim adreslerini buradan güncelleyebilirsiniz."
        >
          {fetching ? (
            <div className="py-4 text-sm text-gray-500 animate-pulse">Yükleniyor...</div>
          ) : (
            <form className="space-y-5 max-w-lg" onSubmit={handleProfileUpdate}>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24 rounded-full bg-[#00342b]/5 border border-[#dfded6] flex flex-col items-center justify-center text-[#00342b] overflow-hidden group">
                  {profile.logo_url ? (
                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <FiCamera className="w-8 h-8 opacity-50" />
                  )}
                  <div 
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white text-xs font-bold">Değiştir</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/jpeg, image/png, image/jpg"
                    onChange={handleLogoUpload}
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0b1c30]">Şirket Logosu</h4>
                  <p className="text-xs text-gray-500 mt-1">JPEG veya PNG. Max 5MB.</p>
                </div>
              </div>

              <FormInput
                label="Şirket Adı"
                type="text"
                value={profile.company_name || ""}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                className="!rounded-full px-5"
                icon={FiUser}
              />

              <FormInput
                label="E-posta Adresi (Oturum)"
                type="email"
                value={user?.email ?? ""}
                className="!rounded-full px-5 opacity-70"
                icon={FiMail}
                disabled
              />

              <FormTextarea
                label="Şirket Hakkında (Açıklama)"
                value={profile.description || ""}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                rows={4}
                className="!rounded-2xl px-5 py-3"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormInput
                  label="Endüstri / Sektör"
                  type="text"
                  value={profile.industry || ""}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  className="!rounded-full px-5"
                />
                <FormInput
                  label="Konum (Şehir/Ülke)"
                  type="text"
                  value={profile.location || ""}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="!rounded-full px-5"
                />
              </div>

              <FormInput
                label="Web Sitesi"
                type="url"
                value={profile.website_url || ""}
                onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                placeholder="https://sirketiniz.com"
                className="!rounded-full px-5"
              />

              <div className="pt-2 flex justify-start">
                <FormButton type="submit" isLoading={profileLoading} className="!rounded-full px-8">
                  Değişiklikleri Kaydet
                </FormButton>
              </div>
            </form>
          )}
        </SectionCard>

        {/* ② Şifre Değiştir */}
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

        {/* ③ Bildirim Tercihleri */}
        <SectionCard
          icon={FiBell}
          title="Bildirim Tercihleri"
          description="E-posta ve sistem üzerinden hangi güncellemeleri almak istediğinizi özelleştirin."
        >
          <div className="border border-[#f1f0ea] rounded-xl overflow-hidden">
            <Toggle
              checked={notifs.newApplication}
              onChange={() => toggle("newApplication")}
              label="Yeni bir öğrenci başvurusu geldiğinde bildir"
            />
            <Toggle
              checked={notifs.taskUpdate}
              onChange={() => toggle("taskUpdate")}
              label="Eklenen görevlerin durumu güncellendiğinde bildir"
            />
            <Toggle
              checked={notifs.systemAnnouncement}
              onChange={() => toggle("systemAnnouncement")}
              label="Sinerji sistem duyurularını ve güncellemelerini al"
            />
            <Toggle
              checked={notifs.weeklyReport}
              onChange={() => toggle("weeklyReport")}
              label="Haftalık performans ve özet raporunu e-posta ile gönder"
            />
          </div>
        </SectionCard>

        {/* ④ Oturum Yönetimi & Tehlike Bölgesi */}
        <SectionCard
          icon={FiAlertTriangle}
          title="Hesap İşlemleri"
          description="Oturumunuzu sonlandırabilir veya hesabınızı kalıcı olarak silebilirsiniz."
          accent
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50">
              <div>
                <h4 className="text-sm font-bold text-red-700">Oturumu Kapat</h4>
                <p className="text-xs font-medium text-red-500 mt-0.5">Aktif hesabınızdan güvenli bir şekilde çıkış yapın.</p>
              </div>
              <FormButton variant="outline" icon={FiLogOut} className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={handleLogout}>
                Çıkış Yap
              </FormButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
              <div>
                <h4 className="text-sm font-bold text-red-700">Hesabı Sil</h4>
                <p className="text-xs font-medium text-red-500 mt-0.5">Bu işlem geri alınamaz ve tüm verileriniz silinir.</p>
              </div>
              <FormButton variant="danger" icon={FiAlertTriangle} className="shrink-0" onClick={() => showToast("Hesap silme özelliği yakında kullanılabilir olacaktır.", "error")}>
                Hesabı Kalıcı Olarak Sil
              </FormButton>
            </div>
          </div>
        </SectionCard>

      </div>

    </div>
  );
}
