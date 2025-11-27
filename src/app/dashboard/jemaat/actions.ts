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

// 1. CREATE (Tambah Jemaat)
export async function createJemaat(formData: FormData) {
  const supabase = await createClient();

  const rawFormData = {
    nama_lengkap: formData.get("nama_lengkap") as string,
    wilayah: formData.get("wilayah") as string,
    telepon: formData.get("telepon") as string,
    status: formData.get("status") as string,
  };

  const { error } = await supabase.from("jemaat").insert([rawFormData]);

  if (error) {
    await logActivity(
      `Gagal menambah jemaat: ${rawFormData.nama_lengkap}`,
      "Gagal"
    );
    console.error("Supabase error:", error.message);
    return { success: false, message: `Gagal menambahkan jemaat: ${error.message}` };
  }

  await logActivity(`Menambah jemaat baru: ${rawFormData.nama_lengkap}`, "Sukses");
  revalidatePath("/dashboard/jemaat");
  return { success: true, message: "Jemaat berhasil ditambahkan." };
}

// 2. UPDATE (Edit Jemaat)
export async function updateJemaat(id: string, formData: FormData) {
  const supabase = await createClient();
  const rawFormData = {
    nama_lengkap: formData.get("nama_lengkap") as string,
    wilayah: formData.get("wilayah") as string,
    telepon: formData.get("telepon") as string,
    status: formData.get("status") as string,
  };

  const { error } = await supabase.from("jemaat").update(rawFormData).eq("id", id);

  if (error) {
    await logActivity(
      `Gagal memperbarui jemaat: ${rawFormData.nama_lengkap}`,
      "Gagal"
    );
    console.error("Supabase error:", error.message);
    return { success: false, message: `Gagal memperbarui jemaat: ${error.message}` };
  }

  await logActivity(`Memperbarui jemaat: ${rawFormData.nama_lengkap}`, "Sukses");
  revalidatePath("/dashboard/jemaat");
  return { success: true, message: "Jemaat berhasil diperbarui." };
}

// 3. DELETE (Hapus Jemaat)
export async function deleteJemaat(id: string, nama: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("jemaat").delete().eq("id", id);

  if (error) {
    await logActivity(`Gagal menghapus jemaat: ${nama}`, "Gagal");
    console.error("Supabase error:", error.message);
    return { success: false, message: `Gagal menghapus jemaat: ${error.message}` };
  }

  await logActivity(`Menghapus jemaat: ${nama}`, "Sukses");
  revalidatePath("/dashboard/jemaat");
  return { success: true, message: "Jemaat berhasil dihapus." };
}

// 4. EXPORT TO CSV
export async function exportJemaatToCSV(query: string, wilayah: string) {
  const supabase = await createClient();

  try {
    let dbQuery = supabase
      .from("jemaat")
      .select("nama_lengkap, wilayah, telepon, status")
      .order("nama_lengkap", { ascending: true });

    if (query) dbQuery = dbQuery.ilike("nama_lengkap", `%${query}%`);
    if (wilayah) dbQuery = dbQuery.eq("wilayah", wilayah);

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { error: "Tidak ada data untuk diekspor." };
    }

    // Konversi JSON ke CSV
    const headers = ["Nama Lengkap", "Wilayah", "No. Telepon", "Status"];
    const csvRows = [headers.join(",")];

    for (const row of data) {
      // Pastikan nama yang mengandung koma atau kutip dibungkus dengan benar
      const nama = `"${row.nama_lengkap.replace(/"/g, '""')}"`;
      const telepon = row.telepon ? `"${row.telepon.replace(/"/g, '""')}"` : '"-"';
      const values = [nama, row.wilayah || "-", telepon, row.status || "-"].join(",");
      csvRows.push(values);
    }

    // Tambahkan ringkasan di bagian bawah
    csvRows.push(""); // Baris kosong sebagai pemisah
    csvRows.push(`Total Data: ${data.length}`);

    return { csv: csvRows.join("\n") };
  } catch (e: any) {
    return { error: e.message };
  }
}