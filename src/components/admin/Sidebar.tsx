"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  SquaresFour, 
  Users, 
  FolderOpen, 
  HandCoins, 
  SignOut, 
  Gear, 
  Church, 
  X,
  CalendarCheck, // Icon Jadwal
  CreditCard,    // Icon Rekening
  EnvelopeSimple // Icon Pesan Masuk (Baru)
} from "@phosphor-icons/react";
import { logout } from "@/app/login/actions";
import toast from "react-hot-toast";

// Menerima props optional untuk menutup sidebar di mobile
export default function Sidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname();

  // Daftar Menu Navigasi Lengkap
  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: SquaresFour },
    { name: "Pesan Masuk", href: "/dashboard/pesan", icon: EnvelopeSimple }, // Menu Baru
    { name: "Jadwal Ibadah", href: "/dashboard/jadwal", icon: CalendarCheck },
    { name: "Data Jemaat", href: "/dashboard/jemaat", icon: Users },
    { name: "Arsip Digital", href: "/dashboard/arsip", icon: FolderOpen },
    { name: "Rekening & QRIS", href: "/dashboard/rekening", icon: CreditCard },
    { name: "Laporan Keuangan", href: "/dashboard/keuangan", icon: HandCoins },
    { name: "Pengaturan", href: "/dashboard/settings", icon: Gear },
  ];

  const handleLogout = async () => {
    const toastId = toast.loading('Sedang logout...');
    try {
      await logout();
      // logout() akan redirect, jadi kode di sini tidak akan dijalankan
    } catch (error: any) {
      // Ignore redirect errors - mereka adalah redirect yang diinginkan
      if (error?.message?.includes('NEXT_REDIRECT')) {
        return;
      }
      toast.dismiss(toastId);
      toast.error('Gagal logout. Silakan coba lagi.');
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="h-full flex flex-col bg-white">
      
      {/* HEADER SIDEBAR */}
      <div className="p-6 flex items-center justify-between border-b border-gray-100 h-[73px]">
        <div className="flex items-center gap-2">
            <Church size={32} weight="fill" className="text-primary" />
            <span className="font-bold text-lg text-primary tracking-tight">
              GKP<span className="text-accent">Tasikmalaya</span>
            </span>
        </div>
        
        {/* Tombol Close (X) hanya muncul di layar Mobile */}
        <button 
          onClick={onCloseMobile} 
          className="md:hidden text-gray-500 hover:text-red-600 transition"
        >
            <X size={24} weight="bold" />
        </button>
      </div>

      {/* MENU NAVIGASI */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
        {menuItems.map((item) => {
          // Cek apakah URL saat ini sesuai dengan link menu
          // Kita gunakan startsWith agar sub-route juga aktif (opsional)
          const isActive = pathname === item.href;
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={onCloseMobile} // Tutup sidebar saat menu diklik (UX Mobile)
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive 
                  ? "bg-primary text-white shadow-md" // Style saat Aktif
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary" // Style saat Tidak Aktif
              }`}
            >
              <item.icon size={24} weight={isActive ? "fill" : "regular"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* FOOTER (LOGOUT) */}
      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition font-medium text-left"
        >
          <SignOut size={24} />
          Keluar
        </button>
      </div>

    </aside>
  );
}