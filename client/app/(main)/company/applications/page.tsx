"use client";

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import { FiFileText, FiCalendar, FiSearch, FiChevronDown, FiX, FiClock, FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle } from "react-icons/fi";
import Tabs from "@/components/ui/Tabs";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import FilterContainer from "@/components/ui/FilterContainer";
import { useLazyRender } from "@/hooks/useLazyRender";
import InfiniteScrollTrigger from "@/components/ui/InfiniteScrollTrigger";

interface ApplicationData {
  id: number;
  studentName: string;
  studentId: number;
  studentInitials: string;
  taskName: string;
  taskId: number;
  date: string;
  status: string;
  rawDate: string;
  submissionContent?: string | null;
  proposedBudget?: string | null;
  estimatedDeliveryDays?: number | null;
  aiMatchScore?: number | null;
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedApp, setSelectedApp] = useState<ApplicationData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const tasks = await taskService.getCompanyTasks();
        const allSubs = await Promise.all(
          tasks.map(async (t) => {
            const subs = await submissionService.getTaskSubmissions(t.id).catch(() => []);
            return subs.map((s) => ({
              id: s.id,
              studentName: s.student?.full_name || "Bilinmeyen Öğrenci",
              studentId: s.student_user_id,
              studentInitials: (s.student?.full_name || "B Ö")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              taskName: t.title,
              taskId: t.id,
              date: new Date(s.submitted_at).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              status: s.status || "pending",
              rawDate: s.submitted_at,
              submissionContent: s.submission_content,
              proposedBudget: s.proposed_budget,
              estimatedDeliveryDays: s.estimated_delivery_days,
              aiMatchScore: s.ai_match_score,
            }));
          })
        );
        setApplications(allSubs.flat());
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesTab = activeTab === "all" || app.status === activeTab;
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.taskName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    const tA = new Date(a.rawDate).getTime();
    const tB = new Date(b.rawDate).getTime();
    if (sortBy === "newest") return tB - tA;
    return tA - tB;
  });

  const { visibleItems: visibleApps, hasMore, loadMore } = useLazyRender(filteredApps, 10);

  const stats = {
    all: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'approved' || a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSortBy("newest");
    setActiveTab("all");
  };

  const handleUpdateStatus = async (status: "approved" | "rejected") => {
    if (!selectedApp) return;
    setActionLoading(true);
    try {
      await submissionService.updateSubmission(selectedApp.id, status);
      setApplications(prev => prev.map(app => app.id === selectedApp.id ? { ...app, status } : app));
      setSelectedApp({ ...selectedApp, status });
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Durum güncellenirken bir hata oluştu.");
    } finally {
      setActionLoading(false);
    }
  };


  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">


      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "all", label: `Tümü (${stats.all})` },
          { id: "pending", label: `Bekleyenler (${stats.pending})` },
          { id: "approved", label: `Kabul Edilenler (${stats.accepted})` },
          { id: "rejected", label: `Reddedilenler (${stats.rejected})` },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Filter Bar following ApplicantsSearchFilter design */}
      <FilterContainer>
        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
          <Input
            type="text"
            placeholder="Başvuru Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2.5 text-xs font-semibold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Sort By Option Dropdown */}
          <div className="relative w-full sm:w-auto">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
            >
              <option value="newest">En Yeni Başvurular</option>
              <option value="oldest">En Eski Başvurular</option>
            </Select>
            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
          </div>
        </div>

        {/* Clear Filters Action Button */}
        <div className="lg:ml-auto w-full lg:w-auto flex justify-end shrink-0">
          <button 
            onClick={handleClearFilters}
            className="w-full lg:w-auto bg-transparent border-0 outline-none text-[#565e74]/70 hover:text-[#00342b] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-2 px-1"
          >
            <FiX className="w-4 h-4 text-current" />
            Filtreleri Temizle
          </button>
        </div>
      </FilterContainer>

      {/* Applications List */}
      <section className="border border-[#dfded6] rounded-2xl divide-y divide-[#dfded6] relative bg-white/50 mt-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <FiLoader className="w-8 h-8 text-[#00342b] animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-20 text-[#565e74]">
            <FiAlertCircle className="w-8 h-8 text-red-400" />
            <p>Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>
          </div>
        ) : filteredApps.length > 0 ? (
          <>
            {visibleApps.map((app) => (
              <div key={app.id} onClick={() => setSelectedApp(app)} className="p-4 flex items-center group cursor-pointer bg-transparent border border-transparent hover:rounded-none hover-card-effect transition-colors">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full bg-[#00342b]/5 border border-[#dfded6] flex items-center justify-center text-[#00342b] font-bold text-sm shrink-0">
                    {app.studentInitials}
                  </div>
                  <div className="min-w-0 text-left">
                    <h4 className="text-[14px] tracking-[0.01em] font-medium leading-[20px] text-[#0b1c30] truncate">{app.studentName}</h4>
                    <p className="text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74] truncate">{app.taskName}</p>
                  </div>
                </div>
                
                <div className="hidden md:flex flex-1 justify-center shrink-0">
                  <div className="flex items-center gap-1 text-[#565e74] text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
                    <FiCalendar className="w-4 h-4 text-[#00342b]/60" />
                    <span>{app.date}</span>
                  </div>
                </div>
                
                <div className="flex flex-1 justify-end shrink-0">
                  <StatusBadge status={app.status} />
                </div>
              </div>
            ))}
            <InfiniteScrollTrigger onTrigger={loadMore} hasMore={hasMore} />
          </>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
              <FiFileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-[#0b1c30]">Başvuru Bulunamadı</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-sm">
              Seçili filtreye uygun öğrenci başvurusu bulunmamaktadır.
            </p>
          </div>
        )}
      </section>

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#dfded6]">
              <h2 className="text-xl font-bold text-[#0b1c30]">Başvuru Detayları</h2>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {/* Applicant Info */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-[#00342b]/5 border border-[#dfded6] flex items-center justify-center text-[#00342b] font-bold text-xl shrink-0">
                  {selectedApp.studentInitials}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30]">{selectedApp.studentName}</h3>
                  <p className="text-sm font-medium text-[#565e74]">{selectedApp.taskName}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <StatusBadge status={selectedApp.status} />
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <FiCalendar /> {selectedApp.date}
                    </span>
                  </div>
                </div>
                
                {selectedApp.aiMatchScore !== undefined && selectedApp.aiMatchScore !== null && (
                  <div className="ml-auto text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-green-500 flex items-center justify-center mx-auto">
                      <span className="font-bold text-sm text-green-600">{Math.round(selectedApp.aiMatchScore)}%</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-1 block">AI Uyumu</span>
                  </div>
                )}
              </div>

              {/* Application Content */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Başvuru Notu</h4>
                <div className="bg-[#fcfbf7] border border-[#dfded6] rounded-2xl p-5 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.submissionContent || "Not eklenmemiş."}
                </div>
              </div>

              {/* Offer Details (If provided) */}
              {(selectedApp.proposedBudget || selectedApp.estimatedDeliveryDays) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedApp.proposedBudget && (
                    <div className="bg-white border border-[#dfded6] rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teklif Edilen Bütçe</h4>
                      <p className="font-bold text-[#0b1c30]">{selectedApp.proposedBudget}</p>
                    </div>
                  )}
                  {selectedApp.estimatedDeliveryDays && (
                    <div className="bg-white border border-[#dfded6] rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Teslim Süresi</h4>
                      <p className="font-bold text-[#0b1c30]">{selectedApp.estimatedDeliveryDays} Gün</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-6 border-t border-[#dfded6] bg-gray-50 flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
              {selectedApp.status === "pending" ? (
                <>
                  <PrimaryButton
                    variant="outline"
                    className="w-full sm:w-auto px-6 text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                    onClick={() => handleUpdateStatus("rejected")}
                    isLoading={actionLoading}
                    icon={FiXCircle}
                  >
                    Reddet
                  </PrimaryButton>
                  <PrimaryButton
                    variant="primary"
                    className="w-full sm:w-auto px-8 bg-green-600 hover:bg-green-700 border-none shadow-lg shadow-green-600/20"
                    onClick={() => handleUpdateStatus("approved")}
                    isLoading={actionLoading}
                    icon={FiCheckCircle}
                  >
                    Kabul Et
                  </PrimaryButton>
                </>
              ) : (
                <div className="w-full text-center text-sm font-medium text-gray-500">
                  Bu başvuru değerlendirildi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}