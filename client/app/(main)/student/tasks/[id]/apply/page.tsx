"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import FormCard from "@/components/ui/form/FormCard";
import FormRow from "@/components/ui/form/FormRow";
import FormField from "@/components/ui/form/FormField";
import FormInput from "@/components/ui/form/FormInput";
import FormButton from "@/components/ui/form/FormButton";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import MainSection from "@/components/ui/layouts/MainSection";
import Input from "@/components/ui/Input";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Button from "@/components/ui/Button";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import { studentService } from "@/services/student.service";
import { Task } from "@/types/task";
import { StudentProfile } from "@/types/student";
import { useToast } from "@/context/ToastContext";
import { FiBriefcase, FiMapPin } from "react-icons/fi";

const applySchema = z.object({
  coverLetter: z.string().min(50, "Lütfen en az 50 karakterlik bir başvuru yazısı girin."),
  proposed_budget: z.coerce.number().optional(),
  estimated_delivery_days: z.coerce.number().optional(),
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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
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
      <div className="max-w-4xl mx-auto px-4 py-8 mt-10">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiMapPin className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Profiliniz Eksik!</h2>
          <p className="text-gray-600 max-w-lg mx-auto text-sm leading-relaxed">
            Yapay zeka (AI) eşleştirme algoritmasının düzgün çalışabilmesi ve şirketlerin size güvenebilmesi için profilinizdeki zorunlu alanları (Bölüm, Mezuniyet Yılı, Yetenekler ve Portfolyo/GitHub bağlantısı) doldurmanız gerekmektedir.
          </p>
          <div className="pt-4 flex justify-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>Geri Dön</Button>
            <Button variant="primary" onClick={() => router.push('/student/settings')}>Profilimi Tamamla</Button>
          </div>
        </div>
      </div>
    );
  }

  const isMoneyTask = task.reward_type?.toLowerCase() === 'money';
  const isProjectTask = !task.reward_type || ['money', 'certificate', 'recommendation'].includes(task.reward_type.toLowerCase());
  
  // Dynamic section numbering
  let sectionIndex = 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

      {/* Page Header Outside Box */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between select-none">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#004d40]/10 text-[#004d40] mb-3">
              Başvuru Formu
            </span>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 leading-tight mb-2">{task.title}</h1>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider text-gray-450">
              <span className="flex items-center gap-1.5 text-gray-700">
                <FiBriefcase className="text-[#004d40] w-4 h-4" /> {task.company?.company_name}
              </span>
              <span className="flex items-center gap-1.5">
                <FiMapPin className="text-gray-400 w-4 h-4" /> {task.location || "Uzaktan"}
              </span>
            </div>
          </div>
          {task.company?.logo_url && (
            <img src={task.company.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl border border-[#f1f0ea] object-cover bg-white p-1.5 shadow-2xs" />
          )}
      </div>

      <div className="bg-white rounded-3xl border border-[#f1f0ea] shadow-2xs p-6 lg:p-10">
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
          

          <MainSection title={`${sectionIndex++}. Başvuru Mektubu (Zorunlu)`} hideHeader={false}>
            <p className="text-sm text-gray-500 mb-5 font-medium leading-relaxed">Bu göreve neden uygun olduğunuzu, varsa tecrübelerinizi ve görevi nasıl yapmayı planladığınızı detaylıca açıklayın.</p>
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
          </MainSection>

          {isProjectTask && (
            <MainSection title={`${sectionIndex++}. Teklifiniz ${isMoneyTask ? "(Opsiyonel)" : ""}`} hideHeader={false}>
              <p className="text-sm text-gray-500 mb-6 font-medium leading-relaxed">Şirketin değerlendirebilmesi için {isMoneyTask ? "talep ettiğiniz bütçeyi ve " : ""}teslim süresini belirtin.</p>
              <FormRow>
                {isMoneyTask && (
                  <FormField label="Talep Edilen Bütçe ($ - İsteğe Bağlı)" error={errors.proposed_budget?.message}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 select-none">
                        <span className="font-bold text-sm">$</span>
                      </div>
                      <Input
                        {...register("proposed_budget")}
                        type="number"
                        className="pl-8 pr-4 py-3 rounded-xl hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400"
                        placeholder="Örn: 150"
                        error={!!errors.proposed_budget}
                      />
                    </div>
                  </FormField>
                )}
                
                <FormField label="Tahmini Teslim Süresi (Gün - Zorunlu)" error={errors.estimated_delivery_days?.message}>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 select-none">
                      <FiBriefcase className="w-4 h-4 text-[#004d40]" />
                    </div>
                    <Input
                      {...register("estimated_delivery_days")}
                      type="number"
                      required={isProjectTask}
                      className="pl-10 pr-4 py-3 rounded-xl hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400"
                      placeholder="Örn: 3"
                      error={!!errors.estimated_delivery_days}
                    />
                  </div>
                </FormField>
              </FormRow>
            </MainSection>
          )}

          <MainSection title={`${sectionIndex++}. Gereksinim Onayı`} hideHeader={false}>
             <div className="bg-transparent border border-[#f1f0ea] p-5 rounded-2xl mb-4 select-none">
                <p className="text-xs font-bold text-gray-450 uppercase tracking-wider mb-3">Bu görev için aranan temel yetenekler:</p>
                <div className="flex flex-wrap gap-2">
                  {task.requiredSkills && task.requiredSkills.length > 0 ? (
                    task.requiredSkills.map((s: any, idx) => (
                      <span key={idx} className="bg-[#004d40]/5 px-3 py-1.5 rounded-xl text-[10px] text-[#004d40] border border-[#004d40]/10 font-bold uppercase tracking-wider">
                        {s.skill.name}
                      </span>
                    ))
                  ) : <span className="text-xs text-gray-400 font-medium italic">Belirtilmemiş</span>}
                </div>
             </div>

             <label className="flex items-start gap-3 cursor-pointer group mt-6 select-none">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    {...register("agreesToRequirements")}
                    className="w-5 h-5 border-gray-300 rounded-lg text-[#004d40] focus:ring-[#004d40]/15 bg-white cursor-pointer transition-all"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800">Gereksinimleri Onaylıyorum</span>
                  <p className="text-xs text-gray-450 mt-1 font-medium leading-relaxed">Bu görevi üstlenmek için yukarıdaki yeteneklere sahip olduğumu ve görev şartlarını kabul ettiğimi beyan ederim.</p>
                </div>
              </label>
              {errors.agreesToRequirements?.message && (
                <p className="mt-2 text-xs text-red-500 font-medium">{errors.agreesToRequirements.message}</p>
              )}
          </MainSection>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#f1f0ea] select-none">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 py-3 cursor-pointer rounded-xl"
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-8 py-3 bg-[#004d40] hover:bg-[#00332a] text-white border-transparent cursor-pointer rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Gönderiliyor..." : "Başvurumu Tamamla"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
