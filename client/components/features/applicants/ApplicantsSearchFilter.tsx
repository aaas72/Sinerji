"use client";

import { FiSearch, FiChevronDown, FiX } from "react-icons/fi";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

interface ApplicantsSearchFilterProps {
  searchQuery: string;
  onSearchQueryChange: (val: string) => void;
  statusFilter: "all" | "pending" | "approved" | "rejected";
  onStatusFilterChange: (val: "all" | "pending" | "approved" | "rejected") => void;
  minAiScore: string;
  onMinAiScoreChange: (val: string) => void;
  sortBy: "ai_desc" | "ai_asc" | "newest" | "oldest";
  onSortByChange: (val: "ai_desc" | "ai_asc" | "newest" | "oldest") => void;
  onClearFilters: () => void;
}

export default function ApplicantsSearchFilter({
  searchQuery,
  onSearchQueryChange,
  statusFilter,
  onStatusFilterChange,
  minAiScore,
  onMinAiScoreChange,
  sortBy,
  onSortByChange,
  onClearFilters,
}: ApplicantsSearchFilterProps) {
  return (
    <div className="bg-[#F1F0EA] border border-[#dfded6] rounded-[50px] p-4 mb-8 flex flex-col lg:flex-row items-center gap-4 select-none">
      {/* Search Input Box */}
      <div className="relative w-full lg:w-80">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#565e74] w-4 h-4" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder="Adaylarda ara..."
          className="pl-10 pr-4 py-2.5 text-xs font-semibold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] placeholder-gray-400"
        />
      </div>

      {/* Filter and Sort Selection Row */}
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        {/* Status Filter Dropdown */}
        <div className="relative w-full sm:w-auto">
          <Select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as "all" | "pending" | "approved" | "rejected")}
            className="pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="pending">Bekleyenler</option>
            <option value="approved">Onaylananlar</option>
            <option value="rejected">Reddedilenler</option>
          </Select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
        </div>

        {/* Minimum AI Score Input */}
        <div className="relative w-full sm:w-auto">
          <Input
            type="number"
            min={0}
            max={100}
            value={minAiScore}
            onChange={(e) => onMinAiScoreChange(e.target.value)}
            placeholder="Min. AI Skor (%)"
            className="px-5 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b] placeholder-gray-450"
          />
        </div>

        {/* Sort By Option Dropdown */}
        <div className="relative w-full sm:w-auto">
          <Select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as "ai_desc" | "ai_asc" | "newest" | "oldest")}
            className="pl-5 pr-10 py-2.5 text-xs font-bold text-[#3f465c] bg-white border-[#bfc9c4]/50 focus:ring-2 focus:ring-[#00342b]/20 focus:border-[#00342b]"
          >
            <option value="ai_desc">AI Skoru (Yüksekten Düşüğe)</option>
            <option value="ai_asc">AI Skoru (Düşükten Yükseğe)</option>
            <option value="newest">En Yeni Başvurular</option>
            <option value="oldest">En Eski Başvurular</option>
          </Select>
          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#565e74] w-4 h-4" />
        </div>
      </div>

      {/* Clear Filters Action Button */}
      <div className="lg:ml-auto w-full lg:w-auto flex justify-end shrink-0">
        <button
          onClick={onClearFilters}
          className="w-full lg:w-auto bg-transparent border-0 outline-none text-[#565e74]/70 hover:text-[#00342b] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 py-2 px-1"
        >
          <FiX className="w-4 h-4 text-current" />
          Filtreleri Temizle
        </button>
      </div>
    </div>
  );
}
