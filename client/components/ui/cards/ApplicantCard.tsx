"use client";

import { Submission } from "@/types/submission";
import { FiCalendar, FiChevronRight, FiAward } from "react-icons/fi";
import StatusBadge from "@/components/ui/badges/StatusBadge";

interface ApplicantCardProps {
  submission: Submission;
  onClick: () => void;
}

export default function ApplicantCard({ submission, onClick }: ApplicantCardProps) {
  // Format score to 2 decimal places if it's a number
  const scoreNum = typeof submission.ai_match_score === "number" ? Number(submission.ai_match_score) : 0;
  const formattedScore = submission.ai_match_score != null ? scoreNum.toFixed(2) : null;

  // Format submission content for preview
  const formatSubmissionContent = (content: string | null | undefined, fallback: string): string => {
    if (!content) return fallback;
    const withoutTags = content
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " ");

    const decoded = withoutTags
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");

    const normalized = decoded
      .replace(/^\s*\[\s*BAŞVURU\s+MEKTUBU\s*\]\s*:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();

    return normalized || fallback;
  };

  return (
    <div
      onClick={onClick}
      className="bg-transparent border border-[#dfded6] rounded-2xl overflow-hidden transition-all duration-300 ease-out relative hover:scale-[1.02] hover:bg-white hover:bg-gradient-to-br hover:from-[#004d40]/[0.045] hover:to-[#ffd54f]/[0.075] hover:border-[#004d40]/50 hover:rounded-none hover:shadow-md hover:z-10 group cursor-pointer flex flex-col justify-between"
    >
      {/* ── Top Progress Bar Header ── */}
      {formattedScore !== null && (
        <div className="relative h-5 w-full overflow-hidden shrink-0">
          {/* Track background */}
          <div className="absolute inset-0 bg-[#e8e7e1]" />

          {/* Layer 1 – muted text on beige track (always visible at low scores) */}
          <div className="absolute inset-0 flex items-center justify-center gap-1 text-[9px] font-normal text-[#b5b2ab] whitespace-nowrap pointer-events-none">
            <FiAward className="w-2.5 h-2.5" />
            AI Uyumlu %{formattedScore}
          </div>

          {/* Fill bar – clips its own light text to only show on green */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00342b] to-[#005c4b] transition-all duration-700 ease-out overflow-hidden"
            style={{ width: `${scoreNum}%` }}
          >
            {/* Layer 2 – light text stretched to full bar width so it stays centered */}
            <div
              className="absolute inset-y-0 left-0 flex items-center justify-center gap-1 text-[9px] font-normal text-[#e8e7e1] whitespace-nowrap"
              style={{ width: scoreNum > 0 ? `${(100 / scoreNum) * 100}%` : "100%" }}
            >
              <FiAward className="w-2.5 h-2.5" />
              AI Uyumlu %{formattedScore}
            </div>
          </div>
        </div>
      )}

      {/* ── Card Body ── */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-16 h-16 avatar-gradient rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shrink-0">
              {submission.student.full_name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="mb-3">
            <h3 className="text-base font-bold text-[#00342b] group-hover:text-[#004d40] transition-colors line-clamp-1">
              {submission.student.full_name}
            </h3>
            <p className="text-xs text-[#565e74] mt-0.5 line-clamp-1">
              {submission.student.university || "Üniversite belirtilmemiş"}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {submission.proposed_budget && (
              <span className="bg-[#eff4ff] text-[#3f465c] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#bfc9c4]/20">
                ₺{submission.proposed_budget} Bütçe
              </span>
            )}
            {submission.estimated_delivery_days && (
              <span className="bg-[#eff4ff] text-[#3f465c] px-2.5 py-1 rounded-lg text-[10px] font-bold border border-[#bfc9c4]/20">
                {submission.estimated_delivery_days} Gün Teslim
              </span>
            )}
          </div>

          <div className="pt-3 border-t border-[#dfded6]/30 mb-4">
            <p className="text-gray-500 text-xs italic line-clamp-2 leading-relaxed">
              &ldquo;{formatSubmissionContent(submission.submission_content, "خطاب تقديم فارغ.")}&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#dfded6]/20 mt-auto">
          <div className="flex items-center gap-3 text-[10px] font-bold text-[#565e74]">
            <span className="flex items-center gap-1">
              <FiCalendar size={12} />
              {new Date(submission.submitted_at || Date.now()).toLocaleDateString("tr-TR")}
            </span>
            <StatusBadge status={submission.status} />
          </div>
          <button className="text-[#00342b] font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer bg-transparent border-0 outline-none">
            İncele <FiChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
