"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FiBookOpen,
  FiPlus,
  FiTrash2,
  FiX,
  FiDollarSign,
  FiAward,
  FiCheck,
  FiZap,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { taskService } from "@/services/task.service";
import { TASK_CATEGORIES } from "@/constants/categories";
import RichTextEditor from "@/components/ui/form/RichTextEditor";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { cn } from "@/utils/cn";

// Form Schema
const createTaskSchema = z.object({
  title: z.string().min(5, "Başlık en az 5 karakter olmalıdır."),
  description: z.string().min(20, "Açıklama en az 20 karakter olmalıdır."),
  category: z.string().min(1, "Kategori seçiniz."),
  subcategory: z.string().min(1, "Alt kategori seçiniz."),
  reward_type: z.string().min(1, "Ödül türü seçiniz."),
  budget: z.any().optional(),
  currency: z.string().optional(),
  internship_duration: z.string().optional(),
  internship_department: z.string().optional(),
  certificate_name: z.string().optional(),
  certificate_issuer: z.string().optional(),
  positions: z.number().min(1, "En az 1 pozisyon olmalıdır."),
  experience_level: z.string().min(1, "Deneyim seviyesi seçiniz."),
  preferred_major: z.string().optional(),
  work_type: z.string().min(1, "Çalışma şekli seçiniz."),
  deadline: z.string().optional(),
});

type CreateTaskFormData = z.infer<typeof createTaskSchema>;

interface SkillItem {
  skill: string;
  level: number;
  isRequired?: boolean;
  yearsOfExperience?: number;
}

