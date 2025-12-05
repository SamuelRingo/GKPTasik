'use client';

import { Funnel } from "@phosphor-icons/react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function KategoriFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleFilter = (term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset ke halaman 1

    if (term) {
      params.set('kategori', term);
    } else {
      params.delete('kategori');
    }

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full md:w-auto group">
      <Funnel size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      
      <select
        onChange={(e) => handleFilter(e.target.value)}
        defaultValue={searchParams.get('kategori')?.toString() || ""}
        className="appearance-none w-full md:w-48 pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 hover:bg-gray-50 focus:ring-1 focus:ring-primary outline-none cursor-pointer transition"
      >
        <option value="">Semua Kategori</option>
        <option value="Warta">Warta Jemaat</option>
        <option value="Laporan">Laporan</option>
        <option value="Dokumen">Dokumen </option>
        <option value="Media">Media & Foto</option>
      </select>

      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
  );
}