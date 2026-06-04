"use client";

import { useAuthStore } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompanyNavbar from "@/components/layout/CompanyNavbar";
import Navbar from "@/components/layout/Navbar";

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const { user, _hasHydrated } = useAuthStore();

  if (!_hasHydrated) return <div className="min-h-screen bg-[#faf9f6]"></div>;

  if (user?.role === "company") {
    return (
      <ProtectedRoute allowedRoles={["company", "student"]}>
        <div className="flex flex-col min-h-screen">
          <CompanyNavbar />
          <main className="flex-1">
            <div className="w-full bg-[#faf9f6]">{children}</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  // Student (or fallback)
  return (
    <ProtectedRoute allowedRoles={["company", "student"]}>
      <div className="w-full min-h-screen bg-[#faf9f6]">
        <Navbar authenticated={true} role="student" />
        <div className="w-full">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
