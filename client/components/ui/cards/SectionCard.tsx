import React from "react";

export interface SectionCardProps {
  icon: React.ElementType;
  title: React.ReactNode;
  description?: string;
  accent?: boolean;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({
  icon: Icon,
  title,
  description,
  accent = false,
  rightAction,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`rounded-2xl border ${accent ? 'border-red-200 bg-red-50/10' : 'border-[#DFDED6] bg-[#F1F0EA]'} p-6 md:p-8 transition-all duration-300 ${className}`}>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Icon className={accent ? "text-red-600" : "text-[#004d40]"} size={24} />
          <h3 className={`text-xl font-bold tracking-tight break-words ${accent ? "text-red-700" : "text-[#00342b]"}`}>
            {title}
          </h3>
        </div>
        {rightAction && <div>{rightAction}</div>}
      </div>
      {description && (
        <p className={`text-sm mb-6 ${accent ? "text-red-400" : "text-gray-500 font-medium"}`}>
          {description}
        </p>
      )}
      <div className="text-[#565e74] bg-transparent">{children}</div>
    </div>
  );
}
