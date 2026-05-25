import PrimaryButton from "@/components/ui/PrimaryButton";
import { FiBriefcase, FiMapPin, FiStar, FiUserPlus } from "react-icons/fi";

export interface CompanyExploreType {
  id: number | string;
  name: string;
  initials: string;
  industry: string;
  location: string;
  openTasks: number;
  rating: number;
  logo_url?: string;
}

interface CompanyExploreCardProps {
  company: CompanyExploreType;
  className?: string;
  variant?: "default" | "glass";
  onClick?: () => void;
}

export default function CompanyExploreCard({ company, className = "", variant = "default", onClick }: CompanyExploreCardProps) {
  const isGlass = variant === "glass";

  return (
    <div 
      onClick={onClick}
      className={`rounded-3xl p-6 relative group flex flex-col h-full ${onClick ? 'cursor-pointer' : ''} 
      ${isGlass 
        ? "transition-all duration-300 ease-out bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/15 shadow-[0_8px_30px_rgb(0,0,0,0.12)]" 
        : "bg-white border border-[#dfded6] hover-card-effect"
      } ${className}`}>
      
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shrink-0 transition-colors overflow-hidden
          ${isGlass ? "bg-white/20 text-white border border-white/10" : "bg-slate-100 border border-slate-200 text-slate-600 group-hover:border-primary/30"}`}>
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
          ) : (
            company.initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-bold truncate ${isGlass ? "text-white" : "text-[#0b1c30]"}`}>{company.name}</h3>
          <p className={`text-xs font-medium truncate mt-0.5 ${isGlass ? "text-white/70" : "text-gray-500"}`}>{company.industry}</p>
        </div>
      </div>

      <div className={`space-y-2 mb-6 text-sm ${isGlass ? "text-white/80" : "text-[#565e74]"}`}>
        <div className="flex items-center gap-2">
          <FiMapPin className={`w-4 h-4 shrink-0 ${isGlass ? "text-white/70" : "text-[#00342b]/60"}`} />
          <span className="truncate font-medium">{company.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiBriefcase className={`w-4 h-4 shrink-0 ${isGlass ? "text-white/70" : "text-[#00342b]/60"}`} />
          <span className="truncate font-medium">{company.openTasks} Açık İlan</span>
        </div>
        <div className="flex items-center gap-2">
          <FiStar className={`w-4 h-4 shrink-0 ${isGlass ? "text-white/70" : "text-[#00342b]/60"}`} />
          <span className="truncate font-medium">{company.rating}/5 Değerlendirme</span>
        </div>
      </div>

      <div className={`mt-auto pt-4 border-t flex items-center gap-3 ${isGlass ? "border-white/20" : "border-[#dfded6]/50"}`}>
        <PrimaryButton 
          className={`w-full rounded-full py-2 ${isGlass ? "!bg-white !text-[#00342b] hover:!bg-white/90" : ""}`}
          onClick={(e) => {
             e.stopPropagation();
          }}
        >
          Profili İncele
        </PrimaryButton>
      </div>
    </div>
  );
}
