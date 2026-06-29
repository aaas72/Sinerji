'use client';

import React, { useState } from 'react';
import { submissionService } from '@/services/submission.service';
import { FiSearch, FiCheckCircle, FiXCircle, FiAward } from 'react-icons/fi';
import SectionCard from '@/components/ui/cards/SectionCard';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/Input';
import Tabs from '@/components/ui/Tabs';

export default function CompanyVerifyGuaranteePage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('certificate');
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

  const tabs = [
    { id: 'certificate', label: 'Sertifika & Staj' },
    { id: 'recommendation', label: 'Tavsiye' },
  ];

  return (
    <div className="w-full max-w-[1280px] mx-auto px-6 md:px-16 py-16 flex flex-col gap-8 animate-fadeIn">
      <div className="mb-8 text-center flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-black text-[#00342b] tracking-tight mb-3">
          Doğrulama Sistemi
        </h1>
        <p className="text-[#565e74] text-sm md:text-[15px] max-w-xl text-center leading-relaxed">
          Öğrencilerin sunduğu Sinerji Staj, Sertifika veya Tavsiye garanti kodlarını buradan doğrulayabilirsiniz.
        </p>

        <div className="mt-8 flex justify-center w-full">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => {
              setActiveTab(id);
              setError(null);
              setData(null);
              setToken('');
            }}
            className="md:justify-center"
          />
        </div>
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
            <div className="flex flex-col items-center justify-center text-center py-4">
              <p className="text-red-600 font-semibold text-[15px]">{error}</p>
            </div>
          </SectionCard>
        </div>
      )}

      {data && (
        <div className="max-w-3xl mx-auto w-full animate-fadeIn">
          <div className="mt-4 flex flex-col items-center text-center mb-6">
            <h3 className="text-lg font-bold text-[#00342b]">Doğrulanmış Başarı</h3>
            <p className="text-[#565e74] text-[13px] font-medium mt-1">
              Bu belge Sinerji platformu tarafından resmi olarak onaylanmıştır.
            </p>
          </div>

            <div className="bg-white rounded-md border-[8px] border-[#f1f0ea] p-1.5 shadow-sm w-full relative overflow-hidden mt-4">
              <div className="border border-[#dfded6] p-8 md:p-12 bg-[#faf9f6] flex flex-col items-center text-center relative z-10 min-h-[400px] justify-center">
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                  <FiAward className="w-64 h-64 text-[#004d40]" />
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                  {/* Header */}
                  <h4 className="text-[13px] md:text-sm font-extrabold text-[#e28743] tracking-[0.2em] uppercase mb-4">
                    {data.rewardType === 'Internship' || data.rewardType?.toLowerCase() === 'internship' ? 'Staj Garanti Belgesi' : data.rewardType === 'Certificate' || data.rewardType?.toLowerCase() === 'certificate' ? 'Başarı Sertifikası' : 'Tavsiye Mektubu'}
                  </h4>
                  
                  <p className="text-[#565e74] text-sm md:text-[15px] mb-8 max-w-lg leading-relaxed">
                    Bu belge, aşağıdaki öğrencinin belirtilen görevi başarıyla tamamladığını onaylamak amacıyla <strong>{data.companyName}</strong> adına Sinerji tarafından düzenlenmiştir.
                  </p>

                  {/* Student Name */}
                  <h2 className="text-3xl md:text-4xl font-black text-[#00342b] mb-6">
                    {data.studentName}
                  </h2>

                  {/* Divider */}
                  <div className="w-12 h-1 bg-[#e28743] mb-6 rounded-full opacity-80"></div>

                  {/* Task Title */}
                  <p className="text-[#004d40] text-lg md:text-xl font-bold mb-2 max-w-xl">
                    {data.taskTitle}
                  </p>
                  
                  {/* Footer Area */}
                  <div className="mt-12 flex justify-between items-end w-full px-2 md:px-8 border-t border-[#dfded6]/60 pt-6">
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold text-[#565e74] uppercase tracking-widest mb-1">Tarih</p>
                      <p className="text-[13px] font-bold text-[#00342b]">
                        {new Date(data.completedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center">
                       <div className="w-10 h-10 bg-[#004d40]/10 rounded-full flex items-center justify-center mb-1.5">
                         <FiCheckCircle className="text-[#004d40] w-5 h-5" />
                       </div>
                       <p className="text-[10px] font-extrabold text-[#004d40] uppercase tracking-widest">Doğrulandı</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-extrabold text-[#565e74] uppercase tracking-widest mb-1">Kurum</p>
                      <p className="text-[13px] font-bold text-[#00342b]">Sinerji Platformu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  );
}
