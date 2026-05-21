"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiEdit, FiTrash2, FiUsers, FiEye } from "react-icons/fi";
import { cn } from "@/utils/cn";

type CompanyTaskCardProps = {
  title: string;
  description: string;
  date: string;
  status: "Open" | "In Progress" | "Completed" | "Review";
  applicantCount?: number;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewApplicants?: () => void;
  onViewDetails?: () => void;
};

export default function CompanyTaskCard({
  title,
  description,
  date,
  status,
  applicantCount = 0,
  onEdit,
  onDelete,
  onViewApplicants,
  onViewDetails,
}: CompanyTaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const statusConfig: Record<string, { label: string; cls: string; hasDot?: boolean; dotCls?: string }> = {
    Open: { label: "Açık", cls: "bg-[#065043]/10 text-[#065043]", hasDot: true, dotCls: "bg-[#065043]" },
    "In Progress": { label: "Devam ediyor", cls: "bg-[#004d40]/10 text-[#004d40]", hasDot: true, dotCls: "bg-[#004d40]" },
    Completed: { label: "Tamamlandı", cls: "bg-[#3f4945]/15 text-[#3f4945]" },
    Review: { label: "İnceleniyor", cls: "bg-[#e28743]/10 text-[#e28743]", hasDot: true, dotCls: "bg-[#e28743] animate-pulse" },
  };

  const currentStatus = statusConfig[status] || statusConfig.Open;

  return (
    <div className="bg-transparent border border-[#dfded6] rounded-2xl p-6 transition-all duration-300 ease-out relative hover:scale-[1.02] hover:bg-white hover:bg-gradient-to-br hover:from-[#004d40]/[0.045] hover:to-[#ffd54f]/[0.075] hover:border-[#004d40]/50 hover:rounded-none hover:shadow-md hover:z-10 group">
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
                <span className={cn("px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-[0.05em] leading-[16px] shrink-0 inline-flex items-center gap-1.5", currentStatus.cls)}>
                  {currentStatus.hasDot && (
                    <span className={cn("w-1.5 h-1.5 rounded-full", currentStatus.dotCls)} />
                  )}
                  {currentStatus.label}
                </span>
                <span className="text-gray-400 text-xs font-semibold">{date}</span>
           </div>
           <h3 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30] mb-2 group-hover:text-[#004d40] transition-colors line-clamp-1">{title}</h3>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors cursor-pointer"
          >
            <FiMoreVertical size={20} className="text-[#004d40]" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-xl shadow-md border border-[#dfded6] z-15 py-1">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                onClick={() => { setIsMenuOpen(false); onEdit?.(); }}
              >
                <FiEdit size={16} className="text-[#004d40]" />
                <span>Düzenle</span>
              </button>
               <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                onClick={() => { setIsMenuOpen(false); onViewApplicants?.(); }}
              >
                <FiUsers size={16} className="text-[#004d40]" />
                <span>Başvuruları Gör</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                onClick={() => { setIsMenuOpen(false); onDelete?.(); }}
              >
                <FiTrash2 size={16} className="text-red-600" />
                <span>Sil</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[#565e74] text-[14px] leading-[20px] font-medium line-clamp-2 mb-4">
        {description ? description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : "Açıklama bulunmuyor."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-[#dfded6]">
        <div className="flex items-center gap-2 text-[12px] tracking-[0.05em] font-semibold leading-[16px] text-[#565e74]">
            <FiUsers className="w-[18px] h-[18px] text-[#004d40]/60" />
            <span>{applicantCount} Başvuru</span>
        </div>
        <button 
          onClick={onViewDetails}
          className="text-[#00342b] text-[14px] font-semibold tracking-[0.01em] hover:underline flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FiEye className="w-[18px] h-[18px] text-[#004d40]/80" /> Detaylar
        </button>
      </div>
    </div>
  );
}