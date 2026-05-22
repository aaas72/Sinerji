import React from "react";
import Link from "next/link";
import { FiClock, FiPlus } from "react-icons/fi";

interface CompanyWelcomeHeroProps {
  companyName: string;
  lastUpdatedText?: string;
  children?: React.ReactNode;
}

export default function CompanyWelcomeHero({
  companyName,
  lastUpdatedText = "Son güncelleme: 21 Mayıs 2026",
  children,
}: CompanyWelcomeHeroProps) {
  return (
    <section className="mb-16 p-8 rounded-[24px] relative overflow-hidden bg-gradient-to-br from-[#004d40] to-[#0f172a] text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#e28743] opacity-10 blur-3xl rounded-full -mr-20 -mt-20"></div>
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-[32px] tracking-[-0.01em] font-semibold leading-[40px] mb-1">
            Hoş Geldiniz, {companyName}
          </h1>
          <p className="text-[16px] font-normal leading-[24px] text-[#94d3c1]">
            Manage your job postings, student applications, and recruitment pipelines.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.05em] font-semibold leading-[16px] opacity-80">
            <FiClock className="w-4 h-4" />
            <span>{lastUpdatedText}</span>
          </div>
        </div>
        <Link href="/company/tasks/new" className="shrink-0 self-start md:self-center mt-4 md:mt-0">
          <button className="bg-[#afefdd] hover:bg-[#94d3c1] text-[#00201a] px-6 py-4 rounded-full text-[14px] tracking-[0.01em] font-medium leading-[20px] flex items-center gap-2 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer">
            <FiPlus className="w-4 h-4" />
            Yeni Görev Oluştur
          </button>
        </Link>
      </div>
      {children && (
        <div className="relative z-10 mt-10">
          {children}
        </div>
      )}
    </section>
  );
}
