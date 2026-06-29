import React from "react";
import { FiInbox } from "react-icons/fi";

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ElementType;
}

export default function EmptyState({ 
  title = "Kayıt Bulunamadı", 
  message = "Görüntülenecek veri bulunamadı.", 
  icon: Icon = FiInbox 
}: EmptyStateProps) {
  return (
    <div className="w-full h-full min-h-[250px] bg-transparent p-12 text-center text-gray-500 flex flex-col items-center justify-center">
      <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-[#565e74] font-medium max-w-xs mx-auto">
        {message}
      </p>
    </div>
  );
}
