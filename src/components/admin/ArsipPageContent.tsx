'use client';

import { useState } from 'react';
import { ArsipSearchSection } from '@/components/admin/ArsipSearchSection';
import { ArsipTableView } from '@/components/admin/ArsipTableView';

interface ArsipItem {
  id: string;
  nama_dokumen: string;
  kategori: string | null;
  url_file: string | null;
  created_at: string;
  status_ocr?: string | null;
  hasil_ocr?: string | null;
}

interface ArsipPageContentProps {
  arsip: ArsipItem[];
  count: number;
  currentPage: number;
  totalPages: number;
  query: string;
  kategori: string;
}

export function ArsipPageContent({
  arsip,
  count,
  currentPage,
  totalPages,
  query,
  kategori,
}: ArsipPageContentProps) {
  const [isOcrView, setIsOcrView] = useState(false);
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <ArsipSearchSection 
        query={query} 
        kategori={kategori}
        isOcrView={isOcrView}
        ocrSearchQuery={ocrSearchQuery}
        onViewChange={setIsOcrView}
        onOcrSearchChange={setOcrSearchQuery}
      />

      <ArsipTableView
        arsip={arsip}
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        kategori={kategori}
        ocrSearchQuery={ocrSearchQuery}
        onViewChange={setIsOcrView}
      />
    </div>
  );
}
