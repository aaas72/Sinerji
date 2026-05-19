"use client";

import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Button from "@/components/ui/Button";
import SkillBadge from "@/components/ui/SkillBadge";
import {
  FiBookmark,
  FiLink,
  FiStar,
  FiBriefcase,
  FiMapPin,
  FiShare2,
  FiAward,
  FiZap,
  FiCheckCircle,
} from "react-icons/fi";
import { Task, getRewardIcon } from "./types";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { useState, useEffect } from "react";

interface TaskDetailProps {
  task: Task;
}

export default function TaskDetail({ task }: TaskDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);
  const hasMatchPercentage = typeof task.matchPercentage === "number";

  useEffect(() => {
    const saved = localStorage.getItem(`saved_task_${task.id}`);
    if (saved) setIsSaved(true);
  }, [task.id]);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      localStorage.removeItem(`saved_task_${task.id}`);
      setIsSaved(false);
      showToast("Görev kaydedilenlerden çıkarıldı.", "success");
    } else {
      localStorage.setItem(`saved_task_${task.id}`, "true");
      setIsSaved(true);
      showToast("Görev başarıyla kaydedildi!", "success");
    }
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' ? `${window.location.origin}/student/tasks/${task.id}` : '';
    navigator.clipboard.writeText(url).then(() => {
      showToast("Bağlantı kopyalandı!", "success");
    }).catch(() => {
      showToast("Bağlantı kopyalanamadı.", "error");
    });
  };

  const RewardIcon = getRewardIcon(task.rewardType);

  return (
    <div className="flex flex-col h-full bg-transparent z-10 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
      
      {/* 1. Minimalist Editorial Header */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo Badge */}
          <div className="w-10 h-10 bg-transparent rounded-lg flex items-center justify-center font-extrabold text-[#004d40] text-xs border border-gray-200 shrink-0">
            {task.company.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Link
              href={task.company.id ? `/companies/${task.company.id}` : "#"}
              className="hover:underline font-bold text-xs text-gray-500 uppercase tracking-wider block"
            >
              {task.company.name}
            </Link>
            <div className="flex items-center gap-1.5 text-[10px] text-[#e28743] font-bold mt-0.5">
              <span className="flex items-center">
                4.2 <FiStar className="w-3 h-3 ml-0.5 fill-current" />
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-400 font-medium">Mentor Network</span>
            </div>
          </div>
        </div>

        <h1 className="font-extrabold text-2xl lg:text-3xl text-gray-900 leading-tight tracking-tight wrap-break-word">
          {task.title}
        </h1>
      </div>

      {/* 2. Premium Horizontal Metadata Divider Bar */}
      <div className="border-y border-[#f1f0ea] py-4 mb-6 flex flex-wrap items-center justify-between gap-4 flex-shrink-0 text-xs">
        <div className="flex flex-wrap items-center gap-6">
          {/* Reward Info */}
          <div className="flex items-center gap-2">
            <FiAward className="w-4 h-4 text-[#004d40]" />
            <div>
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Ödül</p>
              <p className="font-bold text-gray-800">
                {task.rewardType === "Nakit" && task.rewardAmount 
                  ? task.rewardAmount 
                  : task.rewardType || "Belirtilmemiş"}
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-[#004d40]" />
            <div>
              <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Konum</p>
              <p className="font-bold text-gray-800">
                {task.location || "Türkiye"}
                {task.workType && (
                  <span className="text-[#004d40] font-bold text-[9px] bg-emerald-50/40 border border-emerald-150 rounded px-1 ml-1.5">
                    {task.workType === 'remote' ? 'Uzaktan' : task.workType === 'hybrid' ? 'Hibrit' : task.workType === 'onsite' ? 'Ofiste' : task.workType}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* AI Match Info */}
          {hasMatchPercentage && (
            <div className="flex items-center gap-2">
              <FiZap className="w-4 h-4 text-[#e28743]" />
              <div>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">AI Uyum Skoru</p>
                <p className="font-extrabold text-[#e28743]">
                  %{task.matchPercentage} Eşleşme
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action icons row */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all ${
              isSaved
                ? "border-emerald-600/30 text-emerald-700 bg-emerald-50/20"
                : "border-gray-200 text-gray-400 hover:bg-gray-50/20 hover:border-emerald-600 hover:text-emerald-700"
            }`}
            title="Görevi Kaydet"
          >
            <FiBookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleCopyLink}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:bg-gray-50/20 hover:border-emerald-600 hover:text-emerald-700 transition-all"
            title="Bağlantıyı Kopyala"
          >
            <FiLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. AI Match Evaluation Quote Section */}
      {hasMatchPercentage && task.matchExplanation && (
        <div className="border-l-2 border-[#e28743] pl-4 py-1.5 mb-6 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#e28743] mb-1 flex items-center gap-1.5 select-none">
            <FiZap className="animate-pulse fill-current" /> Yapay Zeka Eşleşme Değerlendirmesi
          </p>
          <p className="italic text-gray-600 text-[12.5px] leading-relaxed">
            "{task.matchExplanation}"
          </p>
          
          {task.matchReasons && task.matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {task.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-1 text-[10px] font-semibold text-emerald-800">
                  <FiCheckCircle className="text-emerald-600 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Required Skills Section */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-8 flex-shrink-0">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <FiBriefcase className="text-gray-400" /> Aranan Beceriler
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag: string, i: number) => (
              <SkillBadge 
                key={i} 
                label={tag} 
                className="px-3 py-1 bg-transparent text-gray-700 rounded-full text-xs font-semibold border border-gray-200"
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Body Task Details */}
      <div className="flex-1 space-y-6">
        <div>
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 pb-1 border-b border-gray-100">
            {task.detailTitle || "Görev Açıklaması"}
          </h3>
          <div className="text-gray-600 leading-relaxed text-sm wrap-break-word">
            {task.detailBody ? (
              <div
                className="prose prose-sm prose-slate max-w-full wrap-break-word whitespace-pre-wrap prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-[#004d40] hover:prose-a:text-[#003d33] prose-strong:text-gray-900"
                style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                dangerouslySetInnerHTML={{ __html: task.detailBody }}
              />
            ) : (
              <div className="prose prose-sm prose-slate max-w-full">
                <p><strong>Genel Tanım:</strong></p>
                <p>{task.description || "Bu görev için detaylı bir açıklama girilmemiştir."}</p>
              </div>
            )}
          </div>
        </div>

        {/* 6. Sticky High-Contrast CTA Apply Footer */}
        <div className="pt-6 border-t border-[#f1f0ea] flex items-center justify-between gap-4 mt-8">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bu Göreve Başvur</p>
            <p className="text-xs text-gray-500 mt-0.5">Sinerji ile kariyerinde fark yarat.</p>
          </div>
          <Button
            className="bg-[#004d40] hover:bg-[#003d33] text-white px-8 py-3.5 rounded-full font-bold text-xs whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 active:scale-98"
            onClick={() => router.push(`/student/tasks/${task.id}/apply`)}
          >
            Görevi Al
            <FiShare2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

