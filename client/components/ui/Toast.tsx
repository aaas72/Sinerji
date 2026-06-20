"use client";

import { useEffect, useState, ReactNode } from "react";
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo } from "react-icons/fi";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string | ReactNode;
  type: ToastType;
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for exit animation to finish before calling onClose
      setTimeout(onClose, 300);
    }, 4500); // 4.5 seconds for all toasts

    return () => clearTimeout(timer);
  }, [type, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 transform ${
        isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"
      }`}
    >
      <div
        className={`flex items-center gap-3.5 px-6 py-4.5 rounded-2xl shadow-lg border backdrop-blur-xl transition-all ${
          type === "success"
            ? "bg-white/70 border-[#004d40]/25 text-[#00342b] shadow-[#004d40]/5"
            : type === "error"
            ? "bg-white/70 border-red-200/50 text-red-800 shadow-red-500/5"
            : type === "warning"
            ? "bg-white/70 border-[#e28743]/35 text-[#00342b] shadow-[#e28743]/5"
            : "bg-white/70 border-blue-200/50 text-blue-800 shadow-blue-500/5"
        } cursor-pointer min-w-[340px] max-w-[420px] select-none`}
        onClick={type !== "success" ? handleClose : undefined}
      >
        <div className="shrink-0 flex items-center justify-center">
          {type === "success" ? (
            <FiCheckCircle size={22} className="text-[#004d40]" />
          ) : type === "error" ? (
            <FiAlertCircle size={22} className="text-red-650" />
          ) : type === "warning" ? (
            <FiAlertCircle size={22} className="text-[#e28743]" />
          ) : (
            <FiInfo size={22} className="text-blue-600" />
          )}
        </div>
        
        <div className="grow">
          <p className="font-semibold text-[13px] leading-relaxed tracking-tight">{message}</p>
        </div>
        
        {(type === "error" || type === "info" || type === "warning") && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1 hover:bg-gray-150/40 rounded-full"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
