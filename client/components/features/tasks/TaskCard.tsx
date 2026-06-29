"use client";

import { FiX } from "react-icons/fi";
import Link from "next/link";

type TaskCardProps = {
  id?: number;
  index: number;
  title: string;
  description: string | null;
  date: string;
  companyName: string;
  companyId?: number;
  rating: number;
  onRemove?: (id: number) => void;
};

export default function TaskCard({
  id,
  index,
  title,
  description,
  date,
  companyName,
  companyId,
  rating,
  onRemove,
}: TaskCardProps) {
  return (
    <div className="bg-white border border-[#dfded6] rounded-2xl p-6 hover:rounded-none relative group hover-card-effect transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
                <span className="text-gray-400 text-xs font-semibold">{date}</span>
           </div>
           <h3 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30] mb-2 group-hover:text-[#004d40] transition-colors line-clamp-1">{title}</h3>
        </div>

        <div className="relative">
          {onRemove && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRemove(id || index);
              }}
              className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-full text-gray-400 transition-colors cursor-pointer group/remove"
              title="Kaydı Kaldır"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      <p className="text-[#3f4945] text-[14px] font-medium leading-[22px] mb-6 line-clamp-2">
        {description ? description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : "Açıklama bulunmuyor."}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-[#dfded6]/50">
        <Link href={`/tasks/${id || index}`}>
          <button className="border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-2 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
            Detayları
          </button>
        </Link>
        
        <div className="flex items-center gap-4">
          {companyId ? (
            <Link
              href={`/companies/${companyId}`}
              className="hover:underline cursor-pointer"
            >
              <span className="text-gray-500 font-medium text-sm">
                {companyName}
              </span>
            </Link>
          ) : (
            <span className="text-gray-500 font-medium text-sm">{companyName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
