"use client";

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import { FiFileText, FiCalendar, FiSearch, FiChevronDown, FiX, FiClock, FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle } from "react-icons/fi";
import Tabs from "@/components/ui/Tabs";
import { taskService } from "@/services/task.service";
import { submissionService } from "@/services/submission.service";

interface ApplicationData {
  id: number;
  studentName: string;
  studentInitials: string;
  taskName: string;
  date: string;
  status: string;
  rawDate: string;
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
              studentInitials: (s.student?.full_name || "B Ö")
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              taskName: t.title,
              date: new Date(s.submitted_at).toLocaleDateString("tr-TR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }),
              status: s.status || "pending",
              rawDate: s.submitted_at,
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
      <div className="bg-transparent border border-[#dfded6] rounded-[50px] p-4 flex flex-col lg:flex-row items-center gap-4 select-none">
        {/* Search Input Box */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
          <input
            type="text"
            placeholder="Başvuru Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/50 border-[#bfc9c4]/50 border rounded-full pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none text-xs font-semibold text-[#3f465c] transition-all placeholder-gray-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Sort By Option Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full appearance-none bg-white/50 border-[#bfc9c4]/50 border rounded-full pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] outline-none cursor-pointer transition-all"
            >
              <option value="newest">En Yeni Başvurular</option>
              <option value="oldest">En Eski Başvurular</option>
            </select>
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
      </div>

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
          filteredApps.map((app) => (
            <div key={app.id} className="p-4 flex items-center group cursor-pointer bg-transparent border border-transparent hover:rounded-none hover-card-effect">
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
          ))
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
    </div>
  );
}
