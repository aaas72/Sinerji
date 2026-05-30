import React from "react";
import { FiBriefcase } from "react-icons/fi";
import StatusBadge from "@/components/ui/badges/StatusBadge";

type CompanyApplicationCardProps = {
  studentName: string;
  studentEmail: string;
  taskTitle: string;
  status: string;
  onClick?: () => void;
};

export default function CompanyApplicationCard({
  studentName,
  studentEmail,
  taskTitle,
  status,
  onClick,
}: CompanyApplicationCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`group flex flex-col p-5 rounded-2xl border border-[#f1f0ea] bg-white hover-card-effect ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004d40] to-[#00342b] flex items-center justify-center text-white text-sm font-black shrink-0">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{studentName}</p>
            <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{studentEmail}</p>
          </div>
        </div>
        <div className="shrink-0 -mr-2">
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="pt-3 border-t border-gray-100 mt-auto">
        <p className="text-xs text-gray-600 font-medium truncate flex items-center gap-2">
          <FiBriefcase className="text-[#e28743]" size={12} /> {taskTitle}
        </p>
      </div>
    </div>
  );
}
