import { useState } from "react";
import { ChatSidebar } from "./ChatSidebar";
import { cn } from "@/lib/utils";
import { ApiKeyModal } from "./ApiKeyModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none" />
      
      {/* Sidebar */}
      <ChatSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      {/* Main content */}
      <main className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        sidebarOpen ? "md:ml-72" : "md:ml-16"
      )}>
        {/* Top bar with API key management */}
        <div className="absolute top-4 right-4 z-50">
          <ApiKeyModal />
        </div>
        {children}
      </main>
    </div>
  );
}
