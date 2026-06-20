import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";
import "./globals.css";

import { ToastProvider } from "@/context/ToastContext";


const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sinerji - Çalışarak Yeteneklerini Kanıtla",
  description: "Öğrenciler ve şirketler için yetenek tabanlı görev ve staj platformu.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" dir="ltr">
      <body className={`${inter.variable} ${outfit.variable} font-body text-text`} suppressHydrationWarning={true}>
        <ToastProvider>
          <ClientWrapper>{children}</ClientWrapper>
        </ToastProvider>
      </body>
    </html>
  );
}
