import { useEffect, useState } from "react";
import { FiX, FiMapPin, FiBriefcase, FiUserPlus, FiGithub, FiLinkedin, FiTwitter, FiGlobe, FiAward, FiStar, FiCalendar, FiBookOpen } from "react-icons/fi";
import { StudentType } from "@/components/ui/cards/StudentExploreCard";
import PrimaryButton from "@/components/ui/PrimaryButton";
import Link from "next/link";

interface StudentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentType | null;
}

export default function StudentProfileDrawer({ isOpen, onClose, student }: StudentProfileDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-[#00342b]/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[560px] md:w-[600px] bg-[#fdfdfc] shadow-2xl z-[101] transform transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] overflow-y-auto ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {student && (
          <div className="flex flex-col h-full">
            {/* Header / Cover (Green Section) */}
            <div className="relative bg-gradient-to-br from-[#00342b] to-[#004d40] shrink-0 pt-16 px-8 pb-8 text-white">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md"
              >
                <FiX className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg mb-4">
                  <div className="w-full h-full rounded-full bg-[#f1f0ea] border border-[#dfded6] flex items-center justify-center text-[#00342b] font-bold text-3xl">
                    {student.initials}
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white">{student.name}</h2>
                <p className="text-[#afefdd] font-medium mt-1">{student.headline}</p>

                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-white/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FiMapPin className="text-white/60" />
                    <span>{student.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiBriefcase className="text-white/60" />
                    <span>{student.university}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3 mt-8">
                  <PrimaryButton icon={FiUserPlus} className="flex-1 rounded-full py-2.5 justify-center bg-[#e28743] hover:bg-[#c47133] text-white">
                    Göreve Davet Et
                  </PrimaryButton>
                  <PrimaryButton variant="outline" className="flex-1 rounded-full px-6 border-white/30 text-white hover:bg-white/10 hover:text-white">
                    Mesaj Gönder
                  </PrimaryButton>
                </div>
                
                {/* View Full Profile Link */}
                <div className="mt-4 w-full">
                  <Link 
                    href={`/students/${student.id}`} 
                    onClick={onClose}
                    className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none text-[#e28743] hover:text-[#f89b52] hover:bg-transparent px-4 py-2 bg-transparent"
                  >
                    Tüm Profili Görüntüle &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Info (Light Section) */}
            <div className="p-8 flex-1">

              {/* About / Bio Placeholder */}
              <div className="mb-8">
                <h3 className="text-[15px] font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
                  <FiBookOpen className="text-[#e28743]" />
                  Hakkında
                </h3>
                <p className="text-sm text-[#565e74] leading-relaxed">
                  {student.bio || "Öğrenci profili detayları henüz API tarafından tam olarak dönülmüyor. Bu alanda öğrencinin kendisi hakkında yazdığı detaylı biyografi yer alacak."}
                </p>
              </div>

              {/* Skills */}
              <div className="mb-8">
                <h3 className="text-[15px] font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
                  <FiAward className="text-[#e28743]" />
                  Teknik Yetenekler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills && student.skills.length > 0 ? (
                    student.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-1.5 bg-[#00342b]/5 text-[#00342b] border border-[#00342b]/10 rounded-full text-sm font-semibold"
                      >
                        {typeof skill === "string" ? skill : (skill as any).skill?.name || "Bilinmeyen Yetenek"}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Yetenek eklenmemiş.</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}
