import { ReactNode } from "react";
import CompanyNavbar from "./CompanyNavbar";

export default function Container({ children }: { children: ReactNode }) {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const isCompany = pathname.startsWith("/company");

  return isCompany ? (
    <div className="flex min-h-screen">
      <div className="flex-1 flex flex-col bg-gray-50 min-h-screen">
        <CompanyNavbar />
        <main className="flex-1">
          <div className="w-full bg-[#faf9f6]">{children}</div>
        </main>
      </div>
    </div>
  ) : (
    <div className="mx-auto app-container px-4">{children}</div>
  );
}