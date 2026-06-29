'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { submissionService } from '@/services/submission.service';
import { FaAward, FaCheckCircle, FaSpinner, FaTimesCircle } from 'react-icons/fa';

export default function VerifyGuaranteePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    studentName: string;
    companyName: string;
    taskTitle: string;
    completedAt: string;
    rewardType: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      submissionService.verifyGuarantee(token)
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Geçersiz veya süresi dolmuş sertifika kodu.');
          setLoading(false);
        });
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-blue-600">
          <FaSpinner className="text-4xl animate-spin" />
          <p className="font-semibold text-lg text-gray-700">Sertifika Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
          <FaTimesCircle className="text-red-500 text-6xl mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h1>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 md:p-14 rounded-3xl shadow-2xl max-w-3xl w-full text-center relative overflow-hidden border border-gray-100">
        
        {/* Certificate Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full opacity-50 -z-10"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-50 rounded-tr-full opacity-50 -z-10"></div>

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center border-4 border-green-500">
            <FaCheckCircle className="text-green-500 text-5xl" />
          </div>
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2 uppercase">
          Eğitim & Staj Garantisi
        </h1>
        <h2 className="text-xl text-blue-600 font-semibold mb-10 tracking-widest uppercase">
          Başarı Sertifikası
        </h2>

        <div className="text-gray-700 space-y-6 text-lg leading-relaxed">
          <p>
            Bu belge, <span className="font-bold text-2xl text-gray-900 block mt-2">{data.studentName}</span>
          </p>
          <p>
            isimli öğrencinin, 
            <span className="font-bold text-indigo-700 px-2">{data.companyName}</span> 
            tarafından açılan
          </p>
          <p className="text-xl font-medium text-gray-800 italic px-4 py-2 bg-gray-50 rounded-lg inline-block border border-gray-200">
            "{data.taskTitle}"
          </p>
          <p>
            görevini başarıyla tamamladığını ve 
            <span className="font-bold text-gray-900 mx-2">{data.rewardType === 'Internship' ? 'Staj' : 'Sertifika'}</span> 
            hakkı kazandığını doğrular.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-1">Onay Tarihi</p>
            <p className="text-lg font-medium text-gray-900">
              {new Date(data.completedAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <FaAward className="text-indigo-600 text-4xl" />
            <div className="text-left">
              <p className="font-bold text-gray-900 text-xl tracking-tight">Sinerji</p>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Doğrulanmış Kayıt</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
