"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Beklenmeyen Bir Hata Oluştu</h2>
              <p className="text-gray-500 text-sm">
                İşleminiz sırasında bir sorunla karşılaştık. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => reset()}
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors focus:ring-4 focus:ring-teal-100"
              >
                Tekrar Dene
              </button>
              <Link
                href="/"
                className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-xl transition-colors border border-gray-200"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
