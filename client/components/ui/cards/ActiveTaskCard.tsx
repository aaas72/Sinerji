import Link from "next/link";
import { FiUsers, FiClock, FiArrowRight } from "react-icons/fi";
import StatusBadge from "@/components/ui/badges/StatusBadge";

interface ActiveTaskCardProps {
  id: number;
  title: string;
  submissionsCount: number;
  createdAt: string;
  status?: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ActiveTaskCard({
  id,
  title,
  submissionsCount,
  createdAt,
  status,
}: ActiveTaskCardProps) {
  const isActive = status === 'open';

  return (
    <Link href={`/company/tasks/${id}/details`} className="block group">
      <div className="p-5 hover:rounded-none cursor-pointer bg-transparent relative border border-transparent flex flex-col justify-between gap-3 h-full hover-card-effect">
        
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold leading-[22px] text-[#0b1c30] group-hover:text-[#004d40] transition-colors line-clamp-2">
            {title}
          </h3>
          <FiArrowRight className="text-[#00342b]/40 group-hover:text-[#00342b] shrink-0 transition-colors w-4 h-4 mt-1" />
        </div>
        
        <div className="flex items-center justify-between w-full mt-2">
          <div className="flex items-center gap-4 text-[#565e74]">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold">
              <FiUsers className="w-3.5 h-3.5" />
              <span>{submissionsCount} başvuru</span>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold">
              <FiClock className="w-3.5 h-3.5" />
              <span>{formatDate(createdAt)}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <StatusBadge status={status || 'open'} />
          </div>
        </div>

      </div>
    </Link>
  );
}
