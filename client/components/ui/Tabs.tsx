"use client";
import React from "react";
import { cn } from "@/utils/cn";

type TabItem = { id: string; label: string };

type TabsProps = {
  tabs: string[] | TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  rightAction?: React.ReactNode;
};

export default function Tabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  rightAction,
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 w-full",
        className
      )}
    >
      <div className="flex bg-[#F1F0EA] p-1 rounded-full border border-[#DFDED6] overflow-x-auto scrollbar-hide self-start">
        {tabs.map((tab) => {
          const isString = typeof tab === "string";
          const id = isString ? tab : tab.id;
          const label = isString ? tab : tab.label;

          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold transition-all rounded-full whitespace-nowrap",
                activeTab === id
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
      {rightAction && <div className="ml-auto md:ml-0 md:pl-4">{rightAction}</div>}
    </div>
  );
}
