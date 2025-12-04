'use client'; 
// Kita pakai useState untuk handle error message dari server action
// Teknik ini disebut "Hydration" dari Server Action ke Client State

import Link from "next/link";
import { Church, LockKey, Envelope, WarningCircle } from "@phosphor-icons/react";
import { login } from "./actions"; // Import server action
import { SubmitButton } from "./submit-button";
import { useState } from "react";

export default function LoginPage() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Wrapper function untuk menangani Server Action di Client
  async function clientAction(formData: FormData) {
    const result = await login(formData);
    if (result?.error) {
      setErrorMsg("Login gagal: Email atau password salah.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-primary p-8 text-center">
          <div className="flex justify-center mb-4 text-white">
             <Church size={48} weight="fill" className="text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          <p className="text-blue-200">GKP Tasikmalaya</p>
        </div>

        <div className="p-8">
          {/* ALERT ERROR */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                <WarningCircle size={24} className="text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* FORM START */}
          <form action={clientAction} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Administrator</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Envelope size={20} className="text-gray-400" />
                </div>
                <input 
                  name="email" // PENTING: name attribute agar terbaca di FormData
                  type="email" 
                  required
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="example@gmail.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockKey size={20} className="text-gray-400" />
                </div>
                <input 
                  name="password" // PENTING
                  type="password" 
                  required
                  className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="ml-2 text-gray-600">Ingat Saya</span>
              </label>
              <a href="#" className="text-primary hover:text-accent font-medium">Lupa Password?</a>
            </div>

            {/* Tombol Submit Terpisah (Komponen) */}
            <SubmitButton />
            
          </form>
          {/* FORM END */}

        </div>
        
        <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <Link href="/" className="text-sm text-gray-500 hover:text-primary">Kembali ke Website Utama</Link>
        </div>
      </div>
    </div>
  );
}