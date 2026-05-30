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
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import SectionCard from "@/components/ui/cards/SectionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import { studentService } from "@/services/student.service";
import { Task } from "@/types/task";
import { StudentProfile } from "@/types/student";
import { useToast } from "@/context/ToastContext";
import { FiBriefcase, FiMapPin, FiFileText, FiCheckCircle, FiX, FiSend } from "react-icons/fi";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import SkillBadge from "@/components/ui/SkillBadge";
import MainSection from "@/components/layout/MainSection";

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

  const {
    register,
    control,
    handleSubmit,
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
          const [taskData, profileData] = await Promise.all([
            taskService.getTaskById(taskId),
            studentService.getProfile()
          ]);
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
    try {
      const formattedContent = `[BAŞVURU MEKTUBU]:\n${data.coverLetter}`;

      await submissionService.createSubmission(taskId, {
        submission_content: formattedContent,
        proposed_budget: data.proposed_budget ? data.proposed_budget.toString() : undefined,
        estimated_delivery_days: data.estimated_delivery_days,
      });
      showToast("Başvurunuz başarıyla gönderildi!", "success");
      router.push("/student/applications");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Başvuru sırasında bir hata oluştu.", "error");
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
      <div className="max-w-4xl mx-auto px-6 py-12 mt-10">
        <div className="bg-[#fffdf9] border border-[#dfded6] rounded-2xl p-8 md:p-12 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-[#e28743]/10 text-[#e28743] rounded-full flex items-center justify-center mx-auto mb-2">
            <FiMapPin className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#00342b] tracking-tight">Profiliniz Eksik!</h2>
          <p className="text-[#565e74] max-w-lg mx-auto text-sm font-medium leading-relaxed">
            Yapay zeka (AI) eşleştirme algoritmasının düzgün çalışabilmesi ve şirketlerin size güvenebilmesi için profilinizdeki zorunlu alanları (Bölüm, Mezuniyet Yılı, Yetenekler ve Portfolyo/GitHub bağlantısı) doldurmanız gerekmektedir.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <FormButton variant="outline" onClick={() => router.back()} className="!rounded-full px-6">Geri Dön</FormButton>
            <FormButton variant="primary" onClick={() => router.push('/student/settings')} className="!rounded-full px-8 bg-[#004d40] hover:bg-[#00342b]">Profilimi Tamamla</FormButton>
          </div>
        </div>
      </div>
    );
  }

  const isMoneyTask = task.reward_type?.toLowerCase() === 'money';
  const isProjectTask = !task.reward_type || ['money', 'certificate', 'recommendation'].includes(task.reward_type.toLowerCase());

  return (
    <div className="w-full app-container px-6 md:px-16 py-16 flex flex-col gap-8">
      <Breadcrumb
        items={[
          { label: "Görevler", href: "/student/tasks" },
          { label: task.title, href: `/student/tasks/${task.id}` },
          { label: "Başvuru Yap", active: true },
        ]}
      />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-3">
            <h1 className="text-[22px] md:text-[28px] font-bold leading-tight text-[#00342b] font-sans break-words tracking-tight">
              Başvuru: {task.title}
            </h1>
            <p className="text-sm text-[#565e74] font-medium">
              <strong className="text-[#004d40]">{task.company?.company_name}</strong> şirketindeki bu görev için neden uygun olduğunuzu detaylıca anlatın.
            </p>
          </div>
          {task.company?.logo_url && (
            <img src={task.company.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl border border-[#dfded6] object-cover bg-white p-1.5" />
          )}
        </div>

        <div className="max-w-4xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
            
            <SectionCard 
              icon={FiFileText} 
              title="1. Başvuru Mektubu (Zorunlu)" 
              description="Bu göreve neden uygun olduğunuzu, varsa tecrübelerinizi ve görevi nasıl yapmayı planladığınızı detaylıca açıklayın."
            >
              <FormField error={errors.coverLetter?.message}>
                <Controller
                  control={control}
                  name="coverLetter"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Örn: Bu görev için gerekli yeteneklere sahibim çünkü geçmişte şu projeleri geliştirdim..."
                    />
                  )}
                />
              </FormField>
            </SectionCard>

            {isProjectTask && (
              <SectionCard 
                icon={FiBriefcase} 
                title={`2. Teklifiniz ${isMoneyTask ? "(Opsiyonel)" : ""}`} 
                description={`Şirketin değerlendirebilmesi için ${isMoneyTask ? "talep ettiğiniz bütçeyi ve " : ""}teslim süresini belirtin.`}
              >
                <FormRow>
                  {isMoneyTask && (
                    <FormInput
                      label="Talep Edilen Bütçe ($ - İsteğe Bağlı)"
                      type="number"
                      {...register("proposed_budget")}
                      placeholder="Örn: 150"
                      error={errors.proposed_budget?.message}
                      className="!rounded-full px-5"
                    />
                  )}
                  
                  <FormInput
                    label="Tahmini Teslim Süresi (Gün - Zorunlu)"
                    type="number"
                    required={isProjectTask}
                    {...register("estimated_delivery_days")}
                    placeholder="Örn: 3"
                    error={errors.estimated_delivery_days?.message}
                    className="!rounded-full px-5"
                  />
                </FormRow>
              </SectionCard>
            )}

            <SectionCard 
              icon={FiCheckCircle} 
              title="3. Gereksinim Onayı"
            >
               <div className="bg-[#fffdf9] border border-[#dfded6] p-5 rounded-2xl mb-4 select-none">
                  <p className="text-[10px] font-extrabold text-[#565e74] uppercase tracking-wider mb-3">Bu görev için aranan temel yetenekler:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.requiredSkills && task.requiredSkills.length > 0 ? (
                      task.requiredSkills.map((s: any, idx) => (
                        <SkillBadge key={idx} label={s.skill.name} />
                      ))
                    ) : <span className="text-xs text-gray-400 font-medium italic">Belirtilmemiş</span>}
                  </div>
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

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-[#dfded6]">
              <FormButton
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto !rounded-full px-6"
              >
                <FiX className="mr-2" />
                İptal
              </FormButton>
              <FormButton
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="w-full sm:w-auto !rounded-full px-8 bg-[#004d40] hover:bg-[#00342b]"
              >
                <FiSend className="mr-2" />
                Başvuruyu Gönder
              </FormButton>
            </div>
          </form>
        </div>
      </MainSection>
    </div>
  );
}
