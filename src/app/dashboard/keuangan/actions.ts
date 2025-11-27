'use server';

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. CREATE
export async function createTransaksi(formData: FormData) {
  const supabase = await createClient();
  
  const data = {
    keterangan: formData.get('keterangan') as string,
    jenis: formData.get('jenis') as string, // 'masuk' atau 'keluar'
    jumlah: Number(formData.get('jumlah')),
    tanggal: formData.get('tanggal') as string,
  };

  const { error } = await supabase.from('transaksi').insert(data);

  if (error) return { error: error.message };
  
  revalidatePath('/dashboard/keuangan');
  return { success: true };
}

// 2. UPDATE
export async function updateTransaksi(formData: FormData) {
  const supabase = await createClient();
  
  const id = formData.get('id') as string;
  const data = {
    keterangan: formData.get('keterangan') as string,
    jenis: formData.get('jenis') as string,
    jumlah: Number(formData.get('jumlah')),
    tanggal: formData.get('tanggal') as string,
  };

  const { error } = await supabase.from('transaksi').update(data).eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/keuangan');
  return { success: true };
}

// 3. DELETE
export async function deleteTransaksi(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('transaksi').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/keuangan');
  return { success: true };
}

// 4. EXPORT TO CSV
export async function exportTransactionsToCSV(query: string, jenis: string) {
  const supabase = await createClient();

  try {
    let dbQuery = supabase
      .from('transaksi')
      .select('tanggal, keterangan, jenis, jumlah')
      .order('tanggal', { ascending: false });

    if (query) dbQuery = dbQuery.ilike('keterangan', `%${query}%`);
    if (jenis) dbQuery = dbQuery.eq('jenis', jenis);
    
    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return { error: 'Tidak ada data untuk diekspor.' };
    }

    // Konversi JSON ke CSV
    const headers = ['Tanggal', 'Keterangan', 'Jenis Transaksi', 'Jumlah'];
    const csvRows = [headers.join(',')];

    for (const row of data) {
      // Pastikan keterangan yang mengandung koma atau kutip dibungkus dengan benar
      const keterangan = `"${row.keterangan.replace(/"/g, '""')}"`;
      const values = [
        new Date(row.tanggal).toLocaleDateString('id-ID'),
        keterangan,
        row.jenis,
        row.jumlah,
      ].join(',');
      csvRows.push(values);
    }

    // Tambahkan ringkasan di bagian bawah
    let totalMasuk = 0;
    let totalKeluar = 0;
    data.forEach(t => {
      if (t.jenis === 'masuk') totalMasuk += t.jumlah;
      if (t.jenis === 'keluar') totalKeluar += t.jumlah;
    });
    const saldoTotal = totalMasuk - totalKeluar;

    csvRows.push(''); // Baris kosong sebagai pemisah
    csvRows.push(`,,Total Pemasukan,${totalMasuk}`);
    csvRows.push(`,,Total Pengeluaran,${totalKeluar}`);
    csvRows.push(`,,Saldo Akhir,${saldoTotal}`);

    return { csv: csvRows.join('\n') };

  } catch (e: any) {
    return { error: e.message };
  }
}