"use client";

import { cn } from "@/utils/cn";
import SkillBadge from "@/components/ui/SkillBadge";
import { FiBookmark, FiZap } from "react-icons/fi";
import { Task, getRewardIcon } from "./types";

interface TaskBrowsingCardProps {
  task: Task;
  selected?: boolean;
  onClick?: () => void;
}

export default function TaskBrowsingCard({
  task,
  selected,
  onClick,
}: TaskBrowsingCardProps) {
  const hasMatchPercentage = typeof task.matchPercentage === "number";

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer border rounded-2xl p-5 transition-all duration-300 relative select-none group",
        selected
          ? "active-card border-[#004d40] shadow-lg !rounded-none scale-[1.02] bg-white bg-gradient-to-br from-[#004d40]/12 via-transparent to-[#e28743]/15 z-10 relative"
          : "bg-transparent border-[#dfded6] hover:shadow-md hover:border-[#004d40]/30"
      )}
    >

      {/* Bookmark icon absolute top right */}
      <button 
        className="absolute top-4 right-4 text-gray-300 hover:text-emerald-700 transition-colors z-30"
        onClick={(e) => {
          e.stopPropagation();
          // handle bookmark logic
        }}
      >
        <FiBookmark size={18} />
      </button>

      <div className="flex items-start justify-between gap-4">
        {/* Company Avatar & Info */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
            <span className="text-[10px] font-bold text-gray-400">
              {task.company.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className={cn(
              "font-bold text-base leading-snug mb-1 pr-6 transition-colors truncate",
              selected ? "text-[#004d40]" : "text-gray-900 hover:text-[#004d40]"
            )}>
              {task.title}
            </h3>
            <p className="text-xs text-gray-500 font-medium truncate mb-1">
              {task.company.name}
            </p>
            
            {/* Meta info icons (payments, rewards) */}
            <div className="flex items-center gap-2 mt-1.5">
              {(() => {
                const RewardIcon = getRewardIcon(task.rewardType);
                if (!task.rewardType) return null;
                return (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-200 text-[#29695b] bg-gray-50 shadow-xs" title={task.rewardType}>
                    <RewardIcon className="w-3 h-3" />
                  </span>
                );
              })()}
              {task.location && (
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded">
                  {task.location}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI Match Indicator */}
        {hasMatchPercentage && (
          <div className="flex items-center bg-[#e28743]/10 text-[#e28743] px-2.5 py-1 rounded-full font-bold text-[10px] shrink-0 self-start shadow-xs transition-transform duration-300">
            <FiZap className="w-3 h-3 mr-1 fill-current animate-pulse" />
            %{task.matchPercentage} Eşleşme
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4 pt-1">
          {task.tags.slice(0, 3).map((t, i) => (
            <SkillBadge 
              key={i} 
              label={t} 
              className="text-[10px] px-2 py-0.5 border border-gray-100 bg-gray-50 text-gray-600 font-medium rounded-full" 
            />
          ))}
          {task.tags.length > 3 && (
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full self-center">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

