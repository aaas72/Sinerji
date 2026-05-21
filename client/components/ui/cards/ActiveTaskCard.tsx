import Link from "next/link";
import { FiUsers, FiClock } from "react-icons/fi";

interface ActiveTaskCardProps {
  id: number;
  title: string;
  submissionsCount: number;
  createdAt: string;
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
}: ActiveTaskCardProps) {
  const progressWidth = Math.min(100, Math.max(15, (submissionsCount / 10) * 100));

  return (
    <Link href={`/company/tasks/${id}/details`} className="block group">
      <div className="p-6 transition-all duration-300 ease-out cursor-pointer hover:z-10 hover:bg-white hover:scale-[1.02] bg-transparent relative border border-transparent hover:border-[#004d40] hover:rounded-2xl">
        <h3 className="text-[20px] font-semibold leading-[28px] text-[#0b1c30] mb-2 group-hover:text-[#004d40] transition-colors line-clamp-1">
          {title}
        </h3>
        <div className="flex items-center gap-6 text-[#565e74] mb-4">
          <div className="flex items-center gap-1 text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
            <FiUsers className="w-[18px] h-[18px]" />
            <span>{submissionsCount} başvuru</span>
          </div>
          <div className="flex items-center gap-1 text-[12px] tracking-[0.05em] font-semibold leading-[16px]">
            <FiClock className="w-[18px] h-[18px]" />
            <span>{formatDate(createdAt)}</span>
          </div>
        </div>
        {/* Progress Bar represents the student application/submission rate */}
        <div className="w-full bg-[#dce9ff] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#00342b] h-full transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
