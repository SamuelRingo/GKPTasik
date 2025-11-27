'use client';

import { useState } from "react";
import { Plus, Trash, X, Bank } from "@phosphor-icons/react";
import { createRekening, deleteRekening } from "@/app/dashboard/rekening/actions";
import toast from "react-hot-toast";

type Rekening = {
  id: string;
  nama_bank: string;
  nomor_rekening: string | null;
  atas_nama: string | null;
};

export function AddRekeningButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const load = toast.loading('Menyimpan rekening...');
    const res = await createRekening(formData);
    toast.dismiss(load);

    if (res?.error) toast.error(res.error);
    else { toast.success('Rekening berhasil ditambahkan!'); setIsOpen(false); }
    setIsLoading(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm">
        <Plus weight="bold" /> Tambah Rekening
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800">Tambah Info Rekening</h3>
                <button onClick={() => setIsOpen(false)}><X size={24} /></button>
            </div>
            <form action={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank / E-Wallet</label>
                    <input name="bank" type="text" required placeholder="BCA / Mandiri / QRIS" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                    <input name="norek" type="text" placeholder="123-456-789" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                    <input name="an" type="text" required placeholder="Gereja Kristen Pasundan Tasikmalaya" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-800 transition">
                    {isLoading ? 'Menyimpan...' : 'Simpan Rekening'}
                </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteRekeningButton({ id, bank }: { id: string, bank: string }) {
  const handleDelete = () => {
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}>
        <div className="p-4 flex items-center">
            <div className="shrink-0"><Trash size={24} className="text-red-500" /></div>
            <div className="ml-3"><p className="text-sm font-medium">Hapus {bank}?</p></div>
        </div>
        <div className="flex border-t">
          <button onClick={async () => { toast.dismiss(t.id); await deleteRekening(id); toast.success('Terhapus'); }} className="w-full border-r p-3 text-sm text-red-600 hover:bg-red-50">Ya</button>
          <button onClick={() => toast.dismiss(t.id)} className="w-full p-3 text-sm text-gray-700 hover:bg-gray-50">Batal</button>
        </div>
      </div>
    ));
  };

  return <button onClick={handleDelete} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash size={18}/></button>;
}