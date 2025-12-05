'use client';

import { useState } from 'react';
import { FileText, FileImage, FilePdf, CaretLeft, CaretRight, Link as LinkIcon } from '@phosphor-icons/react';
import { ArsipActions } from './ArsipClient';
import Link from 'next/link';

interface ArsipItem {
  id: string;
  nama_dokumen: string;
  kategori: string | null;
  url_file: string | null;
  created_at: string;
  status_ocr?: string | null;
  hasil_ocr?: string | null;
}

interface ArsipTableViewProps {
  arsip: ArsipItem[];
  count: number;
  currentPage: number;
  totalPages: number;
  query: string;
  kategori: string;
  ocrSearchQuery?: string;
  onViewChange?: (isOcrView: boolean) => void;
}

// Fungsi untuk highlight teks yang cocok dengan search query
const highlightText = (text: string, query: string) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) => 
    regex.test(part) ? `<mark>${part}</mark>` : part
  ).join('');
};

export function ArsipTableView({ 
  arsip, 
  count, 
  currentPage, 
  totalPages, 
  query, 
  kategori,
  onViewChange,
  ocrSearchQuery = ''
}: ArsipTableViewProps) {
  const [isOcrView, setIsOcrView] = useState(false);

  const handleViewChange = (newIsOcrView: boolean) => {
    setIsOcrView(newIsOcrView);
    onViewChange?.(newIsOcrView);
  };

  const getIcon = (kat: string | null) => {
    if (kat === 'Laporan') return <FileText size={24} className="text-green-500 shrink-0" weight="duotone"/>;
    if (kat === 'Media') return <FileImage size={24} className="text-blue-500 shrink-0" weight="duotone"/>;
    return <FilePdf size={24} className="text-red-500 shrink-0" weight="duotone"/>;
  };

  // Filter arsip berdasarkan view mode dan query
  const filteredArsip = isOcrView 
    ? arsip.filter(item => {
        // Di view OCR, filter yang punya hasil_ocr dan cocok dengan query OCR
        if (!item.hasil_ocr) return false;
        if (!ocrSearchQuery) return true;
        return item.hasil_ocr.toLowerCase().includes(ocrSearchQuery.toLowerCase());
      })
    : arsip;

  const paginationQuery = new URLSearchParams();
  if (query) paginationQuery.set('query', query);
  if (kategori) paginationQuery.set('kategori', kategori);

  return (
    <div>
      {/* Switch Button */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
          <button
            onClick={() => handleViewChange(false)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              !isOcrView
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Tabel Standar
          </button>
          <button
            onClick={() => handleViewChange(true)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition ${
              isOcrView
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Hasil OCR
          </button>
        </div>
        {isOcrView && ocrSearchQuery && (
          <span className="text-sm text-gray-600">
            Hasil pencarian untuk: <span className="font-bold text-primary">"{ocrSearchQuery}"</span>
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 min-w-[800px]">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3">Nama Dokumen</th>
              <th className="px-6 py-3">Kategori</th>
              <th className="px-6 py-3">Tanggal Upload</th>
              {isOcrView && <th className="px-6 py-3">Hasil OCR</th>}
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredArsip.length > 0 ? (
              filteredArsip.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                    {getIcon(item.kategori)}
                    <div className="flex flex-col">
                      <span className="truncate max-w-[200px] md:max-w-xs font-bold" title={item.nama_dokumen}>
                        {item.nama_dokumen}
                      </span>
                      {item.url_file && (
                        <a href={item.url_file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                          <LinkIcon size={12}/> Lihat File
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200 font-medium">
                      {item.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  {isOcrView && (
                    <td className="px-6 py-4">
                      <div className="max-w-md max-h-32 overflow-y-auto bg-gray-50 rounded p-3 text-xs text-gray-700">
                        {item.hasil_ocr ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: highlightText(item.hasil_ocr, ocrSearchQuery)
                            }}
                            className="whitespace-pre-wrap"
                            style={{
                              '--mark-bg': '#fbbf24',
                              '--mark-color': '#000'
                            } as React.CSSProperties}
                          />
                        ) : (
                          <span className="text-gray-400 italic">Belum ada hasil OCR</span>
                        )}
                      </div>
                      <style jsx>{`
                        :global(mark) {
                          background-color: var(--mark-bg, #fbbf24);
                          color: var(--mark-color, #000);
                          font-weight: bold;
                          border-radius: 2px;
                          padding: 0 2px;
                        }
                      `}</style>
                    </td>
                  )}
                  <td className="px-6 py-4 text-right">
                    <ArsipActions arsip={item} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isOcrView ? 5 : 4} className="text-center py-12 text-gray-400">
                  {isOcrView && ocrSearchQuery 
                    ? `Tidak ada dokumen dengan hasil OCR yang cocok dengan "${ocrSearchQuery}"`
                    : isOcrView
                    ? 'Tidak ada dokumen dengan hasil OCR'
                    : 'Dokumen tidak ditemukan'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4 border-t border-gray-100">
        <span>Halaman {currentPage} dari {totalPages || 1}</span>
        <div className="flex gap-2">
          <Link
            href={{ pathname: '/dashboard/arsip', query: Object.fromEntries(paginationQuery) as Record<string, string> }}
            className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
          >
            <CaretLeft/> Prev
          </Link>
          <Link
            href={{ 
              pathname: '/dashboard/arsip', 
              query: { 
                ...Object.fromEntries(paginationQuery),
                page: (currentPage + 1).toString()
              } as Record<string, string>
            }}
            className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
          >
            Next <CaretRight/>
          </Link>
        </div>
      </div>
    </div>
  );
}
