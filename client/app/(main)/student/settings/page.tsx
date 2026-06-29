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
  FiCheck,
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

  const [showDevletEdit, setShowDevletEdit] = useState(false);
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showBankEdit, setShowBankEdit] = useState(false);

  const handleBankSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setBankLoading(true);
    try {
      await studentService.registerBankDetails(bankForm);
      showToast("Banka hesabınız Iyzico sistemine başarıyla tanımlandı.", "success");
      await checkAuth(); // Refresh profile state to show success box
      setShowBankEdit(false);
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
      setShowDevletEdit(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Doğrulama işlemi başarısız oldu.", "error");
    } finally {
      setVerifyLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  /* University Email Verification State */
  const [uniEmail, setUniEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Load remaining timer on mount to persist across page refreshes
  useEffect(() => {
    const sentAtStr = localStorage.getItem("uni_email_code_sent_at");
    const codeSentStr = localStorage.getItem("uni_email_code_sent");
    const savedEmail = localStorage.getItem("uni_email_code_address");
    
    if (codeSentStr === "true" && sentAtStr) {
      const sentAt = parseInt(sentAtStr, 10);
      const elapsedSeconds = Math.floor((Date.now() - sentAt) / 1000);
      const remaining = 120 - elapsedSeconds;
      
      if (remaining > 0) {
        setCodeSent(true);
        setTimerSeconds(remaining);
        if (savedEmail) {
          setUniEmail(savedEmail);
        }
      } else {
        localStorage.removeItem("uni_email_code_sent_at");
        localStorage.removeItem("uni_email_code_sent");
        localStorage.removeItem("uni_email_code_address");
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (codeSent && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("uni_email_code_sent_at");
            localStorage.removeItem("uni_email_code_sent");
            localStorage.removeItem("uni_email_code_address");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [codeSent, timerSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetEmailVerificationState = () => {
    setCodeSent(false);
    setDevCode("");
    setTimerSeconds(0);
    localStorage.removeItem("uni_email_code_sent_at");
    localStorage.removeItem("uni_email_code_sent");
    localStorage.removeItem("uni_email_code_address");
  };

  useEffect(() => {
    if (user?.studentProfile?.university_email && !codeSent) {
      setUniEmail(user.studentProfile.university_email);
    }
  }, [user, codeSent]);

  const handleSendEmailCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!uniEmail || !uniEmail.toLowerCase().endsWith(".edu.tr")) {
      showToast("Lütfen geçerli bir üniversite e-posta adresi (.edu.tr) girin.", "error");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await studentService.sendUniversityEmailVerification(uniEmail);
      showToast(res.message, "success");
      setCodeSent(true);
      setTimerSeconds(120); // 2 minutes countdown
      
      // Save state to localStorage to persist across refreshes
      localStorage.setItem("uni_email_code_sent_at", Date.now().toString());
      localStorage.setItem("uni_email_code_sent", "true");
      localStorage.setItem("uni_email_code_address", uniEmail);

      if (res.code) {
        setDevCode(res.code);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "Kod gönderilemedi.", "error");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailCode = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!emailCode) {
      showToast("Lütfen 6 haneli doğrulama kodunu girin.", "error");
      return;
    }
    setEmailLoading(true);
    try {
      await studentService.verifyUniversityEmail(emailCode);
      showToast("Üniversite e-postanız başarıyla doğrulandı!", "success");
      resetEmailVerificationState();
      setShowEmailEdit(false);
      await checkAuth();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "E-posta doğrulama başarısız oldu.", "error");
    } finally {
      setEmailLoading(false);
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

        {/* ⓪ Öğrenci Kimlik Doğrulaması (Çift Aşamalı) */}
        {user?.role === 'student' && (
          <SectionCard
            icon={(user.studentProfile?.is_verified && user.studentProfile?.is_university_email_verified) ? FiCheckCircle : FiUploadCloud}
            title="Öğrenci Kimlik Doğrulaması (Çift Aşamalı)"
            description="Platformdaki iş ve staj ilanlarına başvurabilmek için hem e-Devlet Öğrenci Belgenizi hem de üniversite e-posta adresinizi doğrulamanız gerekmektedir."
          >
            <div className="max-w-2xl space-y-8">
              {/* Adım 1: e-Devlet Belgesi */}
              <div className="border-b border-[#dfded6]/60 pb-6">
                <h4 className="font-extrabold text-sm text-[#00342b] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="text-[#004d40] font-bold">1.</span>
                  e-Devlet Akademik Belge Doğrulaması
                </h4>
                {user.studentProfile?.is_verified && !showDevletEdit ? (
                  <div className="bg-gradient-to-br from-[#f2f8f6] to-[#e6edea] border border-[#b2cfc8]/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-[0_4px_20px_rgba(0,77,64,0.02)] transition-all hover:shadow-[0_4px_25px_rgba(0,77,64,0.05)]">
                    <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,77,64,0.1)]">
                      <svg className="w-5 h-5 text-[#004d40]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h5 className="font-bold text-sm text-[#00342b]">Akademik Belge Doğrulandı</h5>
                        <p className="text-xs text-[#565e74] mt-0.5">e-Devlet üzerinden YÖK öğrenci belgeniz başarıyla onaylandı.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#dfded6]/40 text-xs">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#8b91a0] font-semibold">Öğrenci Adı</span>
                          <p className="font-bold text-[#0b1c30] mt-0.5">{user.studentProfile.full_name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#8b91a0] font-semibold">Üniversite</span>
                          <p className="font-bold text-[#0b1c30] mt-0.5">{user.studentProfile.university}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[10px] uppercase tracking-wider text-[#8b91a0] font-semibold">Bölüm / Program</span>
                          <p className="font-bold text-[#0b1c30] mt-0.5">{user.studentProfile.major}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-[#dfded6]/40 flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowDevletEdit(true)}
                          className="text-xs font-bold text-[#004d40] hover:text-[#00342b] hover:underline"
                        >
                          Belgeyi Yeniden Yükle / Güncelle
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-[#ffffff] to-[#fafaf9] border border-[#dfded6]/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-xs leading-relaxed space-y-3">
                      <strong className="text-sm font-bold text-[#00342b]">İşlem Adımları:</strong>
                      <ul className="space-y-2 mt-2 text-[#565e74]">
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#004d40]/10 text-[#004d40] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <span>e-Devlet'ten barkodlu <strong>YÖK Öğrenci Belgesi</strong> oluşturun.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-[#004d40]/10 text-[#004d40] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <span>İndirdiğiniz <strong>PDF dosyasını</strong> buraya yükleyin.</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleVerifyDocument}
                      />
                      <div className="flex gap-2">
                        <FormButton 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          isLoading={verifyLoading}
                          disabled={verifyLoading}
                          className="!rounded-full px-6 text-xs"
                        >
                          {verifyLoading ? "e-Devlet üzerinden doğrulanıyor..." : "YÖK PDF Belgesi Yükle"}
                        </FormButton>
                        {showDevletEdit && (
                          <FormButton
                            type="button"
                            onClick={() => setShowDevletEdit(false)}
                            variant="outline"
                            className="!rounded-full px-6 text-xs"
                          >
                            İptal
                          </FormButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Adım 2: Üniversite E-postası */}
              <div>
                <h4 className="font-extrabold text-sm text-[#00342b] uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span className="text-[#004d40] font-bold">2.</span>
                  Üniversite E-posta Doğrulaması (.edu.tr)
                </h4>
                {user.studentProfile?.is_university_email_verified && !showEmailEdit ? (
                  <div className="bg-gradient-to-br from-[#f2f8f6] to-[#e6edea] border border-[#b2cfc8]/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-[0_4px_20px_rgba(0,77,64,0.02)] transition-all hover:shadow-[0_4px_25px_rgba(0,77,64,0.05)]">
                    <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,77,64,0.1)]">
                      <svg className="w-5 h-5 text-[#004d40]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <h5 className="font-bold text-sm text-[#00342b]">Üniversite E-postası Doğrulandı</h5>
                        <p className="text-xs text-[#565e74] mt-0.5">Resmi üniversite e-posta adresiniz (.edu.tr) aktif durumdadır.</p>
                      </div>
                      <div className="pt-2.5 border-t border-[#dfded6]/40 text-xs">
                        <span className="text-[10px] uppercase tracking-wider text-[#8b91a0] font-semibold">Kayıtlı E-posta Adresi</span>
                        <p className="font-bold text-[#0b1c30] mt-0.5">{user.studentProfile?.university_email}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <FormInput
                        label="Üniversite E-posta Adresi (.edu.tr)"
                        type="email"
                        value={uniEmail}
                        onChange={(e) => setUniEmail(e.target.value)}
                        placeholder="ogrenci@universite.edu.tr"
                        className="!rounded-full pl-5 text-xs"
                        disabled={codeSent}
                      />
                      {!codeSent ? (
                        <div className="flex gap-2">
                          <FormButton
                            type="button"
                            onClick={handleSendEmailCode}
                            isLoading={emailLoading}
                            disabled={emailLoading || !uniEmail.endsWith('.edu.tr')}
                            className="!rounded-full px-6 text-xs"
                          >
                            Doğrulama Kodu Gönder
                          </FormButton>
                          {showEmailEdit && (
                            <FormButton
                              type="button"
                              onClick={() => setShowEmailEdit(false)}
                              variant="outline"
                              className="!rounded-full px-6 text-xs"
                            >
                              İptal
                            </FormButton>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <FormButton
                            type="button"
                            onClick={() => resetEmailVerificationState()}
                            variant="outline"
                            className="!rounded-full px-6 text-xs"
                          >
                            E-postayı Değiştir
                          </FormButton>
                          {showEmailEdit && (
                            <FormButton
                              type="button"
                              onClick={() => { resetEmailVerificationState(); setShowEmailEdit(false); }}
                              variant="outline"
                              className="!rounded-full px-6 text-xs"
                            >
                              İptal
                            </FormButton>
                          )}
                        </div>
                      )}
                    </div>

                    {codeSent && (
                      <div className="bg-gradient-to-br from-[#ffffff] to-[#fafaf9] border border-[#dfded6]/60 p-5 rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.01)] animate-slideDown space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-4">
                            <h4 className="text-sm font-bold text-[#00342b]">Doğrulama Kodunu Girin</h4>
                            {timerSeconds > 0 ? (
                              <span className="text-xs font-mono font-bold text-[#565e74] shrink-0">
                                {formatTime(timerSeconds)}
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-[#565e74] shrink-0">
                                Süre Doldu
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#565e74] mt-1">Lütfen e-posta adresinize gönderilen 6 haneli kodu aşağıdaki alana girin.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 items-end">
                          <FormInput
                            label="Doğrulama Kodu"
                            value={emailCode}
                            onChange={(e) => setEmailCode(e.target.value)}
                            placeholder="123456"
                            maxLength={6}
                            className="!rounded-full pl-5 text-xs"
                            disabled={timerSeconds === 0 || emailLoading}
                          />
                          <div className="flex gap-2 w-full sm:w-auto">
                            {timerSeconds > 0 ? (
                              <FormButton
                                type="button"
                                onClick={handleVerifyEmailCode}
                                isLoading={emailLoading}
                                disabled={emailLoading}
                                className="!rounded-full px-8 text-xs bg-[#004d40] hover:bg-[#00342b]"
                              >
                                Kodu Doğrula
                              </FormButton>
                            ) : (
                              <FormButton
                                type="button"
                                onClick={handleSendEmailCode}
                                isLoading={emailLoading}
                                className="!rounded-full px-6 text-xs bg-[#e28743] hover:bg-[#c97537] text-white"
                              >
                                Yeni Kod Gönder
                              </FormButton>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
              {user.studentProfile?.sub_merchant_key && !showBankEdit ? (
                <div className="bg-gradient-to-br from-[#f2f8f6] to-[#e6edea] border border-[#b2cfc8]/40 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 shadow-[0_4px_20px_rgba(0,77,64,0.02)] transition-all hover:shadow-[0_4px_25px_rgba(0,77,64,0.05)]">
                  <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,77,64,0.1)]">
                    <svg className="w-5 h-5 text-[#004d40]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h5 className="font-bold text-sm text-[#00342b]">Iyzico Banka Hesabınız Tanımlandı!</h5>
                      <p className="text-xs text-[#565e74] mt-0.5">Ödemeleriniz Iyzico Marketplace sistemi üzerinden bu hesaba aktarılacaktır.</p>
                    </div>
                    <div className="pt-2.5 border-t border-[#dfded6]/40 text-xs space-y-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#8b91a0] font-semibold">Merchant Anahtarı</span>
                        <p className="font-bold text-[#0b1c30] mt-0.5">{user.studentProfile.sub_merchant_key}</p>
                      </div>
                      <p className="text-[11px] text-[#565e74] leading-relaxed pt-1">Bütçe ödemeleriniz bu hesap üzerinden yönetilir. Değişiklik yapmak için destek ekibi ile iletişime geçebilirsiniz.</p>
                    </div>
                    <div className="pt-2 border-t border-[#dfded6]/40 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setShowBankEdit(true)}
                        className="text-xs font-bold text-[#004d40] hover:text-[#00342b] hover:underline"
                      >
                        Banka Bilgilerini Güncelle
                      </button>
                    </div>
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

                  <div className="pt-2 flex gap-2">
                    <FormButton
                      type="submit"
                      isLoading={bankLoading}
                      disabled={bankLoading}
                      className="!rounded-full px-8"
                    >
                      Banka Bilgilerini Kaydet
                    </FormButton>
                    {showBankEdit && (
                      <FormButton
                        type="button"
                        onClick={() => setShowBankEdit(false)}
                        variant="outline"
                        className="!rounded-full px-6 text-xs"
                      >
                        İptal
                      </FormButton>
                    )}
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
