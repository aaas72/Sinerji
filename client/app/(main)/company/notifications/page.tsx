"use client";

import { FiBell } from "react-icons/fi";

export default function NotificationsPage() {
  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">
      
      {/* ── Page Header ── */}
      <header className="relative overflow-hidden rounded-xl border border-[#f1f0ea] bg-white p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff4ff] to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40] shrink-0">
            <FiBell className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-[28px] md:text-[36px] font-extrabold leading-tight text-[#00342b] font-heading">
              Bildirimler
            </h1>
            <p className="text-sm text-[#565e74] font-medium mt-0.5">
              Şirketinizle ilgili en son aktiviteler ve güncellemeler
            </p>
          </div>
        </div>
      </header>

      {/* ── Content Card ── */}
      <div className="bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-[#004d40]/5 rounded-2xl flex items-center justify-center text-[#004d40] mb-4">
          <FiBell className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          Henüz Bildirim Yok
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Şirketiniz veya eklediğiniz görevlerle ilgili yeni bir gelişme olduğunda burada görünecektir.
        </p>
      </div>

    </div>
  );
}
