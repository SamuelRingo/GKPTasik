'use client';

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

interface DynamicSearchInputProps {
  placeholder: string;
  isOcrView?: boolean;
  ocrSearchQuery?: string;
  onOcrSearchChange?: (query: string) => void;
}

export function DynamicSearchInput({ 
  placeholder,
  isOcrView = false,
  ocrSearchQuery = '',
  onOcrSearchChange
}: DynamicSearchInputProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = (term: string) => {
    if (isOcrView) {
      // Di view OCR, update state local tanpa URL change
      onOcrSearchChange?.(term);
    } else {
      // Di view Standar, update URL dengan query
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');

      if (term) {
        params.set('query', term);
      } else {
        params.delete('query');
      }
      
      replace(`${pathname}?${params.toString()}`);
    }
  };

  const displayPlaceholder = isOcrView 
    ? "Cari teks dalam hasil OCR..." 
    : "Cari nama dokumen...";

  const currentValue = isOcrView ? ocrSearchQuery : (searchParams.get('query')?.toString() || '');

  return (
    <div className="relative w-full md:w-auto">
      <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder={displayPlaceholder}
        value={currentValue}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-80 focus:ring-1 focus:ring-primary outline-none transition"
      />
    </div>
  );
}
