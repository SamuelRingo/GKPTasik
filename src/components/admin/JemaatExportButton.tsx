'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { exportJemaatToCSV } from '@/app/dashboard/jemaat/actions';
import toast from 'react-hot-toast';
import { DownloadSimple } from '@phosphor-icons/react';

export default function JemaatExportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleExport = async () => {
    setIsLoading(true);
    const toastId = toast.loading('Mempersiapkan data untuk di-export...');

    // Ambil filter saat ini dari URL
    const query = searchParams.get('query') || '';
    const wilayah = searchParams.get('wilayah') || '';

    // Panggil server action
    const result = await exportJemaatToCSV(query, wilayah);
    
    toast.dismiss(toastId);

    if (result.error) {
      toast.error(`Gagal export: ${result.error}`);
    } else if (result.csv) {
      // Buat file Blob dari string CSV
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      
      // Buat link sementara untuk memicu unduhan
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Format nama file dengan tanggal
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `data-jemaat-${date}.csv`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Data jemaat berhasil diunduh!');
    }
    setIsLoading(false);
  };

  return (
    <button 
      onClick={handleExport}
      disabled={isLoading}
      className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition shadow-sm w-full sm:w-auto disabled:opacity-50 disabled:cursor-wait"
    >
      {isLoading ? 'Memproses...' : (
        <>
          <DownloadSimple weight="bold" /> Export CSV
        </>
      )}
    </button>
  );
}
