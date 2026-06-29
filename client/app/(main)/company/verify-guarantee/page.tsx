'use client';

import React, { useState } from 'react';
import { submissionService } from '@/services/submission.service';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaAward } from 'react-icons/fa';

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
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Sertifika Doğrulama Sistemi</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Öğrencilerin sunduğu Sinerji Staj veya Sertifika garanti kodlarını buradan doğrulayabilirsiniz.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaAward className="text-gray-400" />
            </div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Sertifika kodunu buraya yapıştırın (Örn: 123e4567-e89b-...)"
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 outline-none text-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sorgulanıyor...</span>
              </>
            ) : (
              <>
                <FaSearch />
                <span>Doğrula</span>
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center animate-fade-in">
          <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h3>
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      )}

      {data && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-8 shadow-sm animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-bl-full opacity-20 -z-10"></div>
          
          <div className="flex flex-col items-center text-center mb-8">
            <FaCheckCircle className="text-green-500 text-6xl mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">Geçerli Sertifika</h3>
            <p className="text-green-700 font-medium mt-1">Bu belge Sinerji sistemi tarafından doğrulanmıştır.</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-green-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Öğrenci</p>
                <p className="text-lg font-medium text-gray-900">{data.studentName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Veren Şirket</p>
                <p className="text-lg font-medium text-gray-900">{data.companyName}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Görev Adı</p>
                <p className="text-lg font-medium text-gray-900">{data.taskTitle}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Kazanım Türü</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {data.rewardType === 'Internship' ? 'Staj Hakkı' : 'Sertifika'}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold mb-1">Tamamlanma Tarihi</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(data.completedAt).toLocaleDateString('tr-TR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