export default function NewTaskPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Skill states
  const [hardSkills, setHardSkills] = useState<SkillItem[]>([]);
  const [softSkills, setSoftSkills] = useState<string[]>([]);
  const [hardSkillInput, setHardSkillInput] = useState("");
  const [hardSkillLevel, setHardSkillLevel] = useState(5);
  const [hardSkillIsRequired, setHardSkillIsRequired] = useState(false);
  const [hardSkillYears, setHardSkillYears] = useState<number | "">("");
  const [softSkillInput, setSoftSkillInput] = useState("");
  const [activeRewardTab, setActiveRewardTab] = useState<string>("money");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      positions: 1,
      currency: "TRY",
      reward_type: "money",
      experience_level: "entry",
      work_type: "remote"
    },
  });

  const selectedCategory = watch("category");
  const watchedRewardType = watch("reward_type");

  const availableSubcategories = useMemo(() => {
    const cat = TASK_CATEGORIES.find((c) => c.value === selectedCategory);
    return cat ? cat.subcategories : [];
  }, [selectedCategory]);

  const handleAddHardSkill = () => {
    if (!hardSkillInput.trim()) return;
    if (hardSkills.some((s) => s.skill.toLowerCase() === hardSkillInput.toLowerCase())) {
      setHardSkillInput("");
      return;
    }

    const newSkill: SkillItem = {
      skill: hardSkillInput.trim(),
      level: hardSkillLevel,
      isRequired: hardSkillIsRequired,
      yearsOfExperience: hardSkillYears === "" ? undefined : hardSkillYears,
    };

    setHardSkills([...hardSkills, newSkill]);
    setHardSkillInput("");
    setHardSkillLevel(5);
    setHardSkillIsRequired(false);
    setHardSkillYears("");
  };

  const handleRemoveHardSkill = (skillName: string) => {
    setHardSkills(hardSkills.filter((s) => s.skill !== skillName));
  };

  const handleAddSoftSkill = () => {
    if (!softSkillInput.trim()) return;
    if (softSkills.some((s) => s.toLowerCase() === softSkillInput.toLowerCase())) {
      setSoftSkillInput("");
      return;
    }
    setSoftSkills([...softSkills, softSkillInput.trim()]);
    setSoftSkillInput("");
  };

  const handleRemoveSoftSkill = (skillName: string) => {
    setSoftSkills(softSkills.filter((s) => s !== skillName));
  };

  const onSubmit = async (data: CreateTaskFormData) => {
    if (hardSkills.length === 0) {
      setFormError("En az bir teknik yetenek eklemelisiniz.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      const payload = {
        ...data,
        hardSkills: hardSkills.map(s => ({
            name: s.skill,
            level: s.level,
            isRequired: s.isRequired,
            yearsOfExperience: s.yearsOfExperience
        })),
        softSkills: softSkills,
        budget: data.budget ? Number(data.budget) : undefined,
        positions: Number(data.positions),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      
      await taskService.createTask(payload);
      router.push("/company/tasks");
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } }, message?: string };
      console.error("Task create error:", error);
      setFormError(error?.response?.data?.message || error?.message || "Görev oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#0b1c30] antialiased pb-32">
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header & Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumb 
            items={[
              { label: "Dashboard", href: "/company/dashboard" },
              { label: "Tasks", href: "/company/tasks" },
              { label: "New Task", active: true }
            ]} 
          />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <h1 className="text-3xl font-bold text-primary tracking-tight">Yeni Görev Yayınla</h1>
          </div>
        </div>

        {formError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Core Info & Skills */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information Card */}
            <section className="bg-white/60 backdrop-blur-xl border border-[#DFDED6] rounded-2xl p-6 transition-all duration-300 hover:rounded-none hover:shadow-xl hover:shadow-primary/5 group">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FiBookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-[#0b1c30]">Temel Bilgiler</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Görev Başlığı</label>
                  <input 
                    {...register("title")}
                    className="w-full bg-[#faf9f6]/50 border-transparent rounded-xl px-4 py-3 text-lg font-bold text-primary focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Görev Başlığını Giriniz"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Görev Açıklaması</label>
                  <div className="rounded-xl border border-[#DFDED6] bg-white overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Görev detaylarını buraya yazınız..."
                        />
                      )}
                    />
                  </div>
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Kategori</label>
                    <select 
                      {...register("category")}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      onChange={(e) => {
                        setValue("category", e.target.value);
                        setValue("subcategory", "");
                      }}
                    >
                      <option value="">Seçiniz</option>
                      {TASK_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Alt Kategori</label>
                    <select 
                      {...register("subcategory")}
                      disabled={!selectedCategory}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none appearance-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">{selectedCategory ? "Seçiniz" : "Önce kategori seçiniz"}</option>
                      {availableSubcategories.map(sub => (
                        <option key={sub.value} value={sub.value}>{sub.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3f4945] mb-2 uppercase tracking-wider">Tercih Edilen Bölüm</label>
                  <input 
                    {...register("preferred_major")}
                    className="w-full bg-[#faf9f6]/50 border-transparent rounded-xl px-4 py-3 text-sm font-medium focus:bg-white transition-all outline-none"
                    placeholder="Bilgisayar Mühendisliği, Yazılım Mühendisliği..."
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Pozisyon Sayısı</label>
                    <input 
                      type="number" 
                      {...register("positions", { valueAsNumber: true })}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-lg px-3 py-2 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Deneyim</label>
                    <select 
                      {...register("experience_level")}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-lg px-3 py-2 text-sm font-bold"
                    >
                      <option value="entry">Entry</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid-Level</option>
                      <option value="senior">Senior</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Çalışma Şekli</label>
                    <select 
                      {...register("work_type")}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-lg px-3 py-2 text-sm font-bold"
                    >
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#3f4945] mb-1.5 uppercase tracking-wider">Son Başvuru</label>
                    <input 
                      type="date" 
                      {...register("deadline")}
                      className="w-full bg-[#faf9f6]/50 border-transparent rounded-lg px-3 py-2 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Skill Management Card (AI Core) */}
            <section className="bg-white/60 backdrop-blur-xl border border-[#DFDED6] rounded-2xl p-6 transition-all duration-300 hover:rounded-none hover:shadow-xl hover:shadow-primary/5 group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HiSparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-[#0b1c30]">Yetenek Yönetimi <span className="text-primary/50 text-sm font-normal ml-2">(AI Core)</span></h2>
                </div>
              </div>

              {/* Skill Input Adder */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Yetenek adı (Örn: React, Node.js)"
                    value={hardSkillInput}
                    onChange={(e) => setHardSkillInput(e.target.value)}
                    className="flex-1 bg-white border border-[#DFDED6] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary transition-all"
                  />
                  <div className="flex items-center gap-4">
                     <div className="flex-1 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Seviye:</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={hardSkillLevel}
                          onChange={(e) => setHardSkillLevel(Number(e.target.value))}
                          className="flex-1 h-1.5 bg-primary/20 rounded-full appearance-none accent-primary cursor-pointer"
                        />
                        <span className="text-xs font-bold text-primary w-6">{hardSkillLevel}</span>
                     </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                   <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={hardSkillIsRequired}
                          onChange={(e) => setHardSkillIsRequired(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 rounded-full peer-checked:bg-primary relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 shadow-inner" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-primary transition-colors">Zorunlu</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Deneyim (Yıl):</span>
                        <input
                          type="number"
                          placeholder="Yıl"
                          value={hardSkillYears}
                          onChange={(e) => setHardSkillYears(e.target.value === "" ? "" : Number(e.target.value))}
                          className="w-16 bg-white border border-[#DFDED6] rounded-lg px-2 py-1 text-xs text-center font-bold outline-none"
                        />
                      </div>
                   </div>
                   <button
                    type="button"
                    onClick={handleAddHardSkill}
                    className="bg-primary text-white px-6 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                  >
                    <FiPlus className="w-3.5 h-3.5" />
                    Listeye Ekle
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hard Skills</h3>
                <div className="space-y-3">
                  {hardSkills.map((h) => (
                    <div key={h.skill} className="bg-white/40 p-4 rounded-xl border border-[#F1F0EA] flex flex-col md:flex-row md:items-center gap-4 group/item hover:border-primary/30 transition-all">
                      <div className="md:w-1/4">
                        <span className="font-bold text-primary">{h.skill}</span>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary/40 rounded-full" style={{ width: `${h.level * 10}%` }} />
                        </div>
                        <span className="text-xs font-bold text-primary/60">{h.level}/10</span>
                      </div>
                      <div className="md:w-1/4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold", h.isRequired ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                            {h.isRequired ? "Zorunlu" : "Opsiyonel"}
                          </span>
                          {h.yearsOfExperience !== undefined && (
                            <span className="text-[10px] font-bold text-slate-500">{h.yearsOfExperience} Yıl Deneyim</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveHardSkill(h.skill)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-all"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {hardSkills.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-sm font-medium">
                      Henüz teknik yetenek eklenmedi.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Soft Skills</h3>
                <div className="flex flex-wrap gap-2 p-4 bg-[#faf9f6]/50 rounded-2xl border border-dashed border-[#DFDED6]">
                  {softSkills.map((s) => (
                    <span key={s} className="bg-[#dae2fd] text-[#5c647a] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 group/tag animate-in fade-in zoom-in">
                      {s}
                      <button type="button" onClick={() => handleRemoveSoftSkill(s)} className="hover:text-red-500 transition-colors">
                        <FiX className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={softSkillInput}
                    onChange={(e) => setSoftSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSoftSkill())}
                    className="bg-transparent border-none focus:ring-0 text-sm py-1 placeholder:text-slate-300 min-w-[120px]"
                    placeholder="Enter ile ekle..."
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Reward Sidebar */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
            {/* Reward Section */}
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border-2 border-primary/10 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-[#e28743]/10 rounded-lg">
                  <FiDollarSign className="w-5 h-5 text-[#e28743]" />
                </div>
                <h2 className="text-xl font-bold text-[#0b1c30]">Ödül Sistemi</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest text-center">Ödül Türü Seçiniz</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["money", "internship", "certificate"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setValue("reward_type", type);
                          setActiveRewardTab(type);
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all duration-300",
                          (watchedRewardType === type || activeRewardTab === type)
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                            : "bg-white border-[#DFDED6] text-slate-400 hover:border-primary/30"
                        )}
                      >
                        {type === "money" && <FiDollarSign className="w-5 h-5" />}
                        {type === "internship" && <FiAward className="w-5 h-5" />}
                        {type === "certificate" && <FiCheck className="w-5 h-5" />}
                        <span className="text-[9px] font-extrabold uppercase">{type === "money" ? "Nakit" : type === "internship" ? "Staj" : "Belge"}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                  {watchedRewardType === "money" && (
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Bütçe</label>
                          <input 
                            {...register("budget")}
                            className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold text-primary outline-none focus:bg-white transition-colors"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Para</label>
                          <select 
                            {...register("currency")}
                            className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold outline-none cursor-pointer"
                          >
                            <option value="TRY">TRY</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 italic text-center">Nakit ödüller, görev tamamlandıktan sonra onaylanan hesaba 3 iş günü içinde aktarılır.</p>
                    </div>
                  )}

                  {watchedRewardType === "internship" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Staj Süresi</label>
                        <select 
                          {...register("internship_duration")}
                          className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold outline-none"
                        >
                          <option value="1 month">1 Ay</option>
                          <option value="3 months">3 Ay</option>
                          <option value="6 months">6 Ay</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Departman</label>
                        <input 
                          {...register("internship_department")}
                          className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold outline-none"
                          placeholder="Pazarlama / Yazılım..."
                        />
                      </div>
                    </div>
                  )}

                  {watchedRewardType === "certificate" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Sertifika Adı</label>
                        <input 
                          {...register("certificate_name")}
                          className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 ml-1 uppercase">Kurum</label>
                        <input 
                          {...register("certificate_issuer")}
                          className="w-full bg-[#faf9f6] border-transparent rounded-xl px-4 py-3 font-bold outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* AI Matching Indicator Card */}
            <section className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 border border-[#DFDED6] relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FiZap className="w-24 h-24 text-primary" />
              </div>
              <h3 className="text-xs font-bold mb-4 text-slate-400 uppercase tracking-widest">AI Eşleşme Analizi</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#DFDED6" strokeWidth="4" />
                    <circle cx="32" cy="32" r="28" fill="transparent" stroke="#00342b" strokeWidth="4" strokeDasharray="176" strokeDashoffset={176 - (176 * 82) / 100} strokeLinecap="round" className="transition-all duration-1000" />
                   </svg>
                   <span className="absolute text-xs font-bold text-primary">--%</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">Talent Pool Uyumu</p>
                  <p className="text-[10px] text-slate-400 mt-1">Kriterler girildiğinde AI analizi <span className="text-primary font-bold">canlı</span> olarak güncellenir.</p>
                </div>
              </div>
            </section>
          </aside>
        </form>
      </main>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[640px] px-6 z-50">
        <div className="bg-white/80 backdrop-blur-2xl rounded-3xl p-3 shadow-2xl border border-[#DFDED6] flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-8 py-3.5 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
          >
            İptal
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit(onSubmit)}
            className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-[#002b24] transition-all transform active:scale-[0.98] shadow-xl shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <FiPlus className="w-5 h-5" />
                Görevi Yayınla
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
