"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import MainSection from '@/components/layout/MainSection';
import Breadcrumb from "@/components/ui/Breadcrumb";
import { submissionService } from "@/services/submission.service";
import { taskService } from "@/services/task.service";
import { Submission } from "@/types/submission";
import { Task } from "@/types/task";
import PrimaryButton from "@/components/ui/PrimaryButton";
import ApplicantCard from '@/components/features/applicants/ApplicantCard';
import ApplicantsSearchFilter from '@/components/features/applicants/ApplicantsSearchFilter';
import { useToast } from "@/context/ToastContext";
import PageLoadingSkeleton from "@/components/ui/PageLoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import {
  FiUser,
  FiCalendar,
  FiExternalLink,
  FiArrowLeft,
  FiX,
  FiCheck,
  FiMail,
  FiBookOpen,
  FiCheckCircle,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiInfo,
  FiStar,
  FiAlertCircle,
  FiAward,
  FiZap,
  FiClock,
} from "react-icons/fi";
import { reviewService } from "@/services/review.service";
import PaymentModal from "@/components/features/companies/PaymentModal";

function formatSubmissionContent(content: string | null | undefined, fallback: string): string {
  if (!content) return fallback;

  // Remove tags first, then decode entities for a clean plain-text preview.
  const withoutTags = content
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  let decoded = withoutTags;
  if (typeof window !== "undefined") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = withoutTags;
    decoded = textarea.value;
  } else {
    decoded = withoutTags
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }

  const normalized = decoded
    .replace(/^\s*\[\s*BAŞVURU\s+MEKTUBU\s*\]\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || fallback;
}

