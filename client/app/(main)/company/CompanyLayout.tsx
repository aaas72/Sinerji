import { ReactNode } from "react";
import CompanyNavbar from "@/components/layout/CompanyNavbar";

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CompanyNavbar />
      <main className="flex-1">
        <div className="mx-auto app-container px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
