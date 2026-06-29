"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormRow from "@/components/ui/form/FormRow";
import FormField from "@/components/ui/form/FormField";
import FormInput from "@/components/ui/form/FormInput";
import FormButton from "@/components/ui/form/FormButton";
import FormTextarea from "@/components/ui/form/FormTextarea";
import SectionCard from "@/components/ui/cards/SectionCard";

import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import { studentService } from "@/services/student.service";
import { Task } from "@/types/task";
import { StudentProfile } from "@/types/student";
import { useToast } from "@/context/ToastContext";
import { FiBriefcase, FiMapPin, FiFileText, FiCheckCircle, FiX, FiSend, FiAlertCircle } from "react-icons/fi";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import SkillBadge from "@/components/ui/SkillBadge";
import MainSection from "@/components/layout/MainSection";
import StepsTracker from "@/components/ui/StepsTracker";

const applySchema = z.object({
  coverLetter: z.string().min(50, "Lütfen en az 50 karakterlik bir başvuru yazısı girin."),
  proposed_budget: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().positive().optional()),
  estimated_delivery_days: z.preprocess((val) => (val === "" || val === undefined ? undefined : Number(val)), z.number().int().positive().optional()),
  agreesToRequirements: z.boolean().refine(val => val === true, {
    message: "Gereksinimleri sağladığınızı onaylamanız gerekmektedir."
  })
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const getDeliveryDays = () => {
    if (task?.deadline) {
      const diffTime = new Date(task.deadline).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 30;
    }
    if (task?.internship_duration) {
      const match = task.internship_duration.match(/\d+/);
      if (match) return Number(match[0]);
    }
    return 30;
  };

  const {
    register,
    control,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema) as any,
    defaultValues: {
      coverLetter: "",
      agreesToRequirements: false,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (taskId) {
          const [taskData, profileData, submissionsData] = await Promise.all([
            taskService.getTaskById(taskId),
            studentService.getProfile(),
            submissionService.getMySubmissions()
          ]);

          const alreadySubmitted = submissionsData.some(s => s.task_id === taskId);
          if (alreadySubmitted) {
            showToast("Bu göreve zaten başvuru yaptınız.", "info");
            router.push("/student/applications");
            return;
          }

          setTask(taskData);
          setProfile(profileData);
        }
      } catch (error) {
        showToast("Veriler alınırken bir hata oluştu.", "error");
        router.push("/student");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [taskId, router, showToast]);

  const onSubmit = async (data: ApplyValues) => {
    if (!task) return;
    try {
      const formattedContent = `[BAŞVURU MEKTUBU]:\n${data.coverLetter}`;

      await submissionService.createSubmission(taskId, {
        submission_content: formattedContent,
        proposed_budget: (task.budget || task.reward_amount || "0").toString(),
        estimated_delivery_days: getDeliveryDays(),
      });
      showToast("Başvurunuz başarıyla gönderildi!", "success");
      router.push("/student/applications");
    } catch (error: any) {
      if (error.message?.includes("Hesabınız doğrulanmamış")) {
        showToast(
          <span className="inline">
            Hesabınız doğrulanmamış. Lütfen başvurmadan önce{" "}
            <span
              onClick={(e) => {
                e.stopPropagation();
                router.push("/student/settings");
              }}
              className="underline font-bold hover:text-red-900 transition-colors cursor-pointer inline"
            >
              e-Devlet Öğrenci Belgeniz ile profilinizi doğrulayın
            </span>
            .
          </span>,
          "error"
        );
      } else {
        showToast(error.message || "Başvuru sırasında bir hata oluştu.", "error");
      }
    }
  };

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!task || !profile) {
    return (
      <div className="min-h-screen flex justify-center items-center text-gray-500">
        Görev veya Profil bulunamadı.
      </div>
    );
  }

  const isProfileComplete = profile.major && profile.graduation_year && profile.skills.length > 0 && Boolean(profile.github_url || profile.website_url);

  if (!isProfileComplete) {
    return (
      <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 mt-4">
        <div className="w-full h-full min-h-[250px] bg-[#F1F0EA] rounded-2xl border border-[#dfded6] shadow-2xs p-12 text-center flex flex-col items-center justify-center">
          <h3 className="font-bold text-gray-900 mb-2">Profiliniz Eksik!</h3>
          <p className="text-sm text-[#565e74] font-medium max-w-lg mx-auto">
            Profilinizin güçlü olması ve kabul oranınızın artması bizim için önemli. Görevlere başvurabilmek için lütfen profilinizdeki eksik bilgileri tamamlayın.
          </p>
          <div className="pt-6 flex justify-center">
            <FormButton variant="primary" onClick={() => router.push('/student/settings')} className="px-8 !rounded-full bg-[#004d40] hover:bg-[#00342b]">Profilimi Tamamla</FormButton>
          </div>
        </div>
      </div>
    );
  }

  const isMoneyTask = task.reward_type?.toLowerCase() === 'money';
  const isProjectTask = !task.reward_type || ['money', 'certificate', 'recommendation'].includes(task.reward_type.toLowerCase());

  const isVerified = profile.is_verified;
  const isUniEmailVerified = profile.is_university_email_verified;
  const hasIban = !!profile.sub_merchant_key;

  if (!isVerified || !isUniEmailVerified || (isMoneyTask && !hasIban)) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16 mt-10 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-16 select-none">
        {/* Left Column: Graphic/Illustration */}
        <div className="w-full max-w-[280px] md:max-w-[380px] shrink-0 flex items-center justify-center">
          <img 
            src="/student_verify_illustration.png" 
            alt="Student Verification Required" 
            className="w-full h-auto object-contain max-h-[300px] md:max-h-[360px] transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>

        {/* Right Column: Title, Description, Checklist, Buttons */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-6 max-w-lg">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-[#00342b] tracking-tight leading-tight">
              Eksik Doğrulama veya IBAN Bilgisi!
            </h2>
            <p className="text-sm text-[#565e74] font-medium leading-relaxed">
              Görevlere başvurabilmek için profilinizin e-Devlet Öğrenci Belgesi ve üniversite e-postası ile doğrulanmış olması {isMoneyTask ? "ve banka hesap bilgilerinizin (IBAN) girilmiş olması " : ""}gerekmektedir.
            </p>
          </div>

          {/* Checklist */}
          <div className="flex flex-col gap-3.5 w-full font-medium py-1">
            {!isVerified ? (
              <div className="flex items-center gap-3 text-red-500 justify-center md:justify-start">
                <FiX className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span className="text-xs font-bold tracking-wide">Öğrenci Belgesi Yüklenmemiş veya Doğrulanmamış</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-emerald-650 justify-center md:justify-start">
                <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="text-xs font-bold tracking-wide text-emerald-700">Öğrenci Belgesi Doğrulanmış</span>
              </div>
            )}
            {!isUniEmailVerified ? (
              <div className="flex items-center gap-3 text-red-500 justify-center md:justify-start">
                <FiX className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span className="text-xs font-bold tracking-wide">Üniversite E-postası (.edu.tr) Doğrulanmamış</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-emerald-650 justify-center md:justify-start">
                <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="text-xs font-bold tracking-wide text-emerald-700">Üniversite E-postası Doğrulanmış</span>
              </div>
            )}
            {isMoneyTask && !hasIban ? (
              <div className="flex items-center gap-3 text-red-500 justify-center md:justify-start">
                <FiX className="w-5 h-5 shrink-0 stroke-[2.5]" />
                <span className="text-xs font-bold tracking-wide">Banka Bilgileri (IBAN) Girilmemiş</span>
              </div>
            ) : isMoneyTask && hasIban ? (
              <div className="flex items-center gap-3 text-emerald-650 justify-center md:justify-start">
                <FiCheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
                <span className="text-xs font-bold tracking-wide text-emerald-700">Banka Bilgileri Girilmiş</span>
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row justify-center md:justify-start gap-4 w-full">
            <FormButton 
              variant="outline" 
              onClick={() => router.back()} 
              className="w-full sm:w-auto !rounded-full px-6 py-2.5"
            >
              Geri Dön
            </FormButton>
            <FormButton 
              variant="primary" 
              onClick={() => router.push('/student/settings')} 
              className="w-full sm:w-auto !rounded-full px-8 py-2.5 bg-[#004d40] hover:bg-[#00342b]"
            >
              Ayarlara Git
            </FormButton>
          </div>
        </div>
      </div>
    );
  }

  const hasFixedBudget = Boolean(task.reward_amount && task.reward_amount.toString().trim() !== '' && task.reward_amount.toString() !== '0');

  const steps = [
    { id: 1, title: "Başvuru Mektubu" },
    ...(isProjectTask ? [{ id: 2, title: "Teklif Detayları" }] : []),
    { id: isProjectTask ? 3 : 2, title: "Gereksinim Onayı" },
  ];

  const totalSteps = steps.length;

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(["coverLetter"]);
    } else if (currentStep === 2 && isProjectTask) {
      isValid = true;
    }
    
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 bg-[#faf9f6] text-[#00342b] relative flex flex-col font-sans">
      {/* Dynamic Synaptic Line Background Decorations */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100,200 Q400,100 800,400 T1600,200" fill="none" stroke="#004d40" strokeDasharray="10 5" strokeWidth="0.5" />
        <path d="M-100,800 Q600,900 1200,600 T1800,800" fill="none" stroke="#e28743" strokeDasharray="8 4" strokeWidth="0.5" />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .avatar-gradient { background: linear-gradient(135deg, #004d40 0%, #00342b 100%); }
        .premium-shadow { box-shadow: 0 20px 50px rgba(0, 52, 43, 0.06); }
      `}} />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        {/* Header Bar */}
        <div className="mb-8 mt-2">
          <h1 className="text-2xl font-extrabold text-[#00342b]">Göreve Başvur</h1>
        </div>

        {/* Main Columns Content - Mockup style */}
        <div className="bg-white w-full rounded-3xl premium-shadow overflow-hidden flex flex-col md:flex-row border border-[#DFDED6]">
          
          {/* Sidebar / Left Column (35% width) - Always shows task details */}
          <aside className="w-full md:w-[35%] bg-white p-6 md:p-8 flex flex-col gap-6 md:gap-8 border-r border-[#DFDED6] shrink-0">
            {/* Task Info Summary */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {task.company?.logo_url ? (
                  <img
                    src={task.company.logo_url}
                    alt="Logo"
                    className="w-16 h-16 rounded-2xl border border-[#dfded6] object-cover bg-white p-1.5 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 avatar-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                    {task.company?.company_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#00342b] truncate max-w-[200px]" title={task.title}>
                    {task.title}
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    {task.company?.company_name}
                  </p>
                </div>
              </div>
            </div>

            {/* StepsTracker in Sidebar */}
            <div className="py-5 border-t border-b border-[#DFDED6]">
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-5">Başvuru Aşamaları</h4>
              <StepsTracker steps={steps} currentStepId={currentStep} layout="vertical" />
            </div>

            {/* Task and Terms details */}
            <div>
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-3">Görev ve Şartlar</h4>
              <div className="space-y-3 text-xs pl-1">
                {isMoneyTask && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Bütçe:</span>
                    <span className="font-bold text-[#00342b]">₺{task.budget || task.reward_amount || "0"}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Teslim Süresi:</span>
                  <span className="font-bold text-[#00342b]">{getDeliveryDays()} Gün</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area (65% width) */}
          <div className="w-full md:w-[65%] flex flex-col bg-[#F1F0EA] p-6 md:p-10 justify-between flex-grow">
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 flex-grow flex flex-col justify-between">
              <div className="space-y-8">
                {currentStep === 1 && (
                  <div className="animate-slideUp">
                    <SectionCard 
                      icon={FiFileText} 
                      title="Başvuru Mektubu (Zorunlu)" 
                      description="Bu göreve neden uygun olduğunuzu, varsa tecrübelerinizi ve görevi nasıl yapmayı planladığınızı detaylıca açıklayın."
                    >
                      <FormTextarea
                        {...register("coverLetter")}
                        error={errors.coverLetter?.message}
                        placeholder="Örn: Bu görev için gerekli yeteneklere sahibim çünkü geçmişte şu projeleri geliştirdim..."
                        rows={6}
                        className="!rounded-3xl px-6 py-5 bg-white border-[#dfded6] focus:border-[#004d40]"
                      />
                    </SectionCard>
                  </div>
                )}

                {currentStep === (isProjectTask ? 2 : -1) && isProjectTask && (
                  <div className="animate-slideUp">
                    <SectionCard 
                      icon={FiBriefcase} 
                      title="Görevin Şartları" 
                      description="Şirket tarafından belirlenen bütçe ve teslim süresi bilgileri aşağıdadır. Başvurarak bu şartları kabul etmiş olursunuz."
                    >
                      <FormRow>
                        {isMoneyTask && (
                          <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-xs font-bold text-[#3f465c] px-1">Görev Bütçesi</label>
                            <div className="h-11 px-5 rounded-full border border-[#dfded6] bg-[#faf9f6] flex items-center text-[#565e74] text-sm font-semibold opacity-80 select-none">
                              ₺{task.budget || task.reward_amount || "0"} <span className="ml-2 text-[10px] font-bold text-[#004d40] bg-[#004d40]/10 px-2 py-0.5 rounded-full">(Şirket tarafından belirlendi)</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5 w-full">
                          <label className="text-xs font-bold text-[#3f465c] px-1">Teslim Süresi</label>
                          <div className="h-11 px-5 rounded-full border border-[#dfded6] bg-[#faf9f6] flex items-center text-[#565e74] text-sm font-semibold opacity-80 select-none">
                            {getDeliveryDays()} Gün <span className="ml-2 text-[10px] font-bold text-[#004d40] bg-[#004d40]/10 px-2 py-0.5 rounded-full">(Şirket tarafından belirlendi)</span>
                          </div>
                        </div>
                      </FormRow>
                    </SectionCard>
                  </div>
                )}

                {currentStep === totalSteps && (
                  <div className="animate-slideUp">
                    <SectionCard 
                      icon={FiCheckCircle} 
                      title="Gereksinim Onayı"
                    >
                      <div className="bg-[#fffdf9] border border-[#dfded6] p-5 rounded-2xl mb-4 select-none">
                        <p className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-3">BU GÖREV İÇİN ARANAN TEMEL YETENEKLER:</p>
                        <div className="flex flex-wrap gap-2">
                          {task.requiredSkills && task.requiredSkills.length > 0 ? (
                            task.requiredSkills.map((s: any, idx) => (
                              <SkillBadge key={idx} label={s.skill.name} />
                            ))
                          ) : <span className="text-xs text-gray-400 font-medium italic">Belirtilmemiş</span>}
                        </div>
                      </div>

                      <div className="bg-[#fffdf9] border border-[#dfded6] p-5 rounded-2xl mb-4 select-none space-y-4">
                        <div className="flex items-start gap-2.5 text-[#ba1a1a]">
                          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-[#00342b]">Önemli Taahhüt ve Kurallar</p>
                            <p className="text-[11px] text-[#565e74] mt-1 font-medium leading-relaxed">
                              Bu görevi kabul etmeniz durumunda aşağıdaki platform kurallarına uymakla yükümlüsünüz:
                            </p>
                          </div>
                        </div>
                        
                        <ul className="text-xs text-[#565e74] space-y-2 list-disc list-inside pl-1 font-medium leading-relaxed">
                          <li>
                            <strong className="text-[#0b1c30]">Görevin Teslimi:</strong> Görevi kabul ettikten sonra, şirketle anlaşılan teslim süresi ve gereksinimlere uygun olarak işi eksiksiz teslim etmeniz zorunludur.
                          </li>
                          <li>
                            <strong className="text-[#0b1c30]">Kural İhlali ve Cezai İşlem:</strong> Görevin geçerli bir sebep olmaksızın yarım bırakılması, teslim edilmemesi veya platform kurallarının ihlal edilmesi durumunda hesabınız dondurulabilir veya kalıcı olarak <span className="text-red-500 font-bold">engellenebilirsiniz</span>.
                          </li>
                          <li>
                            <strong className="text-[#0b1c30]">Ödeme Güvencesi (Escrow):</strong> Görev bütçesi şirket tarafından güvenli Escrow havuzunda kilitlenir; teslim onaylanınca otomatik olarak IBAN adresinize aktarılır.
                          </li>
                        </ul>
                      </div>
      
                      <label className="flex items-start gap-3 cursor-pointer group mt-6 select-none">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            {...register("agreesToRequirements")}
                            className="w-5 h-5 border-[#dfded6] rounded-lg text-[#004d40] focus:ring-[#004d40]/15 bg-white cursor-pointer transition-all"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0b1c30]">Gereksinimleri Onaylıyorum</span>
                          <p className="text-xs text-[#565e74] mt-1 font-medium leading-relaxed">Bu görevi üstlenmek için yukarıdaki yeteneklere sahip olduğumu ve görev şartlarını kabul ettiğimi beyan ederim.</p>
                        </div>
                      </label>
                      {errors.agreesToRequirements?.message && (
                        <p className="mt-2 text-xs text-red-500 font-medium">{errors.agreesToRequirements.message}</p>
                      )}
                    </SectionCard>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-[#dfded6] mt-8">
                {currentStep > 1 ? (
                  <FormButton
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    className="w-full sm:w-auto !bg-transparent text-[#004d40] !border-[1px] border-[#004d40] hover:bg-[#004d40]/5 !rounded-full px-6"
                  >
                    Önceki Adım
                  </FormButton>
                ) : (
                  <FormButton
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto !bg-transparent text-[#565e74] !border-[1px] border-[#dfded6] hover:bg-gray-50 !rounded-full px-6"
                  >
                    <FiX className="mr-2" />
                    İptal
                  </FormButton>
                )}
                
                {currentStep < totalSteps ? (
                  <FormButton
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    className="w-full sm:w-auto !rounded-full px-8 bg-[#004d40] hover:bg-[#00342b]"
                  >
                    Sonraki Adım
                  </FormButton>
                ) : (
                  <FormButton
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto !rounded-full px-8 bg-[#004d40] hover:bg-[#00342b]"
                  >
                    <FiSend className="mr-2" />
                    Başvuruyu Gönder
                  </FormButton>
                )}
              </div>
            </form>
          </div>
        </div>
      </MainSection>
    </div>
  );
} 