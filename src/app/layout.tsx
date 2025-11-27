import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // 1. Import Montserrat
import "./globals.css";
import { Toaster } from "react-hot-toast";

// 2. Konfigurasi Font Montserrat
const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"], // Weight lengkap
  variable: "--font-montserrat", // Variable untuk CSS custom jika perlu
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gereja Kristen Pasundan Tasikmalaya",
  description: "Sistem Informasi Manajemen Arsip Digital dan Website Gereja Berbasis Cloud",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      {/* 3. PASANG LANGSUNG DI SINI: montserrat.className */}
      <body className={`${montserrat.className} antialiased bg-gray-50 text-gray-800`}>
        
        <Toaster 
          position="top-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 5000,
            className: '',
            style: {
              background: '#fff',
              color: '#1f2937',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
              // Pastikan Toast juga pakai variable Montserrat
              fontFamily: 'var(--font-montserrat)', 
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#ECFDF5',
              },
              style: {
                borderLeft: '4px solid #10B981',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FEF2F2',
              },
              style: {
                borderLeft: '4px solid #EF4444',
              },
            },
            loading: {
              iconTheme: {
                primary: '#1e3a8a',
                secondary: '#E0F2FE',
              },
              style: {
                borderLeft: '4px solid #1e3a8a',
              },
            },
          }}
        />
        
        {children}
      </body>
    </html>
  );
}