import { createClient } from "@/utils/supabase/server";
import { ArrowDownRight, ArrowUpRight, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import SearchInput from "@/components/admin/SearchInput";
import JenisFilter from "@/components/admin/JenisFilter";
import { AddTransaksiButton, TransaksiActions } from "@/components/admin/KeuanganClient";
import Link from "next/link";
import ExportButton from "@/components/admin/ExportButton";

const ITEMS_PER_PAGE = 5;

// Utility Format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default async function KeuanganPage(props: {
  searchParams: Promise<{ query?: string; page?: string; jenis?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const query = searchParams?.query || '';
  const jenis = searchParams?.jenis || '';
  const currentPage = Number(searchParams?.page) || 1;
  const itemStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const itemEnd = itemStart + ITEMS_PER_PAGE - 1;

  // 1. Query Pagination (Untuk Tabel)
  let dbQuery = supabase
    .from('transaksi')
    .select('*', { count: 'exact' })
    .order('tanggal', { ascending: false }) // Urutkan tanggal terbaru
    .order('created_at', { ascending: false }) 
    .range(itemStart, itemEnd);

  if (query) dbQuery = dbQuery.ilike('keterangan', `%${query}%`);
  if (jenis) dbQuery = dbQuery.eq('jenis', jenis);

  const { data: transactions, count } = await dbQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  // 2. Query Agregat (Untuk Kartu Ringkasan - Saldo Total)
  // Kita ambil semua data (ringan, hanya kolom jumlah & jenis) untuk hitung saldo akurat
  const { data: allTrans } = await supabase
    .from('transaksi')
    .select('jenis, jumlah');

  let totalMasuk = 0;
  let totalKeluar = 0;

  allTrans?.forEach((t) => {
    if (t.jenis === 'masuk') totalMasuk += t.jumlah;
    if (t.jenis === 'keluar') totalKeluar += t.jumlah;
  });

  const saldoTotal = totalMasuk - totalKeluar;

  return (
    <div>
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h1>
          <p className="text-gray-500">Monitoring arus kas dan persembahan.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <ExportButton />
            <AddTransaksiButton />
        </div>
      </header>

      {/* Ringkasan Cards (Real-time Calculation) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
         <div className="bg-white p-6 rounded-xl shadow-sm border border-green-100">
             <p className="text-sm text-gray-500 mb-1 font-medium">Total Pemasukan</p>
             <h3 className="text-xl font-bold text-green-600">{formatRupiah(totalMasuk)}</h3>
         </div>
         <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
             <p className="text-sm text-gray-500 mb-1 font-medium">Total Pengeluaran</p>
             <h3 className="text-xl font-bold text-red-600">{formatRupiah(totalKeluar)}</h3>
         </div>
         <div className="bg-primary text-white p-6 rounded-xl shadow-sm">
             <p className="text-sm text-blue-200 mb-1 font-medium">Saldo Kas Saat Ini</p>
             <h3 className="text-xl font-bold">{formatRupiah(saldoTotal)}</h3>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-gray-100 bg-gray-50">
            <SearchInput placeholder="Cari keterangan transaksi..." />
            <JenisFilter />
        </div>
        
        {/* Tabel */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 min-w-[800px]">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Keterangan</th>
                  <th className="px-6 py-3">Jenis</th>
                  <th className="px-6 py-3 text-right">Jumlah</th>
                  <th className="px-6 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((trx) => (
                  <tr key={trx.id} className="bg-white border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-600">
                        {new Date(trx.tanggal).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate" title={trx.keterangan}>{trx.keterangan}</td>
                    <td className="px-6 py-4">
                        {trx.jenis === 'masuk' ? (
                             <span className="flex items-center text-green-600 text-xs font-bold gap-1 bg-green-50 px-2 py-1 rounded-full w-fit"><ArrowDownRight weight="bold"/> MASUK</span>
                        ) : (
                             <span className="flex items-center text-red-600 text-xs font-bold gap-1 bg-red-50 px-2 py-1 rounded-full w-fit"><ArrowUpRight weight="bold"/> KELUAR</span>
                        )}
                    </td>
                    <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${trx.jenis === 'masuk' ? 'text-green-600' : 'text-red-600'}`}>
                      {trx.jenis === 'masuk' ? '+' : '-'}{formatRupiah(trx.jumlah)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <TransaksiActions trx={trx} />
                    </td>
                  </tr>
                ))}
                
                {transactions?.length === 0 && (
                     <tr><td colSpan={5} className="text-center py-12 text-gray-400">Belum ada transaksi tercatat.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4 border-t border-gray-100">
             <span>Halaman {currentPage} dari {totalPages || 1}</span>
             <div className="flex gap-2">
                <Link
                    href={{ pathname: '/dashboard/keuangan', query: { query, page: currentPage - 1, jenis } }}
                    className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                >
                    <CaretLeft/> Prev
                </Link>
                <Link
                    href={{ pathname: '/dashboard/keuangan', query: { query, page: currentPage + 1, jenis } }}
                    className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                >
                    Next <CaretRight/>
                </Link>
             </div>
        </div>

      </div>
    </div>
  );
}