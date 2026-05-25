
import AuthModal from "@/components/auth/AuthModal";
import { SocketProvider } from "@/context/SocketContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      {children}
      <AuthModal />
    </SocketProvider>
  );
}
