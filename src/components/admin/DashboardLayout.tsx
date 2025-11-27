"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { List } from "@phosphor-icons/react";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      
      {/* MOBILE OVERLAY (Background gelap saat sidebar terbuka di HP) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:inset-auto shrink-0
      `}>
        <Sidebar onCloseMobile={() => setSidebarOpen(false)} />
      </div>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* MOBILE HEADER (Hanya muncul di HP) */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center gap-4 md:hidden sticky top-0 z-30">
            <button 
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 hover:text-primary focus:outline-none"
            >
                <List size={32} />
            </button>
            <span className="font-bold text-lg text-primary">GKP<span className="text-accent">Tasikmalaya</span></span>
        </header>

        {/* CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-[calc(100vh-65px)] md:h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}