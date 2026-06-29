"use client";

import React from "react";
import { cn } from "@/utils/cn";
import { FiCheck } from "react-icons/fi";

export interface StepItem {
  id: number | string;
  title: string;
  description?: string;
  status?: "completed" | "active" | "inactive";
}

interface StepsTrackerProps {
  steps: StepItem[];
  currentStepId?: number | string;
  layout?: "horizontal" | "inline" | "vertical";
  className?: string;
}

export default function StepsTracker({
  steps,
  currentStepId,
  layout = "horizontal",
  className,
}: StepsTrackerProps) {
  // Derive status (completed, active, inactive) if not explicitly set
  const stepStates = steps.map((step, index) => {
    let isCompleted = false;
    let isActive = false;
    let isInactive = true;

    if (step.status) {
      isCompleted = step.status === "completed";
      isActive = step.status === "active";
      isInactive = step.status === "inactive";
    } else if (currentStepId !== undefined) {
      const activeIndex = steps.findIndex((s) => s.id === currentStepId);
      if (activeIndex !== -1) {
        if (index < activeIndex) {
          isCompleted = true;
          isInactive = false;
        } else if (index === activeIndex) {
          isActive = true;
          isInactive = false;
        } else {
          isInactive = true;
        }
      }
    }

    return {
      ...step,
      isCompleted,
      isActive,
      isInactive,
    };
  });

  if (layout === "vertical") {
    return (
      <div className={cn("flex flex-col select-none", className)}>
        {stepStates.map((step, index) => {
          const isLast = index === stepStates.length - 1;
          const isSegmentCompleted = step.isCompleted && (stepStates[index + 1]?.isCompleted || stepStates[index + 1]?.isActive);

          return (
            <div key={step.id} className="flex flex-col">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 z-10 shrink-0",
                    step.isActive && "bg-[#e28743] text-white shadow-sm scale-105",
                    step.isCompleted && "bg-[#00342b] text-white shadow-sm",
                    step.isInactive && "bg-[#e9e8e2] text-gray-500 border border-[#dfded6]"
                  )}
                >
                  {step.isCompleted ? <FiCheck size={16} className="stroke-[3]" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-[13px] transition-colors duration-300 font-semibold",
                    step.isActive && "text-[#e28743]",
                    step.isCompleted && "text-[#00342b]",
                    step.isInactive && "text-gray-400 font-medium"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "ml-[15px] w-[2px] h-6 my-1 transition-all duration-500 rounded-full",
                    isSegmentCompleted ? "bg-[#00342b]" : "bg-[#DFDED6]"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (layout === "inline") {
    return (
      <div className={cn("flex items-center w-fit select-none", className)}>
        {stepStates.map((step, index) => {
          const isLast = index === stepStates.length - 1;
          const isSegmentCompleted = step.isCompleted && (stepStates[index + 1]?.isCompleted || stepStates[index + 1]?.isActive);

          return (
            <React.Fragment key={step.id}>
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300",
                    step.isActive && "bg-[#e28743] text-white shadow-sm scale-105",
                    step.isCompleted && "bg-[#00342b] text-white shadow-sm",
                    step.isInactive && "bg-gray-200 text-gray-500 border border-gray-300/30"
                  )}
                >
                  {step.isCompleted ? <FiCheck size={12} className="stroke-[3]" /> : index + 1}
                </div>
                <span
                  className={cn(
                    "text-xs transition-colors duration-300",
                    step.isActive && "text-[#e28743] font-bold",
                    step.isCompleted && "text-[#00342b] font-semibold",
                    step.isInactive && "text-gray-400 font-medium"
                  )}
                >
                  {step.title}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-[2px] w-12 mx-3 transition-all duration-500 rounded-full",
                    isSegmentCompleted ? "bg-[#00342b]" : "bg-[#DFDED6]"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Default: Horizontal Layout
  const activeIndex = stepStates.findIndex((s) => s.isActive);
  const lastCompletedIndex = stepStates.map((s, i) => (s.isCompleted ? i : -1)).reduce((a, b) => Math.max(a, b), -1);
  const progressIndex = activeIndex !== -1 ? activeIndex : lastCompletedIndex !== -1 ? lastCompletedIndex : 0;
  const progressPercentage = stepStates.length > 1 ? (progressIndex / (stepStates.length - 1)) * 100 : 0;

  return (
    <div className={cn("flex items-center justify-between w-full relative px-2 md:px-8 select-none", className)}>
      {/* Background Connecting Line */}
      <div className="absolute left-[28px] right-[28px] md:left-[52px] md:right-[52px] top-5 -translate-y-1/2 h-[2px] bg-[#dfded6] rounded-full z-0">
        <div
          className="absolute left-0 top-0 h-full bg-[#e28743] rounded-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {stepStates.map((step, index) => {
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm border-2",
                step.isActive && "bg-[#004d40] text-white border-[#004d40] scale-110",
                step.isCompleted && "bg-[#e28743] text-white border-[#e28743]",
                step.isInactive && "bg-[#faf9f6] text-gray-400 border-[#dfded6]"
              )}
            >
              {step.isCompleted ? <FiCheck size={18} className="stroke-[3]" /> : index + 1}
            </div>
            <span
              className={cn(
                "text-xs md:text-[13px] absolute -bottom-8 whitespace-nowrap transition-colors duration-300",
                step.isActive && "text-[#00342b] font-bold",
                step.isCompleted && "text-[#0b1c30] font-semibold",
                step.isInactive && "text-gray-400/80 font-medium"
              )}
            >
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
