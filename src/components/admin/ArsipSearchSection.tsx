'use client';

import { DynamicSearchInput } from './DynamicSearchInput';
import KategoriFilter from './KategoriFilter';

interface ArsipSearchSectionProps {
  query: string;
  kategori: string;
  isOcrView: boolean;
  ocrSearchQuery: string;
  onViewChange: (isOcr: boolean) => void;
  onOcrSearchChange: (query: string) => void;
}

export function ArsipSearchSection({ 
  query, 
  kategori, 
  isOcrView,
  ocrSearchQuery,
  onViewChange,
  onOcrSearchChange
}: ArsipSearchSectionProps) {
  return (
    <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-gray-100 bg-gray-50">
      <DynamicSearchInput 
        placeholder="Cari nama dokumen..."
        isOcrView={isOcrView}
        ocrSearchQuery={ocrSearchQuery}
        onOcrSearchChange={onOcrSearchChange}
      />
      <KategoriFilter />
    </div>
  );
}
