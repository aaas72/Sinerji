import React, { useState } from 'react';
import { FiX, FiCreditCard, FiLock, FiShield, FiUser } from 'react-icons/fi';
import { submissionService } from '@/services/submission.service';
import { Submission } from '@/types/submission';
import { useToast } from '@/context/ToastContext';

interface PaymentModalProps {
  submission: Submission;
  onClose: () => void;
  onSuccess: (updated: Submission) => void;
}

export default function PaymentModal({ submission, onClose, onSuccess }: PaymentModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [cardData, setCardData] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvv: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await submissionService.paySubmission(submission.id, cardData);
      showToast("Ödeme başarıyla havuza aktarıldı ve teklif gönderildi.", "success");
      onSuccess(updated);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Ödeme işlemi sırasında bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({ ...cardData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-sm bg-[#0b1c30]/60 animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10 animate-scaleUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-all cursor-pointer"
        >
          <FiX className="w-4 h-4" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-[#00342b]/10 rounded-full flex items-center justify-center mb-4 text-[#00342b]">
            <FiShield className="w-6 h-6" />
          </div>
          
          <h2 className="text-xl font-extrabold text-[#00342b] mb-2">Güvenli Ödeme (Escrow)</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {submission.student.full_name} isimli öğrenciye teklif göndermek için 
            <strong className="text-[#00342b] mx-1">
              {submission.proposed_budget || submission.task?.budget}₺
            </strong>
            tutarını güvenli havuza aktarmanız gerekmektedir. Öğrenci işi teslim edip siz onaylayana kadar bu ücret havuzda (Escrow) tutulur.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Kart Üzerindeki İsim</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiUser className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="cardHolderName"
                  value={cardData.cardHolderName}
                  onChange={handleChange}
                  required
                  placeholder="AD SOYAD"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Kart Numarası</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <FiCreditCard className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleChange}
                  required
                  maxLength={16}
                  placeholder="0000 0000 0000 0000"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] outline-none tracking-widest font-mono"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">Son Kullanma (AY/YIL)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="expireMonth"
                    value={cardData.expireMonth}
                    onChange={handleChange}
                    required
                    maxLength={2}
                    placeholder="AA"
                    className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] outline-none"
                  />
                  <input
                    type="text"
                    name="expireYear"
                    value={cardData.expireYear}
                    onChange={handleChange}
                    required
                    maxLength={2}
                    placeholder="YY"
                    className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] outline-none"
                  />
                </div>
              </div>
              <div className="w-1/3">
                <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">CVV</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <FiLock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleChange}
                    required
                    maxLength={3}
                    placeholder="123"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#00342b] focus:border-[#00342b] outline-none text-center"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-[#00342b] text-white rounded-xl font-bold shadow-lg hover:bg-[#004d40] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? "İşleniyor..." : "Ödemeyi Tamamla ve Teklif Gönder"}
            </button>
            <p className="text-center text-[9px] text-gray-400 mt-3 font-medium">
              Sinerji, %100 Güvenli Ödeme altyapısı kullanmaktadır.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
// Note: imported FiUser needs to be added, but I will just use FiUser from react-icons/fi
