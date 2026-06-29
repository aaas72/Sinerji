"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/layout/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { submissionService } from "@/services/submission.service";
import { Submission } from "@/types/submission";
import { useToast } from "@/context/ToastContext";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import FormButton from "@/components/ui/form/FormButton";
import FormInput from "@/components/ui/form/FormInput";
import SectionCard from "@/components/ui/cards/SectionCard";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiLink,
  FiUploadCloud,
  FiAward,
  FiBriefcase
} from "react-icons/fi";

export default function StudentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const submissionId = Number(params.id);

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  
  // Submit work state
  const [workLink, setWorkLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;
      try {
        const submissionData = await submissionService.getSubmission(submissionId);
        setSubmission(submissionData);
      } catch (err: any) {
        showToast("Veri yüklenirken bir hata oluştu.", "error");
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [submissionId, showToast]);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLink) {
      showToast("Lütfen çalışma linkini giriniz.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const updated = await submissionService.submitWork(submissionId, workLink);
      setSubmission(updated);
      showToast("Çalışmanız başarıyla teslim edildi!", "success");
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || "İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingData) return <PageLoadingSkeleton />;
  if (!submission) return <div className="p-12 text-center text-gray-500 font-bold flex justify-center items-center min-h-screen">Başvuru bulunamadı.</div>;

  const isOffered = submission.status === "offered";
  const isAccepted = submission.status === "accepted";
  const isSubmitted = submission.status === "submitted";
  const isCompleted = submission.status === "approved" || submission.status === "reviewed";

  const isMoneyTask = submission.task?.reward_type?.toLowerCase() === 'money';

  const handleRespondOffer = async (res: 'accept' | 'reject') => {
    setIsSubmitting(true);
    try {
      const updated = await submissionService.respondToOffer(submissionId, res);
      setSubmission(updated);
      showToast(res === 'accept' ? "Teklifi başarıyla kabul ettiniz!" : "Teklifi reddettiniz.", "success");
      if (res === 'reject') {
        router.push('/student/applications');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
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

      <Breadcrumb
        items={[
          { label: "Panel", href: "/student/dashboard" },
          { label: "Başvurularım", href: "/student/applications" },
          { label: "Çalışma Alanı", active: true },
        ]}
      />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        <div className="mb-8 mt-2">
          <h1 className="text-2xl font-extrabold text-[#00342b]">Çalışma Alanı</h1>
          <p className="text-sm text-[#565e74] mt-1 font-medium">Görev detayları ve teslim alanı</p>
        </div>

        <div className="bg-white w-full rounded-3xl premium-shadow overflow-hidden flex flex-col md:flex-row border border-[#DFDED6]">
          
          {/* Sidebar / Left Column (35% width) */}
          <aside className="w-full md:w-[35%] bg-white p-6 md:p-8 flex flex-col gap-6 md:gap-8 border-r border-[#DFDED6] shrink-0">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {submission.task?.company?.logo_url ? (
                  <img
                    src={submission.task.company.logo_url}
                    alt="Logo"
                    className="w-16 h-16 rounded-2xl border border-[#dfded6] object-cover bg-white p-1.5 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 avatar-gradient rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
                    {submission.task?.company?.company_name?.charAt(0).toUpperCase() || 'C'}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-bold text-[#00342b] leading-snug" title={submission.task?.title}>
                    {submission.task?.title}
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 mt-1">
                    {submission.task?.company?.company_name}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-4 border-t border-[#DFDED6]">
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-4">Görev Detayları</h4>
              <div className="space-y-4 text-xs pl-1">
                {isMoneyTask ? (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><FiDollarSign className="text-[#004d40] text-sm"/> Bütçe</span>
                    <span className="font-bold text-[#00342b]">₺{submission.proposed_budget || submission.task?.budget}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium flex items-center gap-2"><FiAward className="text-[#004d40] text-sm"/> Tür</span>
                    <span className="font-bold text-[#00342b]">Staj / Deneyim</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><FiCalendar className="text-[#004d40] text-sm"/> Teslim Süresi</span>
                  <span className="font-bold text-[#00342b]">{submission.estimated_delivery_days} Gün</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                  <span className="text-gray-500 font-medium flex items-center gap-2"><FiClock className="text-[#004d40] text-sm"/> Durum</span>
                  <span className="font-bold text-[#00342b] uppercase text-[11px] tracking-wider">
                    {isOffered ? 'Teklif Alındı' : isAccepted ? 'Devam Ediyor' : isSubmitted ? 'İnceleniyor' : isCompleted ? 'Tamamlandı' : submission.status}
                  </span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area (65% width) */}
          <div className="w-full md:w-[65%] flex flex-col bg-[#F1F0EA] p-6 md:p-10 flex-grow relative">
            {isOffered && (
              <div className="animate-slideUp flex flex-col justify-center items-center text-center py-6 h-full">
                <div className="mt-2 space-y-3">
                  <h4 className="text-2xl font-bold text-[#00342b] tracking-tight">Tebrikler, Teklif Alındı!</h4>
                  <p className="text-sm text-[#565e74] max-w-md mx-auto font-medium leading-relaxed">
                    {isMoneyTask 
                      ? `Şirket başvurunuzu onayladı ve ${submission.task?.budget || submission.proposed_budget}₺ tutarındaki bütçeyi güvenli havuza (Escrow) kilitledi. Göreve hemen başlamak için teklifi kabul edin.` 
                      : `Şirket başvurunuzu onayladı ve sizinle çalışmak istiyor. Bu bir staj/deneyim görevi olduğundan finansal bir bütçe içermez. Göreve başlamak için teklifi kabul edin.`
                    }
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6 w-full justify-center">
                  <FormButton
                    variant="outline"
                    onClick={() => handleRespondOffer('reject')}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto !rounded-full px-8 !text-[#ba1a1a] !border-[#ba1a1a] hover:!bg-[#ba1a1a]/5"
                  >
                    Teklifi Reddet
                  </FormButton>
                  <FormButton
                    variant="primary"
                    onClick={() => handleRespondOffer('accept')}
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    className="w-full sm:w-auto !rounded-full px-10 bg-[#004d40] hover:bg-[#00342b] shadow-lg"
                  >
                    Kabul Et ve Başla
                  </FormButton>
                </div>
              </div>
            )}

            {isAccepted && (
              <div className="animate-slideUp flex flex-col justify-center items-center text-center py-6 h-full w-full">
                <div className="mt-2 space-y-3 w-full max-w-lg">
                  <h4 className="text-2xl font-bold text-[#00342b] tracking-tight flex items-center justify-center gap-2">
                    <FiUploadCloud /> Çalışmayı Teslim Et
                  </h4>
                  <p className="text-sm text-[#565e74] font-medium leading-relaxed">
                    Görev için tamamladığınız projenin veya dökümanın bağlantı linkini buraya giriniz. (GitHub, Google Drive, Figma vb.)
                  </p>
                  <form onSubmit={handleSubmitWork} className="flex flex-col gap-6 pt-6 w-full">
                    <FormInput
                      name="workLink"
                      placeholder="https://github.com/..."
                      value={workLink}
                      onChange={(e) => setWorkLink(e.target.value)}
                      icon={FiLink}
                      required
                      className="!rounded-full"
                    />
                    <div className="flex justify-center pt-2">
                      <FormButton
                        type="submit"
                        variant="primary"
                        disabled={isSubmitting || !workLink}
                        isLoading={isSubmitting}
                        className="w-full md:w-auto !rounded-full px-8 bg-[#004d40] hover:bg-[#00342b] shadow-md"
                      >
                        Çalışmayı Gönder ve Onaya Sun
                      </FormButton>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isSubmitted && (
              <div className="animate-slideUp flex flex-col justify-center h-full">
                <div className="bg-transparent p-8 md:p-12 flex flex-col items-center justify-center text-center gap-5">
                  <div className="mt-2 space-y-3">
                    <h4 className="text-2xl font-bold text-[#00342b] tracking-tight">Çalışma İnceleniyor</h4>
                    <p className="text-sm text-[#565e74] max-w-md font-medium leading-relaxed">
                      Çalışmanızı başarıyla teslim ettiniz. Şirket inceledikten sonra {isMoneyTask ? "bütçeniz Escrow havuzundan hesabınıza aktarılacaktır." : "göreviniz tamamlandı olarak işaretlenecektir."}
                    </p>
                  </div>
                  
                  <div className="mt-6 w-full max-w-md flex flex-col items-center text-center gap-2 z-10">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Teslim Edilen Çalışma</span>
                    <p className="text-[14px] text-[#004d40] font-medium break-words italic">
                      "{submission.submission_content}"
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="animate-slideUp flex flex-col justify-center items-center text-center py-6 h-full w-full">
                <div className="mt-2 space-y-3 w-full max-w-lg">
                  <h4 className="text-2xl font-bold text-[#004d40] tracking-tight">Görev Tamamlandı!</h4>
                  <p className="text-sm text-[#565e74] font-medium leading-relaxed">
                    Tebrikler! Şirket çalışmanızı onayladı. 
                    {isMoneyTask 
                      ? ` ${submission.task?.budget || submission.proposed_budget}₺ tutarındaki ödemeniz Iyzico güvencesiyle hesabınıza aktarıldı.` 
                      : ` Bu staj/deneyim görevini başarıyla bitirdiniz, başarılarınızın devamını dileriz!`
                    }
                  </p>
                </div>
                  
                <div className="mt-6 w-full max-w-md flex flex-col items-center text-center gap-2">
                  <span className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider">Teslim Edilen Bağlantı</span>
                  <a href={submission.submission_content || undefined} target="_blank" rel="noreferrer" className="text-sm text-gray-500 font-medium truncate hover:underline">
                    {submission.submission_content}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainSection>
    </div>
  );
}

