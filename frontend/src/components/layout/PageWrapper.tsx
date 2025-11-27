import { useState } from "react";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface PageWrapperProps {
  children: ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main
        className={`
          flex-1
          p-6
          bg-gray-50
          min-h-screen
          pt-16
          transition-all duration-300
          ${sidebarOpen ? "ml-64" : "ml-0"}
        `}
      >
        {children}
      </main>
    </div>
  );
}
