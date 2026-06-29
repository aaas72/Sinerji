'use client';

import React, { useState } from 'react';
import { submissionService } from '@/services/submission.service';
import { FiSearch, FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import SectionCard from '@/components/ui/cards/SectionCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';

export default function CompanyVerifyGuaranteePage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    studentName: string;
    companyName: string;
    taskTitle: string;
    completedAt: string;
    rewardType: string;
  } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await submissionService.verifyGuarantee(token.trim());
      setData(res);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Geçersiz veya süresi dolmuş sertifika kodu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8 animate-fadeIn">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-[32px] md:text-[40px] font-black text-[#00342b] tracking-tight mb-4">
          Sertifika Doğrulama
        </h1>
        <p className="text-[#565e74] text-base md:text-lg max-w-2xl text-center leading-relaxed">
          Öğrencilerin sunduğu Sinerji Staj, Sertifika veya Tavsiye garanti kodlarını buradan doğrulayabilirsiniz.
        </p>
      </div>

      <div className="max-w-3xl mx-auto w-full">
        <SectionCard title="Referans Kodu Sorgulama" icon={FiSearch}>
          <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4 mt-2">
            <div className="flex-1">
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Referans kodunu buraya yapıştırın (Örn: 123e4567-...)"
                className="py-3 px-4"
                disabled={loading}
              />
            </div>
            <PrimaryButton
              type="submit"
              disabled={loading || !token.trim()}
              isLoading={loading}
              icon={FiSearch}
              className="py-3 px-8 md:min-w-[160px]"
            >
              Sorgula
            </PrimaryButton>
          </form>
        </SectionCard>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto w-full animate-fadeIn">
          <SectionCard title="Doğrulama Başarısız" icon={FiXCircle} accent={true}>
            <div className="flex flex-col items-center justify-center text-center py-6">
              <FiXCircle className="text-red-500 w-16 h-16 mb-4" />
              <p className="text-red-600 font-semibold text-lg">{error}</p>
            </div>
          </SectionCard>
        </div>
      )}

      {data && (
        <div className="max-w-3xl mx-auto w-full animate-fadeIn">
          <SectionCard title="Geçerli Sertifika" icon={FiCheckCircle} className="border-[#004d40]/30 bg-gradient-to-br from-[#004d40]/5 to-transparent">
            <div className="flex flex-col items-center text-center mb-8 pt-4">
              <div className="w-20 h-20 bg-[#004d40]/10 rounded-full flex items-center justify-center mb-4">
                <FiCheckCircle className="text-[#004d40] w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-[#00342b]">Doğrulanmış Başarı</h3>
              <p className="text-[#004d40] font-semibold mt-2">
                Bu belge Sinerji platformu tarafından resmi olarak onaylanmıştır.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-[#f1f0ea] shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="text-[11px] font-extrabold text-[#565e74] uppercase tracking-wider mb-2">Öğrenci</p>
                  <p className="text-lg font-bold text-[#00342b]">{data.studentName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#565e74] uppercase tracking-wider mb-2">Veren Şirket</p>
                  <p className="text-lg font-bold text-[#00342b]">{data.companyName}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[11px] font-extrabold text-[#565e74] uppercase tracking-wider mb-2">Görev Adı</p>
                  <p className="text-lg font-bold text-[#00342b]">{data.taskTitle}</p>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#565e74] uppercase tracking-wider mb-2">Kazanım Türü</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-[13px] font-bold uppercase tracking-wider bg-[#004d40]/10 text-[#004d40]">
                    {data.rewardType === 'Internship' || data.rewardType?.toLowerCase() === 'internship' ? 'Staj Hakkı' : data.rewardType === 'Certificate' || data.rewardType?.toLowerCase() === 'certificate' ? 'Sertifika' : 'Tavsiye'}
                  </span>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold text-[#565e74] uppercase tracking-wider mb-2">Tamamlanma Tarihi</p>
                  <p className="text-lg font-bold text-[#00342b]">
                    {new Date(data.completedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
