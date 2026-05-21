"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import {
  FiLock,
  FiBell,
  FiShield,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiLogOut,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

/* ─── küçük yardımcı bileşenler ─── */

function SettingCard({
  icon: Icon,
  title,
  description,
  accent = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-6 md:p-8 shadow-2xs hover:shadow-xs transition-all ${accent ? "border-red-200 bg-red-50/10" : "border-[#f1f0ea]"}`}>
      <div className="flex flex-col md:flex-row gap-6">
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
            accent
              ? "bg-red-50 text-red-600"
              : "bg-[#004d40]/5 text-[#004d40]"
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-lg font-bold font-heading mb-1 ${
              accent ? "text-red-700" : "text-gray-900"
            }`}
          >
            {title}
          </h3>
          <p
            className={`text-sm mb-6 ${
              accent ? "text-red-400" : "text-[#565e74] font-medium"
            }`}
          >
            {description}
          </p>
          {children}
        </div>
      </div>
    </div>
  );
}

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
    <label className="flex items-center justify-between cursor-pointer py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/30 px-2 rounded-xl transition-all select-none">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
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

/* ─── ana sayfa ─── */

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] outline-none transition-all hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm";

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
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      
      {/* ── Page Header ── */}
      <header className="relative overflow-hidden rounded-xl border border-[#f1f0ea] bg-white p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff4ff] to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40] shrink-0">
            <FiShield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-[28px] md:text-[36px] font-extrabold leading-tight text-[#00342b] font-heading">
              Ayarlar
            </h1>
            <p className="text-sm text-[#565e74] font-medium mt-0.5">
              Hesap bilgilerinizi, güvenlik ayarlarınızı ve bildirim tercihlerinizi yönetin
            </p>
          </div>
        </div>
      </header>

      {/* ── Settings Sections ── */}
      <div className="space-y-6">

        {/* ① Hesap Bilgileri */}
        <SettingCard
          icon={FiShield}
          title="Hesap Bilgileri"
          description="Hesabınıza ait temel profil bilgileri."
        >
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4 max-w-xl border border-[#f1f0ea]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-sm text-[#565e74] font-medium">E-posta Adresi</span>
              <span className="text-sm font-bold text-gray-800">
                {user?.email ?? "—"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-gray-200/60 pt-4">
              <span className="text-sm text-[#565e74] font-medium">Hesap Türü</span>
              <span className="self-start text-xs font-semibold bg-[#004d40]/5 text-[#004d40] px-3 py-1 rounded-full">
                Şirket Yetkilisi
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-3">
            Giriş e-posta adresinizi güncellemek isterseniz lütfen destek ekibiyle iletişime geçin.
          </p>
        </SettingCard>

        {/* ② Şifre Değiştir */}
        <SettingCard
          icon={FiLock}
          title="Şifre Değiştir"
          description="Hesabınızı güvende tutmak için şifrenizi düzenli aralıklarla güncelleyin."
        >
          <form
            onSubmit={handlePasswordChange}
            className="space-y-5 max-w-xl"
          >
            {/* mevcut şifre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  {...pwField("current")}
                  className={`${inputCls} pr-12`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showCurrent ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* yeni şifre */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  {...pwField("next")}
                  className={`${inputCls} pr-12`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNew ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* tekrar */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                {...pwField("confirm")}
                className={inputCls}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={pwLoading}
                className="px-6 py-2.5 rounded-xl bg-[#004d40] hover:bg-[#00342b] text-white text-sm font-semibold transition-all shadow-xs"
              >
                {pwLoading ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              </Button>
            </div>
          </form>
        </SettingCard>

        {/* ③ Bildirim Tercihleri */}
        <SettingCard
          icon={FiBell}
          title="Bildirim Tercihleri"
          description="E-posta ve sistem üzerinden hangi güncellemeleri almak istediğinizi özelleştirin."
        >
          <div className="max-w-xl border border-[#f1f0ea] rounded-2xl overflow-hidden p-4 bg-gray-50/20">
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
        </SettingCard>

        {/* ④ Oturum Yönetimi */}
        <SettingCard
          icon={FiLogOut}
          title="Oturum"
          description="Aktif hesabınızdan güvenli bir şekilde çıkış yapın."
        >
          <Button
            variant="outline"
            icon={FiLogOut}
            onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all font-semibold"
          >
            Çıkış Yap
          </Button>
        </SettingCard>

        {/* ⑤ Tehlike Bölgesi */}
        <SettingCard
          icon={FiAlertTriangle}
          title="Tehlike Bölgesi"
          description="Bu işlemler geri alınamaz ve hesabınızın tamamen silinmesine yol açabilir."
          accent
        >
          <Button
            variant="outline"
            className="px-6 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-all font-semibold"
            onClick={() =>
              showToast("Hesap silme özelliği yakında kullanılabilir olacaktır.", "error")
            }
          >
            Hesabı Kalıcı Olarak Sil
          </Button>
        </SettingCard>

      </div>
    </div>
  );
}
