"use client";

import { useState, useRef, useEffect } from "react";
import { FiMoreVertical, FiTrash2, FiEye } from "react-icons/fi";
import StarRating from "../StarRating";
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
}: TaskCardProps) {
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

  return (
    <div className="bg-transparent border border-[#dfded6] rounded-2xl p-6 hover:rounded-none relative group hover-card-effect transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
           <div className="flex items-center gap-3 mb-2">
                <span className="px-4 py-1.5 rounded-full text-[12px] font-semibold tracking-[0.05em] leading-[16px] shrink-0 inline-flex items-center gap-1.5 bg-[#004d40]/10 text-[#004d40]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#004d40]" />
                  Fırsat
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
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                <FiEye size={16} className="text-[#004d40]" />
                <span>Görüntüle</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                className="w-full text-left px-4 py-2.5 text-sm text-red-650 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  console.log("Unsave clicked");
                }}
              >
                <FiTrash2 size={16} className="text-red-600" />
                <span>Kaydı Kaldır</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-[#3f4945] text-[15px] font-medium leading-[24px] mb-6 line-clamp-2">
        {description ? description.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ') : "Açıklama bulunmuyor."}
      </p>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-[#dfded6]/50">
        <Link href={`/tasks/${id || index}`}>
          <button className="border border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-500 px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer">
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
          <StarRating rating={rating} />
        </div>
      </div>
    </div>
  );
}