/* ── Review Modal ── */
function ReviewModal({
  submission,
  onClose,
  onUpdate,
}: {
  submission: Submission;
  onClose: () => void;
  onUpdate: (updated: Submission) => void;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState<"approved" | "rejected" | "reviewing" | null>(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [hasReview, setHasReview] = useState(!!submission.review);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (submission.review) {
      setRating(submission.review.rating || 5);
      setFeedback(submission.review.feedback || "");
      setHasReview(true);
    }
  }, [submission.review]);

  const handle = async (status: "approved" | "rejected") => {
    setLoading(status);
    try {
      const updated = await submissionService.updateSubmission(submission.id, status);
      onUpdate(updated);
      showToast(
        status === "approved" ? "Başvuru onaylandı." : "Başvuru reddedildi.",
        status === "approved" ? "success" : "error"
      );
      onClose();
    } catch {
      showToast("İşlem sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(null);
    }
  };

  const handleReview = async () => {
    setLoading("reviewing");
    try {
      await reviewService.createReview(submission.id, { rating, feedback });
      showToast("Değerlendirme başarıyla kaydedildi.", "success");
      setHasReview(true);
    } catch {
      showToast("Değerlendirme kaydedilirken bir hata oluştu.", "error");
    } finally {
      setLoading(null);
    }
  };

  const statusLabel =
    submission.status === "approved"
      ? "Onaylandı"
      : submission.status === "rejected"
      ? "Reddedildi"
      : "Bekliyor";

  const statusCls =
    submission.status === "approved"
      ? "bg-green-100 text-green-700"
      : submission.status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm bg-[#0b1c30]/40 animate-fadeIn">
      {/* backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {showPaymentModal && (
        <PaymentModal 
          submission={submission}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={(updated) => {
            setShowPaymentModal(false);
            onUpdate(updated);
          }}
        />
      )}

      <div className="relative bg-white rounded-3xl shadow-2xl app-container w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row z-10 animate-scaleUp">
        {/* close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/20 transition-all cursor-pointer"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Left Column: Candidate Info */}
        <div className="w-full md:w-5/12 p-6 border-r border-[#dfded6]/40 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 avatar-gradient rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shrink-0">
              {submission.student.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#00342b]">
                {submission.student.full_name}
              </h2>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <FiStar
                    key={s}
                    className={`w-4 h-4 ${
                      s <= (submission.review?.rating || 4.5)
                        ? "text-[#e28743] fill-[#e28743]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-gray-500 ml-1">
                  {submission.review?.rating ? `${submission.review.rating}.0` : "4.5"}/5.0
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#eff4ff]/60 rounded-xl border border-[#bfc9c4]/30 text-[#00342b] font-bold text-xs hover:bg-[#eff4ff] transition-colors cursor-default">
              <FiBookOpen className="w-4 h-4 text-[#004d40]" />
              Cover Letter
            </button>
            <a
              href={`mailto:${submission.student.user.email}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#eff4ff]/60 rounded-xl border border-[#bfc9c4]/30 text-[#00342b] font-bold text-xs hover:bg-[#eff4ff] transition-colors"
            >
              <FiMail className="w-4 h-4 text-[#004d40]" />
              Contact
            </a>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Cover Letter Summary</h4>
            <div className="relative p-5 bg-[#faf9f6] rounded-xl border-l-4 border-[#00342b] italic text-xs text-gray-700 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar shadow-sm">
              &quot;{formatSubmissionContent(submission.submission_content, "İçerik belirtilmemiş.")}&quot;
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Technical Skill Stack</h4>
            <div className="flex flex-wrap gap-2">
              {submission.student.university && (
                <span className="px-3 py-1 bg-[#00342b]/5 text-[#00342b] rounded-full text-xs font-semibold border border-[#00342b]/10">
                  {submission.student.university}
                </span>
              )}
              <span className="px-3 py-1 bg-[#00342b]/5 text-[#00342b] rounded-full text-xs font-semibold border border-[#00342b]/10">
                {submission.student.user.email}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="w-full md:w-7/12 flex flex-col bg-white overflow-hidden">
          {/* Header Panel */}
          <div className="p-6 bg-[#00342b] text-white relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743]/10 opacity-20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="flex items-center justify-between mb-2 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#e28743] rounded-full animate-pulse shadow-[0_0_8px_#e28743]" />
                <span className="text-[10px] font-bold text-[#afefdd] uppercase tracking-wider">AI Matchmaking Active</span>
              </div>
              <div className="text-4xl font-extrabold text-[#e28743]">
                %{Number(submission.ai_match_details?.score || submission.ai_match_score || 0).toFixed(2)}
              </div>
            </div>
            <h3 className="text-base font-bold text-white relative z-10">Advanced Candidate Analytics</h3>
            <p className="text-xs text-white/80 mt-1 relative z-10">Matching based on behavioral patterns and technical depth.</p>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-6 max-h-[50vh] md:max-h-[60vh]">
            {/* Strengths & Weaknesses */}
            <div>
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Strategic Analysis</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#00342b]/5 rounded-xl p-4 border border-[#00342b]/10">
                  <p className="text-xs font-bold text-[#00342b] flex items-center gap-1.5 mb-2">
                    <FiCheckCircle className="text-[#00342b] w-4 h-4" /> Güçlü Yönler
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    {submission.ai_match_details?.strengths?.map((s, idx) => (
                      <li key={idx} className="leading-tight">{s}</li>
                    )) || <li className="italic text-gray-400">Veri yok</li>}
                  </ul>
                </div>
                <div className="bg-[#ba1a1a]/5 rounded-xl p-4 border border-[#ba1a1a]/10">
                  <p className="text-xs font-bold text-[#ba1a1a] flex items-center gap-1.5 mb-2">
                    <FiAlertCircle className="text-[#ba1a1a] w-4 h-4" /> Gelişim Alanları
                  </p>
                  <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                    {submission.ai_match_details?.weaknesses?.map((w, idx) => (
                      <li key={idx} className="leading-tight">{w}</li>
                    )) || <li className="italic text-gray-400">Veri yok</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Skill Matrix */}
            <div>
              <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-3">Skill Match Matrix</h4>
              <div className="space-y-4">
                {submission.ai_match_details?.skill_details?.map((skill, idx) => {
                  const matchTypeLabel = skill.match_type === 'exact' ? 'Tam Eşleşme' : 
                                         skill.match_type.includes('semantic') ? `Benzerlik: ${skill.matched_to}` :
                                         skill.match_type.includes('ontology') ? `İlişkili: ${skill.matched_to}` : 'Eksik';
                  
                  const similarityPercentage = Math.round(skill.similarity * 100);
                  const isHigh = skill.satisfaction > 0.8;
                  const isMedium = skill.satisfaction > 0.4;
                  const barColor = isHigh ? 'bg-[#00342b]' : isMedium ? 'bg-[#e28743]' : 'bg-[#565e74]';
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#00342b]">{skill.required}</span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{matchTypeLabel}</span>
                        </div>
                        <span className="text-[#00342b]">%{similarityPercentage || 0}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${similarityPercentage}%` }}></div>
                      </div>
                    </div>
                  );
                }) || <p className="text-xs text-gray-400 italic">Yetenek matrisi verisi bulunamadı.</p>}
              </div>
            </div>

            {/* Top Projects */}
            {submission.ai_match_details?.top_projects && submission.ai_match_details.top_projects.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider mb-2">Deneyim Kanıtları</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {submission.ai_match_details.top_projects.map((proj, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 px-3 py-2.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-700 font-bold line-clamp-1">{proj.title}</span>
                      <span className="text-xs font-black text-[#00342b] bg-white px-2 py-1 rounded-md shadow-sm">%{proj.similarity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-[#dfded6]/30 flex flex-col gap-4 bg-[#faf9f6] shrink-0">
            {submission.status === "pending" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handle("rejected")}
                  disabled={!!loading}
                  className="flex-1 py-3 border-2 border-[#ba1a1a] text-[#ba1a1a] rounded-full font-bold hover:bg-[#ba1a1a] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                  Reddet
                </button>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!!loading}
                  className="flex-1 py-3 bg-[#00342b] text-white rounded-full font-bold shadow-lg shadow-[#00342b]/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  Öğrenciye Teklif Gönder
                </button>
              </div>
            ) : submission.status === "offered" ? (
              <p className="text-center text-xs text-[#e28743] bg-[#e28743]/10 py-3 rounded-xl border border-[#e28743]/20 font-bold flex items-center justify-center gap-2">
                <FiClock className="w-4 h-4" />
                Teklif Gönderildi. Öğrencinin yanıtı bekleniyor...
              </p>
            ) : submission.status === "accepted" ? (
              <p className="text-center text-xs text-[#004d40] bg-[#004d40]/10 py-3 rounded-xl border border-[#004d40]/20 font-bold flex items-center justify-center gap-2">
                <FiZap className="w-4 h-4" />
                Öğrenci teklifi kabul etti, görev üzerinde çalışıyor...
              </p>
            ) : submission.status === "submitted" ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handle("rejected")}
                  disabled={!!loading}
                  className="flex-1 py-3 border-2 border-[#ba1a1a] text-[#ba1a1a] rounded-full font-bold hover:bg-[#ba1a1a] hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                  {loading === "rejected" ? "İşleniyor..." : "İşi Reddet (Revizyon)"}
                </button>
                <button
                  onClick={() => handle("approved")}
                  disabled={!!loading}
                  className="flex-1 py-3 bg-[#00342b] text-white rounded-full font-bold shadow-lg shadow-[#00342b]/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <FiCheckCircle className="w-4 h-4" />
                  {loading === "approved" ? "İşleniyor..." : "İşi Onayla (Ödemeyi Serbest Bırak)"}
                </button>
              </div>
            ) : submission.status === "approved" || submission.status === "reviewed" ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-2">
                  <FiCheckCircle className="text-green-500 w-4 h-4" /> Öğrenci Değerlendirmesi
                </h4>
                
                {hasReview ? (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} className={`w-3.5 h-3.5 ${s <= rating ? "text-[#e28743] fill-[#e28743]" : "text-gray-300"}`} />
                      ))}
                      <span className="text-xs font-bold ml-2 text-green-700">{rating}/5</span>
                    </div>
                    <p className="text-xs text-green-800 italic">{feedback || "Geri bildirim yok."}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Puan Ver</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            onClick={() => setRating(s)}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer font-bold ${
                              rating === s
                                ? "border-[#00342b] bg-[#00342b] text-white"
                                : "border-gray-200 text-gray-400 hover:border-[#00342b]/20"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Geri Bildirim (Opsiyonel)</label>
                      <textarea
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 p-3 text-xs outline-none focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
                        placeholder="Öğrencinin performansı hakkında not bırakın..."
                      />
                    </div>
                    <button
                      onClick={handleReview}
                      disabled={!!loading}
                      className="w-full bg-[#00342b] text-white font-bold py-2.5 rounded-full hover:opacity-90 shadow-md shadow-[#00342b]/15 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading === "reviewing" ? "Kaydediliyor..." : "Değerlendirmeyi Kaydet"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 bg-gray-50 py-3 rounded-xl border border-gray-100 font-medium">
                Bu başvuru reddedildi.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function TaskApplicantsPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [minAiScore, setMinAiScore] = useState<string>("");
  const [sortBy, setSortBy] = useState<"ai_desc" | "ai_asc" | "newest" | "oldest">("ai_desc");

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selected]);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id) return;
      try {
        const taskId = Number(params.id);
        const [taskData, submissionsData] = await Promise.all([
          taskService.getTaskById(taskId),
          submissionService.getTaskSubmissions(taskId),
        ]);
        const sortedSubmissions = [...submissionsData].sort(
          (a: Submission, b: Submission) => (b.ai_match_score || 0) - (a.ai_match_score || 0)
        );
        setTask(taskData);
        setSubmissions(sortedSubmissions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleUpdate = (updated: Submission) => {
    setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const minAiScoreNumber = minAiScore === "" ? null : Number(minAiScore);

  const filteredSubmissions = submissions
    .filter((submission) => {
      const fullName = submission.student.full_name.toLowerCase();
      const email = submission.student.user.email.toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      const matchesQuery =
        query.length === 0 || fullName.includes(query) || email.includes(query);

      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;

      const score = typeof submission.ai_match_score === "number" ? submission.ai_match_score : 0;
      const matchesScore =
        minAiScoreNumber === null ||
        (!Number.isNaN(minAiScoreNumber) && score >= minAiScoreNumber);

      return matchesQuery && matchesStatus && matchesScore;
    })
    .sort((a, b) => {
      if (sortBy === "ai_desc") return (b.ai_match_score || 0) - (a.ai_match_score || 0);
      if (sortBy === "ai_asc") return (a.ai_match_score || 0) - (b.ai_match_score || 0);

      const dateA = new Date(a.submitted_at || Date.now()).getTime();
      const dateB = new Date(b.submitted_at || Date.now()).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

  if (loading) return <PageLoadingSkeleton />;

  return (
    <div className="min-h-screen w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 bg-[#faf9f6] text-[#0b1c30] relative flex flex-col font-sans">
      {/* Dynamic Synaptic Line Background Decorations */}
      <svg className="fixed inset-0 w-full h-full -z-10 opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M-100,200 Q400,100 800,400 T1600,200" fill="none" stroke="#004d40" strokeDasharray="10 5" strokeWidth="0.5" />
        <path d="M-100,800 Q600,900 1200,600 T1800,800" fill="none" stroke="#e28743" strokeDasharray="8 4" strokeWidth="0.5" />
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-panel { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .ai-glow { box-shadow: 0 0 15px rgba(226, 135, 67, 0.2); border: 1px solid rgba(226, 135, 67, 0.15); }
        .avatar-gradient { background: linear-gradient(135deg, #004d40 0%, #00342b 100%); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #bfc9c4; border-radius: 10px; }
      `}} />

      {selected && (
        <ReviewModal
          submission={selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* Breadcrumb Area */}
      <Breadcrumb
        items={[
          { label: "Panel", href: "/company/dashboard" },
          { label: "Görevlerim", href: "/company/tasks" },
          { label: task?.title || "Görev", href: `/company/tasks` },
          { label: "Başvurular", active: true },
        ]}
      />

      <MainSection hideHeader variant="transparent" bordered={false} padding="none">
        {/* Breadcrumbs & Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-[#00342b]">Başvuru Listesi</h1>
              <span className="bg-[#00342b]/10 text-[#00342b] px-3 py-0.5 rounded-full text-xs font-bold border border-[#00342b]/20">
                {filteredSubmissions.length}
              </span>
            </div>
            {task && (
              <Link
                href={`/company/tasks/${task.id}/details`}
                className="inline-flex items-center gap-1 text-xs text-[#00342b] underline underline-offset-2 hover:text-[#004d40] transition-colors mt-1.5 font-bold"
              >
                <FiExternalLink size={12} />
                Görev Detayları
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* AI Recommendation Button */}
            <button
              onClick={() => {
                /* TODO: open AI recommendation modal */
              }}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#e28743] to-[#f09653] text-white rounded-full font-bold text-xs hover:opacity-90 transition-all active:scale-95 cursor-pointer shadow-md shadow-[#e28743]/30 group/ai"
            >
              <FiZap className="w-3.5 h-3.5 fill-white text-white group-hover/ai:animate-pulse" />
              AI Önerilen Adaylar
            </button>

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-[#00342b] text-[#00342b] rounded-full font-bold text-xs hover:bg-[#00342b] hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <FiArrowLeft className="w-4 h-4" />
              Geri Dön
            </button>
          </div>
        </div>

        {/* Reusable, Bordered & Background-less Search Filter Bar */}
        <ApplicantsSearchFilter
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          minAiScore={minAiScore}
          onMinAiScoreChange={setMinAiScore}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onClearFilters={() => {
            setSearchQuery("");
            setStatusFilter("all");
            setMinAiScore("");
            setSortBy("ai_desc");
          }}
        />

        {/* Candidate Grid */}
        {filteredSubmissions.length === 0 ? (
          <div className="flex justify-center items-center py-16 bg-transparent">
            <EmptyState 
              icon={FiUser} 
              title="Başvuru Bulunamadı" 
              message={submissions.length === 0 ? "Henüz başvuru bulunmamaktadır." : "Filtrelere uygun başvuru bulunamadı."} 
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 relative">
            {filteredSubmissions.map((submission) => (
              <ApplicantCard
                key={submission.id}
                submission={submission}
                onClick={() => router.push(`/company/tasks/${task?.id}/applicants/${submission.id}`)}
              />
            ))}
          </div>
        )}
      </MainSection>
    </div>
  );
}
