"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainSection from "@/components/layout/MainSection";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { submissionService } from "@/services/submission.service";
import { Submission } from "@/types/submission";
import { useToast } from "@/context/ToastContext";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import {
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiCalendar,
  FiLink,
  FiUploadCloud
} from "react-icons/fi";
import FormInput from "@/components/ui/form/FormInput";

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
  }, [submissionId]);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workLink) {
      showToast("Lütfen çalışma linkini giriniz.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Assuming submissionService has submitWork method now
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
  if (!submission) return <div className="p-12 text-center text-gray-500 font-bold">Başvuru bulunamadı.</div>;

  const isAccepted = submission.status === "accepted";
  const isSubmitted = submission.status === "submitted";
  const isCompleted = submission.status === "completed";

  return (
    <div className="min-h-screen w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 bg-[#faf9f6] text-[#00342b] relative flex flex-col font-sans">
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
          <p className="text-sm text-gray-500 mt-1">Görev detayları ve teslim alanı</p>
        </div>

        <div className="bg-white w-full rounded-3xl overflow-hidden flex flex-col md:flex-row border border-[#DFDED6] shadow-sm">
          
          {/* Sidebar */}
          <aside className="w-full md:w-[35%] bg-white p-6 md:p-8 flex flex-col gap-6 md:gap-8 border-r border-[#DFDED6]">
            <div>
              <h2 className="text-lg font-bold text-[#00342b] mb-1">{submission.task?.title}</h2>
              <p className="text-xs text-gray-500 font-medium">Şirket: {submission.task?.company?.company_name}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><FiDollarSign /> Bütçe</span>
                <span className="font-bold text-[#00342b]">₺{submission.proposed_budget || submission.task?.budget}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-500 flex items-center gap-2"><FiCalendar /> Teslim Süresi</span>
                <span className="font-bold text-[#00342b]">{submission.estimated_delivery_days} Gün</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 flex items-center gap-2"><FiClock /> Durum</span>
                <span className="font-bold text-[#e28743] uppercase text-xs">
                  {submission.status === 'accepted' ? 'Devam Ediyor' : submission.status === 'submitted' ? 'İnceleniyor' : submission.status === 'completed' ? 'Tamamlandı' : submission.status}
                </span>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="w-full md:w-[65%] p-6 md:p-8 bg-[#faf9f6]/30">
            <h3 className="text-xl font-bold mb-6 text-[#00342b]">Görev Teslimi</h3>

            {isAccepted && (
              <form onSubmit={handleSubmitWork} className="bg-white p-6 rounded-2xl border border-[#DFDED6] flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3 text-[#00342b] mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#004d40]/10 flex items-center justify-center text-[#004d40]">
                    <FiUploadCloud size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold">Çalışmayı Teslim Et</h4>
                    <p className="text-xs text-gray-500">Görev için tamamladığınız projenin linkini buraya giriniz.</p>
                  </div>
                </div>

                <FormInput
                  label="Proje / Çalışma Linki (GitHub, Drive vb.)"
                  placeholder="https://..."
                  value={workLink}
                  onChange={(e) => setWorkLink(e.target.value)}
                  icon={FiLink}
                  required
                />

                <button
                  type="submit"
                  disabled={isSubmitting || !workLink}
                  className="mt-4 w-full py-3 px-6 bg-[#00342b] relative overflow-hidden text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#004d40] transition-all active:scale-[0.98] disabled:opacity-50 group"
                >
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    {isSubmitting ? "Gönderiliyor..." : "Çalışmayı Gönder ve Onaya Sun"}
                  </div>
                </button>
              </form>
            )}

            {isSubmitted && (
              <div className="bg-[#e28743]/10 border border-[#e28743]/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 bg-[#e28743] text-white rounded-full flex items-center justify-center text-3xl shadow-lg">
                  <FiClock />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-[#e28743]">Çalışma İnceleniyor</h4>
                  <p className="text-sm text-[#e28743]/80 mt-2 max-w-sm">
                    Çalışmanızı başarıyla teslim ettiniz. Şirket inceledikten sonra bütçeniz hesabınıza aktarılacaktır.
                  </p>
                </div>
                <div className="mt-4 px-4 py-2 bg-white rounded-lg border border-[#e28743]/20 text-xs font-bold text-gray-600 truncate max-w-full">
                  Teslim Edilen Link: <a href={submission.submission_content || undefined} target="_blank" className="text-blue-500 hover:underline">{submission.submission_content}</a>
                </div>
              </div>
            )}

            {isCompleted && (
              <div className="bg-[#004d40]/10 border border-[#004d40]/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
                <div className="w-16 h-16 bg-[#004d40] text-white rounded-full flex items-center justify-center text-3xl shadow-lg z-10">
                  <FiCheckCircle />
                </div>
                <div className="z-10">
                  <h4 className="text-lg font-bold text-[#004d40]">Görev Tamamlandı!</h4>
                  <p className="text-sm text-[#004d40]/80 mt-2 max-w-sm">
                    Tebrikler! Şirket çalışmanızı onayladı ve {submission.task?.budget || submission.proposed_budget}₺ tutarındaki ödemeniz serbest bırakıldı.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainSection>
    </div>
  );
}
