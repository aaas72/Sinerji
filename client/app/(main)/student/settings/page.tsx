"use client";

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  FiLock,
  FiBell,
  FiEye,
  FiEyeOff,
  FiLogOut,
  FiAlertTriangle,
  FiUser,
  FiMail,
  FiCheckCircle,
  FiUploadCloud,
  FiCreditCard
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import SectionCard from "@/components/ui/cards/SectionCard";
import { FormInput, FormButton } from "@/components/ui/form";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { studentService } from "@/services/student.service";
import { useSocket } from "@/context/SocketContext";

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
    <label className="flex items-center justify-between cursor-pointer py-3.5 border-b border-[#f1f0ea] last:border-0 px-4 -mx-4 rounded-xl transition-colors select-none">
      <span className="text-[14px] font-medium text-[#0b1c30] transition-colors">{label}</span>
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
  const { socket, connected } = useSocket();
  const { showToast } = useToast();
  const { user, logout, checkAuth } = useAuthStore();
  const router = useRouter();

  /* Bank Settings Form */
  const [bankLoading, setBankLoading] = useState(false);
  const [bankForm, setBankForm] = useState({
    name: "",
    surname: "",
    email: "",
    gsmNumber: "",
    identityNumber: "",
    iban: "",
    address: ""
  });

  // Pre-fill student info if user info is available
  useEffect(() => {
    if (user) {
      const names = user.studentProfile?.full_name?.split(" ") || [];
      const name = names[0] || "";
      const surname = names.slice(1).join(" ") || "";
      setBankForm({
        name,
        surname,
        email: user.email || "",
        gsmNumber: user.studentProfile?.phone || "+90",
        identityNumber: "",
        iban: "",
        address: ""
      });
    }
  }, [user]);

  const handleBankSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankLoading(true);
    try {
      await studentService.registerBankDetails(bankForm);
      showToast("Banka hesabınız Iyzico sistemine başarıyla tanımlandı.", "success");
      await checkAuth(); // Refresh profile state to show success box
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Banka bilgileri kaydedilemedi.", "error");
    } finally {
      setBankLoading(false);
    }
  };

  /* Verification State */
  const [verifyLoading, setVerifyLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerifyDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Lütfen sadece PDF dosyası yükleyin.", "error");
      return;
    }

    setVerifyLoading(true);
    
    try {
      const res = await studentService.verifyDocument(file);
      showToast(res.message || "Tebrikler! Hesabınız başarıyla doğrulandı.", "success");
      await checkAuth(); // Refresh profile state (is_verified, university, major)
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Doğrulama işlemi başarısız oldu.", "error");
    } finally {
      setVerifyLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
    <div className="w-full app-container px-4 md:px-8 py-10 flex flex-col gap-8 min-h-screen font-sans">
      {/* ── Page Header ── */}
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-[#00342b] tracking-tight mb-2">Hesap Ayarları</h1>
        <p className="text-[#565e74] font-medium text-sm">
          Güvenlik ayarlarınızı ve bildirim tercihlerinizi yönetin.
        </p>
      </div>

      <div className="w-full space-y-8">

        {/* ⓪ Öğrenci Kimlik Doğrulaması */}
        {user?.role === 'student' && (
          <SectionCard
            icon={user.studentProfile?.is_verified ? FiCheckCircle : FiUploadCloud}
            title="Öğrenci Kimlik Doğrulaması"
            description="Platformdaki iş ve staj ilanlarına başvurabilmek için e-Devlet Öğrenci Belgeniz ile hesabınızı doğrulamanız gerekmektedir."
          >
            <div className="max-w-2xl">
              {user.studentProfile?.is_verified ? (
                <div className="bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <FiCheckCircle size={20} />
                    <span>Hesabınız başarıyla doğrulandı!</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Öğrenci Adı:</strong> {user.studentProfile.full_name}</p>
                    <p><strong>Üniversite:</strong> {user.studentProfile.university}</p>
                    <p><strong>Bölüm:</strong> {user.studentProfile.major}</p>
                    {user.studentProfile.last_verified_at && (
                      <p><strong>Son Doğrulama Tarihi:</strong> {new Date(user.studentProfile.last_verified_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    )}
                    <p className="mt-2 text-xs opacity-80 pt-2 border-t border-[#a5d6a7]">Bu bilgiler devlet sisteminden otomatik çekilmiştir ve güvenliğiniz için değiştirilemez.</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="bg-transparent border border-[#dfded6] text-[#565e74] p-5 rounded-xl text-sm leading-relaxed">
                    <strong className="text-[#0b1c30] text-base">Doğrulama Adımları:</strong>
                    <ol className="list-decimal list-inside mt-3 space-y-2">
                      <li>e-Devlet kapısına giriş yapın ve <strong className="text-[#0b1c30]">YÖK Öğrenci Belgesi Sorgulama</strong> sayfasına gidin.</li>
                      <li>Barkodlu yeni bir belge oluşturun (Belge tarihi 1 haftadan eski olmamalıdır).</li>
                      <li>Oluşturulan <strong className="text-[#0b1c30]">PDF dosyasını</strong> indirip buraya yükleyin.</li>
                    </ol>
                  </div>
                  
                  <div className="mt-2">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleVerifyDocument}
                    />
                    <FormButton 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      isLoading={verifyLoading}
                      disabled={verifyLoading}
                      className="!rounded-full px-8"
                    >
                      {verifyLoading ? "e-Devlet üzerinden doğrulanıyor..." : "YÖK PDF Belgesi Yükle"}
                    </FormButton>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Banka Hesabı Tanımlama */}
        {user?.role === 'student' && (
          <SectionCard
            icon={FiCreditCard}
            title="Banka Hesabı Tanımlama"
            description="Tamamladığınız görevlerin ödemelerini doğrudan banka hesabınıza alabilmek için Iyzico entegrasyonu için banka bilgilerinizi tanımlayın."
          >
            <div className="max-w-2xl">
              {user.studentProfile?.sub_merchant_key ? (
                <div className="bg-[#e0f2f1] border border-[#80cbc4] text-[#004d40] p-4 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <FiCheckCircle size={20} />
                    <span>Iyzico Banka Hesabınız Tanımlandı!</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Merchant Anahtarı:</strong> {user.studentProfile.sub_merchant_key}</p>
                    <p className="mt-2 text-xs opacity-80 pt-2 border-t border-[#80cbc4]">Bütçe ödemeleriniz Iyzico Marketplace sistemi üzerinden bu hesaba yönlendirilecektir. Değişiklik yapmak için destek ekibi ile iletişime geçin.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBankSetup} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Ad"
                      value={bankForm.name}
                      onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                      placeholder="Öğrencinin Adı"
                      className="!rounded-full pl-5"
                      required
                    />
                    <FormInput
                      label="Soyad"
                      value={bankForm.surname}
                      onChange={(e) => setBankForm({ ...bankForm, surname: e.target.value })}
                      placeholder="Öğrencinin Soyadı"
                      className="!rounded-full pl-5"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="E-posta"
                      type="email"
                      value={bankForm.email}
                      onChange={(e) => setBankForm({ ...bankForm, email: e.target.value })}
                      placeholder="ogrenci@email.com"
                      className="!rounded-full pl-5"
                      required
                    />
                    <FormInput
                      label="Telefon (+90 ile)"
                      value={bankForm.gsmNumber}
                      onChange={(e) => setBankForm({ ...bankForm, gsmNumber: e.target.value })}
                      placeholder="+905555555555"
                      className="!rounded-full pl-5"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="T.C. Kimlik Numarası (TCKN)"
                      value={bankForm.identityNumber}
                      onChange={(e) => setBankForm({ ...bankForm, identityNumber: e.target.value })}
                      placeholder="11111111111"
                      maxLength={11}
                      className="!rounded-full pl-5"
                      required
                    />
                    <FormInput
                      label="IBAN"
                      value={bankForm.iban}
                      onChange={(e) => setBankForm({ ...bankForm, iban: e.target.value })}
                      placeholder="TR000000000000000000000000"
                      className="!rounded-full pl-5"
                      required
                    />
                  </div>

                  <FormInput
                    label="Adres"
                    value={bankForm.address}
                    onChange={(e) => setBankForm({ ...bankForm, address: e.target.value })}
                    placeholder="Adres bilgisi (Iyzico KYC doğrulama için gereklidir)"
                    className="!rounded-full pl-5"
                    required
                  />

                  <div className="pt-2">
                    <FormButton
                      type="submit"
                      isLoading={bankLoading}
                      disabled={bankLoading}
                      className="!rounded-full px-8"
                    >
                      Banka Bilgilerini Kaydet
                    </FormButton>
                  </div>
                </form>
              )}
            </div>
          </SectionCard>
        )}

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
        >
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center justify-between py-4 border-b border-[#f1f0ea]">
              <div>
                <h4 className="text-sm font-bold text-[#0b1c30]">Oturumu Kapat</h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Aktif hesabınızdan güvenli bir şekilde çıkış yapın.</p>
              </div>
              <FormButton variant="outline" icon={FiLogOut} className="!rounded-full" onClick={handleLogout}>
                Çıkış Yap
              </FormButton>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-4">
              <div>
                <h4 className="text-sm font-bold text-[#0b1c30]">Hesabı Sil</h4>
                <p className="text-xs font-medium text-gray-500 mt-0.5">Bu işlem geri alınamaz ve tüm verileriniz silinir.</p>
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
