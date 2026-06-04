import { useEffect, useRef } from "react";

interface InfiniteScrollTriggerProps {
  onTrigger: () => void;
  hasMore: boolean;
}

export default function InfiniteScrollTrigger({ onTrigger, hasMore }: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onTrigger();
        }
      },
      { threshold: 0.1 }
    );

    const current = triggerRef.current;
    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [onTrigger, hasMore]);

  if (!hasMore) return null;

  return (
    <div ref={triggerRef} className="w-full h-12 flex items-center justify-center text-xs text-[#565e74]/50 font-bold py-6 shrink-0 select-none">
      <div className="w-4 h-4 border-2 border-[#004d40]/30 border-t-[#004d40] rounded-full animate-spin mr-2" />
      Daha Fazla Yükleniyor...
    </div>
  );
}
