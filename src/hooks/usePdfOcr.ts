'use client';

import { useState, useCallback } from 'react';
import { setOcrProcessing, updateArsipWithOcr, sendImageToCloudflareWorker } from '@/app/dashboard/arsip/ocr-actions';

export interface UsePdfOcrState {
  isProcessing: boolean;
  progress: number;
  error: string | null;
  status: 'idle' | 'sending' | 'processing' | 'completed' | 'error';
}

interface UsePdfOcrReturn extends UsePdfOcrState {
  processPdfOcrFromUrl: (pdfUrl: string) => Promise<{ success: boolean; text?: string; error?: string }>;
  reset: () => void;
}

// Lazy load pdf.js to avoid SSR issues
let pdfModule: any = null;

async function loadPdfJs() {
  if (pdfModule) return pdfModule;
  
  try {
    // Dynamic import to avoid loading in SSR environment
    const pdfjsLib = await import('pdfjs-dist');
    pdfModule = pdfjsLib;
    
    // Set worker source - use bundled worker
    if (typeof window !== 'undefined') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();
      } catch (e) {
        // Fallback: try loading from node_modules
        console.warn('Could not set worker from import.meta.url, trying fallback');
      }
    }
    
    return pdfjsLib;
  } catch (error) {
    console.error('Failed to load pdf.js:', error);
    throw new Error('Failed to load PDF processing library');
  }
}

export function usePdfOcr(): UsePdfOcrReturn {
  const [state, setState] = useState<UsePdfOcrState>({
    isProcessing: false,
    progress: 0,
    error: null,
    status: 'idle',
  });

  const fetchPdfAsArrayBuffer = useCallback(async (pdfUrl: string): Promise<ArrayBuffer> => {
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  }, []);

  // Convert PDF page to PNG base64
  const convertPdfPageToPng = useCallback(
    async (pdfArrayBuffer: ArrayBuffer, pageNum: number, pdfjsLib: any): Promise<string> => {
      // Clone the ArrayBuffer to prevent detachment errors
      const clonedBuffer = pdfArrayBuffer.slice(0);
      const pdf = await pdfjsLib.getDocument({ data: clonedBuffer }).promise;
      const page = await pdf.getPage(pageNum);
      
      // Scale for better OCR quality
      const scale = 2;
      const viewport = page.getViewport({ scale });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to get canvas context');
      
      // Render page to canvas
      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;
      
      // Convert canvas to PNG base64
      return canvas.toDataURL('image/png').split(',')[1];
    },
    []
  );

  const processPdfOcrFromUrl = useCallback(
    async (pdfUrl: string): Promise<{ success: boolean; text?: string; error?: string }> => {
      try {
        setState((prev) => ({
          ...prev,
          isProcessing: true,
          error: null,
          status: 'sending',
          progress: 10,
        }));

        // Load pdf.js library
        const pdfjsLib = await loadPdfJs();

        setState((prev) => ({
          ...prev,
          progress: 20,
        }));

        // Fetch PDF
        const pdfArrayBuffer = await fetchPdfAsArrayBuffer(pdfUrl);

        setState((prev) => ({
          ...prev,
          progress: 30,
        }));

        // Get credentials
        const workerUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
        const authToken = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_AUTH_TOKEN;

        if (!workerUrl || !authToken) {
          throw new Error('Cloudflare Worker credentials not configured. Add NEXT_PUBLIC_CLOUDFLARE_WORKER_URL and NEXT_PUBLIC_CLOUDFLARE_WORKER_AUTH_TOKEN to .env.local');
        }

        // Clone ArrayBuffer to get total pages (prevents detachment)
        const clonedBufferForInfo = pdfArrayBuffer.slice(0);
        const pdf = await pdfjsLib.getDocument({ data: clonedBufferForInfo }).promise;
        const totalPages = pdf.numPages;
        const allResults: string[] = [];

        // Process each page
        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
          const pageProgress = 30 + Math.floor((pageNum / totalPages) * 60);
          
          setState((prev) => ({
            ...prev,
            progress: pageProgress,
            status: 'processing',
          }));

          try {
            // Convert page to PNG
            const pageImageBase64 = await convertPdfPageToPng(pdfArrayBuffer, pageNum, pdfjsLib);

            // Send to Worker
            const pageResult = await sendImageToCloudflareWorker(
              pageImageBase64,
              workerUrl,
              authToken,
              pageNum,
              totalPages
            );

            if (pageResult.success && pageResult.text) {
              allResults.push(`--- HALAMAN ${pageNum} ---\n${pageResult.text}`);
            }
          } catch (pageError) {
            console.error(`Failed to process page ${pageNum}:`, pageError);
            // Continue with next page instead of failing entirely
          }
        }

        const finalText = allResults.join('\n\n');

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          status: 'completed',
          progress: 100,
          error: null,
        }));

        return {
          success: true,
          text: finalText,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          status: 'error',
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [fetchPdfAsArrayBuffer, convertPdfPageToPng]
  );

  const reset = useCallback(() => {
    setState({
      isProcessing: false,
      progress: 0,
      error: null,
      status: 'idle',
    });
  }, []);

  return {
    ...state,
    processPdfOcrFromUrl,
    reset,
  };
}
