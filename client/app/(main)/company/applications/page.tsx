"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import StatusBadge from "@/components/ui/badges/StatusBadge";
import { FiFileText, FiCalendar, FiSearch, FiChevronDown, FiX, FiClock, FiCheckCircle, FiXCircle } from "react-icons/fi";

// Mock Data for Applications
const MOCK_APPLICATIONS = [
  {
    id: 1,
    studentName: "Ahmet Yılmaz",
    studentInitials: "AY",
    taskName: "Frontend Developer Stajyeri",
    date: "12 Mayıs 2026",
    status: "pending",
  },
  {
    id: 2,
    studentName: "Ayşe Kaya",
    studentInitials: "AK",
    taskName: "Grafik Tasarım Projesi",
    date: "10 Mayıs 2026",
    status: "accepted",
  },
  {
    id: 3,
    studentName: "Mehmet Demir",
    studentInitials: "MD",
    taskName: "Sosyal Medya Yönetimi",
    date: "08 Mayıs 2026",
    status: "rejected",
  },
  {
    id: 4,
    studentName: "Zeynep Çelik",
    studentInitials: "ZÇ",
    taskName: "Frontend Developer Stajyeri",
    date: "07 Mayıs 2026",
    status: "pending",
  },
];

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredApps = MOCK_APPLICATIONS.filter((app) => {
    const matchesTab = activeTab === "all" || app.status === activeTab;
    const matchesSearch = app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.taskName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === "newest") return b.id - a.id;
    return a.id - b.id;
  });

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
          { id: "all", label: "Tümü (4)" },
          { id: "pending", label: "Bekleyenler (2)" },
          { id: "accepted", label: "Kabul Edilenler (1)" },
          { id: "rejected", label: "Reddedilenler (1)" },
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
      <div className="border border-[#dfded6] rounded-2xl divide-y divide-[#dfded6] relative bg-transparent mt-4">
        {filteredApps.length > 0 ? (
          filteredApps.map((app) => (
            <div key={app.id} className="p-4 flex items-center group transition-all duration-300 ease-out cursor-pointer hover:z-10 hover:scale-[1.02] bg-transparent border border-transparent hover:border-[#00342b]/50 hover:rounded-none hover:shadow-md hover:bg-white hover:bg-gradient-to-br hover:from-[#00342b]/[0.045] hover:to-[#ffd54f]/[0.075]">
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
      </div>
    </div>
  );
}
