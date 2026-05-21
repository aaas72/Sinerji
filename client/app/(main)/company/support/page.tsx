"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FiSend, FiMessageSquare, FiClock, FiHelpCircle, FiLifeBuoy } from "react-icons/fi";
import { useToast } from "@/context/ToastContext";
import { supportService, SupportTicket } from "@/services/support.service";

export default function SupportPage() {
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
      showToast("Mesajınız başarıyla iletildi. En kısa sürede size döneceğiz.", "success");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (error) {
      showToast("Mesaj gönderilirken bir hata oluştu.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <span className="bg-[#eff4ff] text-[#0066cc] px-2.5 py-0.5 rounded-full text-xs font-semibold">Açık</span>;
      case "closed":
        return <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-xs font-semibold">Kapandı</span>;
      default:
        return <span className="bg-yellow-50 text-yellow-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#004d40]/15 focus:border-[#004d40] outline-none transition-all hover:border-gray-300 text-[#004d40] font-medium placeholder:text-gray-400 placeholder:font-normal text-sm";

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
              Sorularınız, teknik sorunlarınız veya önerileriniz için Sinerji ekibine ulaşın
            </p>
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-4 px-8 py-5 border-b border-[#f1f0ea]">
              <div className="w-9 h-9 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
                <FiSend className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 font-heading">Destek Talebi Oluştur</h2>
                <p className="text-xs text-gray-400 font-medium">Bize her türlü mesajınızı buradan iletebilirsiniz</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Konu</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={inputClass}
                  placeholder="Sorununuzun veya sorunuzun kısa bir özeti"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Mesajınız</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className={`${inputClass} resize-none`}
                  placeholder="Lütfen detaylı bilgi veriniz..."
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  icon={FiSend}
                  className="w-full md:w-auto px-8 py-3 rounded-xl bg-[#004d40] hover:bg-[#00342b] text-white text-sm font-semibold transition-all shadow-xs"
                >
                  Gönder
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Previous Tickets & Info */}
        <div className="space-y-6">
          
          {/* Previous Tickets Card */}
          <div className="bg-white rounded-2xl border border-[#f1f0ea] shadow-2xs overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-4 px-6 py-4 border-b border-[#f1f0ea]">
              <div className="w-9 h-9 bg-[#004d40]/5 rounded-xl flex items-center justify-center text-[#004d40]">
                <FiMessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 font-heading">Geçmiş Talepler</h2>
                <p className="text-[10px] text-gray-400 font-medium">Önceki destek başvurularınız</p>
              </div>
            </div>

            <div className="p-6">
              {isFetching ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#004d40] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tickets.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 rounded-xl border border-[#f1f0ea] bg-gray-50/30 hover:bg-white hover:shadow-xs transition-all">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{ticket.subject}</h4>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.message}</p>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium">
                        <FiClock size={12} />
                        {new Date(ticket.created_at).toLocaleDateString("tr-TR")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FiMessageSquare size={32} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs italic">Henüz bir destek talebiniz bulunmuyor.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick FAQ Promo Card */}
          <div className="bg-gradient-to-br from-[#004d40] to-[#00342b] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                  <FiHelpCircle size={20} />
                </div>
                <h3 className="font-bold font-heading">Yardıma mı ihtiyacınız var?</h3>
              </div>
              <p className="text-xs text-white/80 leading-relaxed mb-4 font-normal">
                Sıkça sorulan sorular (SSS) sayfamıza göz atarak sorularınıza daha hızlı yanıt bulabilirsiniz.
              </p>
              <Button variant="outline" className="w-full text-xs py-2.5 bg-white/10 border-white/20 hover:bg-white/20 text-white transition-all rounded-xl font-semibold">
                SSS Görüntüle
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
