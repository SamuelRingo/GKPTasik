'use client';

import { useEffect, useState, useRef } from 'react';
import { usePdfOcr } from '@/hooks/usePdfOcr';
import { setOcrProcessing, updateArsipWithOcr } from '@/app/dashboard/arsip/ocr-actions';
import toast from 'react-hot-toast';
import { Warning, X } from '@phosphor-icons/react';

interface OcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  arsipId: string;
  fileUrl: string;
  namaDokumen: string;
}

export function OcrModal({ isOpen, onClose, onSuccess, arsipId, fileUrl, namaDokumen }: OcrModalProps) {
  const [showResults, setShowResults] = useState(false);
  const [ocrResults, setOcrResults] = useState<string>('');
  const hasStartedRef = useRef(false);
  const { processPdfOcrFromUrl, isProcessing, progress, error: ocrError, status } = usePdfOcr();

  // Auto-start OCR when modal opens (only once per open)
  useEffect(() => {
    if (isOpen && !hasStartedRef.current) {
      hasStartedRef.current = true;
      handleStartOcr();
    }
  }, [isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasStartedRef.current = false;
    }
  }, [isOpen]);

  const handleStartOcr = async () => {
    const ocrToast = toast.loading(`Memproses OCR: ${namaDokumen}...`);

    try {
      // Set status to processing
      await setOcrProcessing(arsipId);

      const result = await processPdfOcrFromUrl(fileUrl);

      toast.dismiss(ocrToast);

      if (result.success && result.text) {
        setOcrResults(result.text);
        setShowResults(true);
        toast.success(`OCR berhasil!`);
      } else {
        const errorMsg = result.error || 'Terjadi kesalahan yang tidak diketahui';
        console.error('OCR Error:', errorMsg);
        toast.error(`Gagal OCR: ${errorMsg}`);
        await updateArsipWithOcr(arsipId, '', 'error');
        // Close modal after 3 seconds so user sees error message
        setTimeout(() => {
          handleClose();
        }, 3000);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses OCR';
      console.error('OCR Exception:', err);
      toast.dismiss(ocrToast);
      toast.error(errorMsg);
      await updateArsipWithOcr(arsipId, '', 'error');
      // Close modal after 3 seconds so user sees error message
      setTimeout(() => {
        handleClose();
      }, 3000);
    }
  };

  const handleClose = () => {
    setShowResults(false);
    setOcrResults('');
    onClose();
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking on the backdrop itself, not the modal
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      {/* Progress Modal */}
      {isProcessing && !showResults && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-blue-50">
            <h3 className="font-bold text-lg text-gray-800">Proses OCR</h3>
            <p className="text-xs text-gray-600 mt-1">{namaDokumen}</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Status */}
            <div className="flex items-center gap-3">
              {(status === 'sending' || status === 'processing') && (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              )}
              {status === 'completed' && (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <Warning size={20} className="text-red-500" weight="bold" />
              )}
              <span className="text-sm font-medium text-gray-700 capitalize">
                {status === 'sending' && `Mengirim PDF ke Worker...`}
                {status === 'processing' && `Memproses OCR...`}
                {status === 'completed' && 'OCR Selesai!'}
                {status === 'error' && 'Terjadi Kesalahan'}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Progress Text */}
            <p className="text-xs text-gray-500 text-center">{progress}% Selesai</p>

            {/* Error Message */}
            {ocrError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">{ocrError}</p>
                <button
                  onClick={handleStartOcr}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResults && !isProcessing && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[80vh] flex flex-col">
          <div className="p-6 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800">Hasil OCR</h3>
              <p className="text-xs text-gray-600 mt-1">{namaDokumen}</p>
            </div>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <div className="bg-gray-50 rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700 font-mono max-h-96 overflow-y-auto">
              {ocrResults}
            </div>
          </div>
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={async () => {
                const saveToast = toast.loading('Menyimpan hasil OCR...');
                const saveRes = await updateArsipWithOcr(arsipId, ocrResults, 'completed');
                toast.dismiss(saveToast);
                if (saveRes.success) {
                  toast.success('Hasil OCR berhasil disimpan!');
                  onSuccess?.();
                  handleClose();
                } else {
                  toast.error('Gagal menyimpan hasil OCR');
                }
              }}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800"
            >
              Simpan Hasil
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
