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
  const file = formData.get('file') as File;

  if (!file) {
    return { success: false, message: "File wajib diupload" };
  }

  // A. Panggil Cloudflare Worker untuk OCR
  const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
  const authToken = process.env.CLOUDFLARE_WORKER_AUTH_TOKEN;

  if (!workerUrl || !authToken) {
    console.error("Cloudflare Worker URL or Auth Token is not configured.");
    return { success: false, message: "Konfigurasi OCR tidak lengkap. Silakan hubungi administrator." };
  }

  let hasil_ocr = '';
  try {
    const ocrFormData = new FormData();
    ocrFormData.append('file', file);

    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: ocrFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request ke Cloudflare AI gagal, status: ${response.status}, pesan: ${errorText}`);
    }

    const result = await response.json();
    hasil_ocr = result.text || '';
    if (!hasil_ocr) {
        console.warn(`OCR berhasil tapi tidak ada teks yang terdeteksi untuk file: ${file.name}`);
    }

  } catch (e: any) {
    console.error("OCR processing error:", e);
    await logActivity(`Gagal memproses OCR untuk file: ${file.name}`, 'Gagal');
    return { success: false, message: `Gagal memproses OCR: ${e.message}` };
  }


  // B. Upload File ke Supabase Storage
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

  // C. Dapatkan Public URL
  const { data: { publicUrl } } = supabase
    .storage
    .from('arsip')
    .getPublicUrl(fileName);

  // D. Simpan Metadata dan Hasil OCR ke Database
  const arsipData = {
    nama_dokumen: nama,
    kategori: kategori,
    url_file: publicUrl,
    hasil_ocr: hasil_ocr, // Simpan hasil OCR
  };

  const { error: dbError } = await supabase.from("arsip").insert([arsipData]);

  if (dbError) {
    // Jika insert ke DB gagal, coba hapus file yang sudah terupload
    await supabase.storage.from("arsip").remove([fileName]);
    await logActivity(`Gagal menyimpan data arsip: ${file.name}`, 'Gagal');
    console.error("Database error:", dbError.message);
    return { success: false, message: `Gagal menyimpan data arsip: ${dbError.message}` };
  }

  await logActivity(`Mengunggah arsip baru: ${file.name} (dengan OCR)`, 'Sukses');
  revalidatePath("/dashboard/arsip");
  return { success: true, message: "Arsip berhasil diunggah dan diproses." };
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