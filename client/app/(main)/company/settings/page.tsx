"use client";

import { useState } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
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
import Input from "@/components/ui/Input";

// ─── shared styles ────────────────────────────────────────────────────────
const bodyInputCls = "px-4 py-2.5 text-[#004d40] bg-gray-50 border border-gray-200 focus:border-[#004d40] focus:ring-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm rounded-xl transition-all outline-none w-full";



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
          <div className="space-y-4">
            <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] -mx-4 px-4 bg-gray-50/50 rounded-xl">
              <FiMail className="text-[#004d40] shrink-0" size={18} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">E-posta Adresi</p>
                <p className="text-[14px] font-medium text-[#0b1c30] truncate">{user?.email ?? "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-3.5 border-b border-[#f1f0ea] -mx-4 px-4 bg-gray-50/50 rounded-xl">
              <FiShield className="text-[#004d40] shrink-0" size={18} />
              <div className="flex-1 min-w-0 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Hesap Türü</p>
                  <p className="text-[14px] font-medium text-[#0b1c30] truncate">Şirket Yetkilisi</p>
                </div>
                <span className="text-[10px] font-bold bg-[#004d40]/10 text-[#004d40] px-2.5 py-1 rounded-full uppercase tracking-wider">Aktif</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 font-medium mt-3 italic">
              * Giriş e-posta adresinizi güncellemek isterseniz lütfen destek ekibiyle iletişime geçin.
            </p>
          </div>
        </SectionCard>

        {/* ② Şifre Değiştir */}
        <SectionCard
          icon={FiLock}
          title="Güvenlik ve Şifre"
          description="Hesabınızı güvende tutmak için şifrenizi düzenli aralıklarla güncelleyin."
        >
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00342b] mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  {...pwField("current")}
                  className={`${bodyInputCls} pr-12`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004d40] transition-colors"
                >
                  {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00342b] mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  {...pwField("next")}
                  className={`${bodyInputCls} pr-12`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004d40] transition-colors"
                >
                  {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#00342b] mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <Input
                type="password"
                {...pwField("confirm")}
                className={bodyInputCls}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-3 flex justify-start">
              <PrimaryButton type="submit" isLoading={pwLoading} className="px-8">
                Şifreyi Güncelle
              </PrimaryButton>
            </div>
          </form>
        </SectionCard>

        {/* ③ Bildirim Tercihleri */}
        <SectionCard
          icon={FiBell}
          title="Bildirim Tercihleri"
          description="E-posta ve sistem üzerinden hangi güncellemeleri almak istediğinizi özelleştirin."
        >
          <div className="border border-[#f1f0ea] rounded-xl overflow-hidden bg-gray-50/30">
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
              <PrimaryButton icon={FiLogOut} className="bg-white text-red-600 border border-red-200 hover:bg-red-50" onClick={handleLogout}>
                Çıkış Yap
              </PrimaryButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
              <div>
                <h4 className="text-sm font-bold text-red-700">Hesabı Sil</h4>
                <p className="text-xs font-medium text-red-500 mt-0.5">Bu işlem geri alınamaz ve tüm verileriniz silinir.</p>
              </div>
              <PrimaryButton icon={FiAlertTriangle} className="bg-red-600 text-white hover:bg-red-700 border-none shrink-0" onClick={() => showToast("Hesap silme özelliği yakında kullanılabilir olacaktır.", "error")}>
                Hesabı Kalıcı Olarak Sil
              </PrimaryButton>
            </div>
          </div>
        </SectionCard>

      </div>

    </div>
  );
}
