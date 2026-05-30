"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormButton } from "@/components/ui/form";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import { Task } from "@/types/task";
import { useToast } from "@/context/ToastContext";
import MainSection from "@/components/ui/layouts/MainSection";
import SectionCard from "@/components/ui/cards/SectionCard";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { FiFileText, FiSend, FiX } from "react-icons/fi";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";

const applySchema = z.object({
  submission_content: z.string().min(50, "Lütfen en az 50 karakterlik bir başvuru yazısı girin."),
});

type ApplyValues = z.infer<typeof applySchema>;

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplyValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      submission_content: "",
    },
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        if (taskId) {
          const data = await taskService.getTaskById(taskId);
          setTask(data);
        }
      } catch (error) {
        showToast("Görev bilgileri alınamadı.", "error");
        router.push("/student/tasks");
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [taskId, router]);

  const onSubmit = async (data: ApplyValues) => {
    try {
      await submissionService.createSubmission(taskId, {
        submission_content: data.submission_content,
      });
      showToast("Başvurunuz başarıyla gönderildi!", "success");
      router.push("/student/tasks");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Başvuru sırasında bir hata oluştu.", "error");
    }
  };

  if (loading) {
    return <PageLoadingSkeleton />;
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <EmptyState title="Görev Bulunamadı" message="Başvuru yapmak istediğiniz görev bulunamadı." icon={FiFileText} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
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
        </div>

        <div className="max-w-4xl">
          <SectionCard
            icon={FiFileText}
            title="Başvuru Mektubu (Cover Letter)"
            description="Lütfen başvuru mektubunuzu veya detaylarınızı aşağıya giriniz."
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <Controller
                  control={control}
                  name="submission_content"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Örn: Bu görevle ilgileniyorum çünkü..."
                      />
                      {errors.submission_content && (
                        <p className="text-xs text-red-500 font-medium ml-2">
                          {errors.submission_content.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-6 border-t border-[#f1f0ea]">
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
          </SectionCard>
        </div>
      </MainSection>
    </div>
  );
}
