'use client';

import { MagnifyingGlass } from "@phosphor-icons/react";
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

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
  const [inputValue, setInputValue] = useState(searchParams.get('query')?.toString() || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce untuk search di tabel standar
  useEffect(() => {
    if (isOcrView) return; // Skip debounce untuk OCR view

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      // Jangan reset page jika user hanya mengubah search query, pertahankan halaman saat ini
      // Hanya reset ke halaman 1 jika query benar-benar berubah dari kosong ke ada atau sebaliknya
      const currentQuery = searchParams.get('query') || '';
      if (inputValue && !currentQuery) {
        // Baru mulai search, reset ke halaman 1
        params.set('page', '1');
      } else if (!inputValue && currentQuery) {
        // Menghapus search query, reset ke halaman 1
        params.set('page', '1');
      }
      // Jika hanya update query (tidak beralih dari search ke non-search), pertahankan halaman

      if (inputValue) {
        params.set('query', inputValue);
      } else {
        params.delete('query');
      }
      
      replace(`${pathname}?${params.toString()}`);
    }, 1000); // 1 detik delay

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputValue, isOcrView, pathname, replace, searchParams]);

  const handleSearch = (term: string) => {
    if (isOcrView) {
      // Di view OCR, update state local tanpa URL change (instant)
      onOcrSearchChange?.(term);
    } else {
      // Di view Standar, update input value (debounced URL change di useEffect)
      setInputValue(term);
    }
  };

  const displayPlaceholder = isOcrView 
    ? "Cari teks dalam hasil OCR..." 
    : "Cari nama dokumen...";

  const currentValue = isOcrView ? ocrSearchQuery : inputValue;

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
