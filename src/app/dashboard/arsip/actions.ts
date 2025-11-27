"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Fungsi untuk mencatat log aktivitas
async function logActivity(aktivitas: string, status: "Sukses" | "Gagal") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      user_name: user.email, // atau ambil dari tabel profiles jika ada
      aktivitas,
      status,
    });
  }
}

// 1. CREATE (Upload File + Insert DB)
export async function createArsip(formData: FormData) {
  const supabase = await createClient();
  
  const nama = formData.get('nama') as string;
  const kategori = formData.get('kategori') as string;
  const file = formData.get('file') as File; // Ambil object File

  if (!file) {
    return { error: "File wajib diupload" };
  }

  // A. Upload File ke Supabase Storage
  // Buat nama file unik: timestamp-namafile.pdf
  const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('arsip')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    await logActivity(`Gagal mengunggah file: ${file.name}`, 'Gagal');
    console.error("Storage error:", uploadError.message);
    return { success: false, message: `Gagal mengunggah file: ${uploadError.message}` };
  }

  // B. Dapatkan Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('arsip')
    .getPublicUrl(fileName);

  // C. Simpan Metadata ke Database
  const arsipData = {
    nama_dokumen: nama,
    kategori: kategori,
    url_file: publicUrl, // Simpan link hasil upload
  };

  const { error: dbError } = await supabase.from("arsip").insert([arsipData]);

  if (dbError) {
    // Jika insert ke DB gagal, coba hapus file yang sudah terupload
    await supabase.storage.from("arsip").remove([fileName]);
    await logActivity(`Gagal menyimpan data arsip: ${file.name}`, 'Gagal');
    console.error("Database error:", dbError.message);
    return { success: false, message: `Gagal menyimpan data arsip: ${dbError.message}` };
  }

  await logActivity(`Mengunggah arsip baru: ${file.name}`, 'Sukses');
  revalidatePath("/dashboard/arsip");
  return { success: true, message: "Arsip berhasil diunggah." };
}

// 2. UPDATE (Hanya Metadata dulu untuk kesederhanaan)
export async function updateArsip(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const data = {
    nama_dokumen: formData.get('nama') as string,
    kategori: formData.get('kategori') as string,
    // Fitur ganti file di update butuh logic hapus file lama,
    // Untuk sekarang kita update nama/kategori saja.
  };

  const { error } = await supabase.from('arsip').update(data).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/arsip');
  return { success: true };
}

// 3. DELETE (Hapus Data DB + Hapus File Storage)
export async function deleteArsip(id: string, url_file: string, nama_dokumen: string) {
  const supabase = await createClient();
  
  // 1. Hapus file dari Storage
  const filePath = url_file.split("/arsip/")[1];
  const { error: storageError } = await supabase.storage.from("arsip").remove([filePath]);

  if (storageError) {
    await logActivity(`Gagal menghapus file arsip dari storage: ${nama_dokumen}`, 'Gagal');
    console.error("Storage error:", storageError.message);
    return { success: false, message: `Gagal menghapus file dari storage: ${storageError.message}` };
  }

  // 2. Hapus record dari Database
  const { error: dbError } = await supabase.from("arsip").delete().eq("id", id);

  if (dbError) {
    // Ini kasus yang jarang terjadi, tapi baik untuk ditangani
    // File di storage sudah terhapus, tapi record di DB gagal dihapus.
    await logActivity(`Gagal menghapus data arsip dari DB: ${nama_dokumen}`, 'Gagal');
    console.error("Database error:", dbError.message);
    return { success: false, message: `Gagal menghapus data arsip: ${dbError.message}` };
  }

  await logActivity(`Menghapus arsip: ${nama_dokumen}`, 'Sukses');
  revalidatePath("/dashboard/arsip");
  return { success: true, message: "Arsip berhasil dihapus." };
}