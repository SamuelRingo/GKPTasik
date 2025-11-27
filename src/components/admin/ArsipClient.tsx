'use client';

import { useState } from "react";
import { Plus, PencilSimple, Trash, X, UploadSimple, FileArrowUp } from "@phosphor-icons/react"; // Update Ikon
import { createArsip, updateArsip, deleteArsip } from "@/app/dashboard/arsip/actions";
import toast from "react-hot-toast";

type Arsip = {
  id: string;
  nama_dokumen: string;
  kategori: string | null;
  url_file: string | null;
  created_at: string;
};

// --- KOMPONEN 1: ADD BUTTON & MODAL (FILE UPLOAD) ---
export function AddArsipButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>(""); // State untuk nama file

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Mengupload file ke server...');
    
    const res = await createArsip(formData);
    
    toast.dismiss(loadingToast);

    if (res?.error) {
        toast.error(`Gagal: ${res.error}`);
    } else {
        toast.success('Dokumen berhasil diupload!');
        setIsOpen(false);
        setFileName(""); // Reset
    }
    setIsLoading(false);
  };

  // Helper untuk menampilkan nama file saat dipilih
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFileName(e.target.files[0].name);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm w-full md:w-auto justify-center"
      >
        <Plus weight="bold" /> Upload Dokumen
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">Upload Arsip Baru</h3>
                <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen</label>
                    <input name="nama" type="text" required className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" placeholder="Contoh: Warta Jemaat 20 Nov" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select name="kategori" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white">
                        <option value="Warta">Warta Jemaat</option>
                        <option value="Laporan">Laporan Keuangan</option>
                        <option value="Dokumen">Dokumen Legal</option>
                        <option value="Media">Media & Foto</option>
                    </select>
                </div>
                
                {/* INPUT FILE CUSTOM UI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition relative">
                        <input 
                            name="file" 
                            type="file" 
                            required 
                            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center text-gray-500">
                            <UploadSimple size={32} className="text-primary mb-2" />
                            <span className="text-sm font-medium text-gray-900">
                                {fileName ? fileName : "Klik untuk pilih file"}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">PDF, JPG, Word, Excel (Max 10MB)</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Batal</button>
                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 flex justify-center items-center gap-2">
                        {isLoading ? 'Uploading...' : <><FileArrowUp size={20} weight="bold"/> Upload</>}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- KOMPONEN 2: ACTIONS ---
export function ArsipActions({ arsip }: { arsip: Arsip }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = async (formData: FormData) => {
    const toastId = toast.loading('Update data...');
    const res = await updateArsip(formData);
    toast.dismiss(toastId);
    if (res?.error) toast.error(res.error);
    else {
        toast.success('Data diupdate!');
        setIsEditOpen(false);
    }
  };

  const handleDelete = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-xl flex ring-1 ring-black ring-opacity-5 overflow-hidden`}>
        <div className="flex-1 p-4 flex items-start">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                 <Trash size={20} className="text-red-600" weight="bold" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-bold text-gray-900">Hapus Dokumen?</p>
              <p className="mt-1 text-sm text-gray-500">File <b>{arsip.nama_dokumen}</b> akan dihapus dari penyimpanan cloud.</p>
            </div>
        </div>
        <div className="flex flex-col border-l border-gray-200">
          <button onClick={async () => {
              toast.dismiss(t.id);
              const load = toast.loading('Menghapus file...');
              // Pass URL File juga untuk dihapus di storage
              if (arsip.url_file) {
                await deleteArsip(arsip.id, arsip.url_file as string, arsip.nama_dokumen);
              }
              toast.dismiss(load);
              toast.success('Terhapus');
            }} 
            className="w-full border-b border-gray-200 p-3 text-sm font-bold text-red-600 hover:bg-red-50">Hapus</button>
          <button onClick={() => toast.dismiss(t.id)} className="w-full p-3 text-sm text-gray-600 hover:bg-gray-50">Batal</button>
        </div>
      </div>
    ));
  };

  return (
    <div className="flex justify-end gap-2">
      <button onClick={() => setIsEditOpen(true)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"><PencilSimple size={18} weight="bold"/></button>
      <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded transition"><Trash size={18} weight="bold"/></button>

      {/* Modal Edit (Metadata Only) */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b bg-blue-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-primary">Edit Arsip</h3>
                <button onClick={() => setIsEditOpen(false)}><X size={24}/></button>
            </div>
            <form action={handleEdit} className="p-6 space-y-4">
                <input type="hidden" name="id" value={arsip.id} />
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen</label>
                    <input name="nama" defaultValue={arsip.nama_dokumen} type="text" required className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select name="kategori" defaultValue={arsip.kategori || "Warta"} className="w-full px-4 py-2 border rounded-lg bg-white">
                        <option value="Warta">Warta Jemaat</option>
                        <option value="Laporan">Laporan Keuangan</option>
                        <option value="Dokumen">Dokumen Legal</option>
                        <option value="Media">Media & Foto</option>
                    </select>
                </div>
                <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-700">
                    Untuk mengganti file, silakan hapus dokumen ini lalu upload ulang.
                </div>
                <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-bold">Simpan Perubahan</button>
            </form>
           </div>
        </div>
      )}
    </div>
  );
}