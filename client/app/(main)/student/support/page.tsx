"use client";

import { useState, useEffect } from "react";
import PrimaryButton from "@/components/ui/PrimaryButton";
import {
  FiSend,
  FiMessageSquare,
  FiHelpCircle,
  FiArrowRight,
  FiLifeBuoy,
} from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { supportService, SupportTicket } from "@/services/support.service";
import FormInput from "@/components/ui/form/FormInput";
import SectionCard from "@/components/ui/cards/SectionCard";

export default function StudentSupportPage() {
  const { showToast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const data = await supportService.getMyTickets();
      setTickets(data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      showToast("Lütfen tüm alanları doldurun.", "error");
      return;
    }

    setIsLoading(true);
    try {
      await supportService.createTicket({ subject, message });
      showToast(
        "Mesajınız iletildi. Sinerji ekibi en kısa sürede seninle iletişime geçecek!",
        "success"
      );
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (error) {
      showToast("Mesaj gönderilirken bir hata oluştu.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "px-4 py-3 text-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm";

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8">

      {/* ── Page Header ── */}
      <header className="relative overflow-hidden rounded-xl border border-[#f1f0ea] bg-white p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eff4ff] to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40] shrink-0">
            <FiLifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[28px] md:text-[36px] font-extrabold leading-tight text-[#00342b] font-heading">
              Destek ve Yardım
            </h1>
            <p className="text-sm text-[#565e74] font-medium mt-0.5">
              Sinerji ekibiyle iletişime geç, sorularını yanıtlayalım
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Contact Form ── */}
        <div className="lg:col-span-2">
          <SectionCard 
            icon={FiSend} 
            title="Bize Ulaş" 
            description="Her türlü soru ve önerinizi bizimle paylaşın"
            className="bg-white border-[#f1f0ea] shadow-2xs"
          >
              {/* Info banner */}
              <div className="bg-transparent p-5 rounded-xl border border-[#f1f0ea] flex items-start gap-4 mb-6 mt-2">
                <div className="w-10 h-10 rounded-xl bg-[#004d40]/5 flex items-center justify-center shrink-0 text-[#004d40]">
                  <FiHelpCircle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Nasıl yardımcı olabiliriz?</h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed font-medium">
                    Sinerji deneyiminle ilgili her türlü soru, görüş ve önerini bizimle paylaşabilirsin.
                    Teknik bir sorun yaşıyorsan lütfen ekran görüntüsü veya detaylı açıklama eklemeyi unutma.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <FormInput
                  label="Konu Başlığı"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Örn: Profil doğrulaması hakkında"
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Mesajın
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    className="w-full rounded-lg border border-gray-200 bg-gray-100/80 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#004d40] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#004d40]/20 resize-none"
                    placeholder="Sana yardımcı olabilmemiz için detayları buraya yazabilirsin..."
                  />
                </div>

                <PrimaryButton
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  icon={FiSend}
                  className="w-full py-3.5 mt-2"
                >
                  Mesajı Gönder
                </PrimaryButton>
              </form>
          </SectionCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">

          {/* Previous tickets */}
          <SectionCard 
            icon={FiMessageSquare} 
            title="Önceki Mesajlarım"
            className="bg-white border-[#f1f0ea] shadow-2xs"
          >
              {isFetching ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 rounded-xl border border-[#f1f0ea] hover:border-[#004d40]/30 hover:bg-[#004d40]/2 transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            ticket.status === "open"
                              ? "bg-[#004d40]/10 border-[#004d40]/20 text-[#004d40]"
                              : "bg-transparent border-gray-200 text-gray-400"
                          }`}
                        >
                          {ticket.status === "open" ? "Aktif" : "Çözüldü"}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-gray-800 line-clamp-1">
                        {ticket.subject}
                      </h5>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-14 h-14 border border-[#f1f0ea] rounded-full flex items-center justify-center mx-auto mb-3 text-gray-300">
                    <FiMessageSquare size={22} />
                  </div>
                  <p className="text-xs text-gray-400 font-semibold italic">
                    Henüz bir destek talebin yok.
                  </p>
                </div>
              )}
          </SectionCard>

          {/* Quick Tips */}
          <SectionCard 
            icon={FiHelpCircle} 
            title="Hızlı Bilgi"
            className="bg-white border-[#f1f0ea] shadow-2xs"
            accent={true}
          >
            <div className="space-y-4">
              {[
                "Profilim nasıl doğrulanır?",
                "Ödemeler ne zaman yapılır?",
                "Yeteneklerimi nasıl güncellerim?",
              ].map((q) => (
                <button
                  key={q}
                  className="w-full flex items-center justify-between text-left text-xs text-[#e28743] hover:text-[#c97435] font-bold group cursor-pointer transition-colors"
                >
                  {q}
                  <FiArrowRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 w-3.5 h-3.5 shrink-0" />
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
