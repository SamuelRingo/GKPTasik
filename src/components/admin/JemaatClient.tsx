'use client';

import { useState } from "react";
import { UserPlus, PencilSimple, Trash, X, FloppyDisk } from "@phosphor-icons/react";
import { createJemaat, updateJemaat, deleteJemaat } from "@/app/dashboard/jemaat/actions";
import toast from "react-hot-toast";

// Tipe data Jemaat
type Jemaat = {
  id: string;
  nama_lengkap: string;
  wilayah: string | null;
  telepon: string | null;
  status: string | null;
};

// --- KOMPONEN 1: TOMBOL TAMBAH & MODAL ---
export function AddJemaatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Menyimpan data ke database...');

    const res = await createJemaat(formData);
    
    toast.dismiss(loadingToast); // Tutup loading

    if (!res.success) {
        toast.error(`Gagal menyimpan: ${res.message}`);
    } else {
        toast.success('Data Jemaat berhasil ditambahkan!');
        setIsOpen(false); // Tutup modal hanya jika sukses
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-accent hover:bg-amber-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm w-full md:w-auto justify-center"
      >
        <UserPlus weight="bold" /> Tambah Jemaat
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">Tambah Jemaat Baru</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition"><X size={24} /></button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input name="nama_lengkap" type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary transition" placeholder="Contoh: Budi Santoso" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                    <select name="wilayah" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white transition">
                        <option value="Wilayah 1">Wilayah 1</option>
                        <option value="Wilayah 2">Wilayah 2</option>
                        <option value="Wilayah 3">Wilayah 3</option>
                        <option value="Wilayah 4">Wilayah 4</option>
                        <option value="Wilayah 5">Wilayah 5</option>
                        <option value="Umum">Umum</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                    <input name="telepon" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary transition" placeholder="08xx-xxxx-xxxx" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white transition">
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                        <option value="Pindah">Pindah</option>
                        <option value="Meninggal">Meninggal</option>
                    </select>
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition">Batal</button>
                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 flex justify-center items-center gap-2 font-bold transition shadow-md disabled:opacity-70">
                        {isLoading ? 'Menyimpan...' : <><FloppyDisk size={20} weight="bold"/> Simpan</>}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- KOMPONEN 2: TOMBOL AKSI (EDIT & CUSTOM DELETE) ---
export function ActionButtons({ jemaat }: { jemaat: Jemaat }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handler Edit
  const handleEdit = async (formData: FormData) => {
    setIsLoading(true);
    const loadingToast = toast.loading('Memperbarui data...');
    
    const res = await updateJemaat(jemaat.id, formData);
    
    toast.dismiss(loadingToast);
    
    if (!res.success) {
        toast.error(`Gagal update: ${res.message}`);
    } else {
        toast.success('Data berhasil diperbarui!');
        setIsEditOpen(false);
    }
    setIsLoading(false);
  };

  // Handler Delete dengan Custom UI Toast
  const handleDelete = () => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden`}
      >
        {/* Icon & Text Area */}
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                 <Trash size={20} className="text-red-600" weight="bold" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-gray-900">
                Hapus Data Jemaat?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Anda akan menghapus data <b>{jemaat.nama_lengkap}</b>. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>
        </div>
        
        {/* Action Buttons Area */}
        <div className="flex border-l border-gray-200">
          <button
            onClick={async () => {
              toast.dismiss(t.id); // Tutup dialog konfirmasi
              const loadingId = toast.loading('Menghapus data...'); // Tampilkan loading
              
              const res = await deleteJemaat(jemaat.id, jemaat.nama_lengkap); // Call Server Action
              
              toast.dismiss(loadingId); // Tutup loading
              if (!res.success) {
                  toast.error(`Gagal: ${res.message}`);
              } else {
                  toast.success('Data berhasil dihapus permanen.');
              }
            }}
            className="w-full border border-transparent rounded-none rounded-r-none p-4 flex items-center justify-center text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition focus:outline-none"
          >
            Hapus
          </button>
        </div>
        <div className="flex border-l border-gray-200">
            <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50 transition focus:outline-none"
            >
                Batal
            </button>
        </div>
      </div>
    ), { 
        duration: Infinity, // Tidak hilang otomatis sampai diklik
        position: 'top-center' 
    });
  };

  return (
    <div className="flex justify-center gap-2">
      <button 
        onClick={() => setIsEditOpen(true)} 
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
        title="Edit Data"
      >
        <PencilSimple size={20} weight="bold" />
      </button>

      <button 
        onClick={handleDelete} 
        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition"
        title="Hapus Data"
      >
        <Trash size={20} weight="bold" />
      </button>

      {/* Modal Edit */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                <h3 className="font-bold text-lg text-primary">Edit Data Jemaat</h3>
                <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-primary transition"><X size={24} /></button>
            </div>
            <form action={handleEdit} className="p-6 space-y-4">
                <input type="hidden" name="id" value={jemaat.id} />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input name="nama_lengkap" defaultValue={jemaat.nama_lengkap} type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                    <select name="wilayah" defaultValue={jemaat.wilayah || "Umum"} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white transition">
                        <option value="Wilayah 1">Wilayah 1</option>
                        <option value="Wilayah 2">Wilayah 2</option>
                        <option value="Wilayah 3">Wilayah 3</option>
                        <option value="Umum">Umum</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
                    <input name="telepon" defaultValue={jemaat.telepon || ""} type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary transition" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" defaultValue={jemaat.status || "Aktif"} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary bg-white transition">
                        <option value="Aktif">Aktif</option>
                        <option value="Non-Aktif">Non-Aktif</option>
                        <option value="Pindah">Pindah</option>
                        <option value="Meninggal">Meninggal</option>
                    </select>
                </div>
                <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition">Batal</button>
                    <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-800 flex justify-center items-center gap-2 font-bold shadow-md transition disabled:opacity-70">
                        {isLoading ? 'Menyimpan...' : <><FloppyDisk size={20} weight="bold"/> Simpan</>}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}