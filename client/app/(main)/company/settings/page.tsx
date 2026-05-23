"use client";

import { useState } from "react";
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
import { FormInput, FormButton } from "@/components/ui/form";

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
          title="Hesap Bilgileri"
          description="Hesabınıza ait temel profil ve iletişim bilgileri."
        >
          <form className="space-y-5 max-w-lg" onSubmit={(e) => { e.preventDefault(); showToast("Bilgileriniz güncellendi.", "success"); }}>
            <div>
              <FormInput
                label="Ad Soyad / Yetkili"
                type="text"
                defaultValue="Şirket Yetkilisi"
                className="!rounded-full px-5"
                icon={FiUser}
              />
            </div>
            
            <div>
              <FormInput
                label="E-posta Adresi"
                type="email"
                defaultValue={user?.email ?? ""}
                className="!rounded-full px-5"
                icon={FiMail}
              />
            </div>

            <div className="pt-2 flex justify-start">
              <FormButton type="submit" className="!rounded-full px-8">
                Değişiklikleri Kaydet
              </FormButton>
            </div>
            
            <p className="text-xs text-gray-400 font-medium mt-3 italic">
              * E-posta adresinizi değiştirmeniz durumunda onaylamanız gerekebilir.
            </p>
          </form>
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
