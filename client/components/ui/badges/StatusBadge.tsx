import React from "react";
import {
  FiPlayCircle,
  FiStopCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUserCheck,
} from "react-icons/fi";

interface StatusBadgeProps {
  status?: string | null;
  customLabel?: string;
}

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const map: Record<string, { label: string; icon: any }> = {
    open: { label: "Aktif", icon: FiPlayCircle },
    aktif: { label: "Aktif", icon: FiPlayCircle },
    closed: { label: "Kapalı", icon: FiStopCircle },
    kapalı: { label: "Kapalı", icon: FiStopCircle },
    pending: { label: "Bekliyor", icon: FiClock },
    bekliyor: { label: "Bekliyor", icon: FiClock },
    accepted: { label: "Kabul Edildi", icon: FiCheckCircle },
    "kabul edildi": { label: "Kabul Edildi", icon: FiCheckCircle },
    rejected: { label: "Reddedildi", icon: FiXCircle },
    reddedildi: { label: "Reddedildi", icon: FiXCircle },
    hired: { label: "İşe Alındı", icon: FiUserCheck },
    "işe alındı": { label: "İşe Alındı", icon: FiUserCheck },
    approved: { label: "Onaylandı", icon: FiCheckCircle },
    onaylandı: { label: "Onaylandı", icon: FiCheckCircle },
    "i̇nceleniyor": { label: "İnceleniyor", icon: FiClock },
    inceleniyor: { label: "İnceleniyor", icon: FiClock },
    offered: { label: "Teklif Alındı", icon: FiUserCheck },
    "teklif alındı": { label: "Teklif Alındı", icon: FiUserCheck },
    submitted: { label: "İnceleniyor", icon: FiClock },
    reviewed: { label: "Tamamlandı", icon: FiCheckCircle },
    "devam ediyor": { label: "Devam Ediyor", icon: FiPlayCircle },
  };

  const normalizedStatus = status?.toLowerCase() || "pending";
  // Check if it exists in the map; if not, default to "Bekliyor" or use the raw string.
  const cfg = map[normalizedStatus] ?? { label: status || "Bekliyor", icon: FiClock };
  const Icon = cfg.icon;
  const finalLabel = customLabel || cfg.label;

  return (
    <div className="relative group/badge inline-flex items-center justify-center p-2 rounded-full hover:bg-gray-100 transition-colors cursor-help">
      <Icon className="w-[18px] h-[18px] text-[#00342b]" />

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-[#004d40] text-white text-[12px] font-bold rounded-lg opacity-0 invisible group-hover/badge:opacity-100 group-hover/badge:visible transition-all whitespace-nowrap z-50 shadow-lg">
        {finalLabel}
        {/* Down Arrow (Triangle) */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-[#004d40]"></div>
      </div>
    </div>
  );
}

