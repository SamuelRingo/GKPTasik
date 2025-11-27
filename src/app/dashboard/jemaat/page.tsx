import { createClient } from "@/utils/supabase/server";
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr"; // Funnel dihapus karena pindah ke component
import SearchInput from "@/components/admin/SearchInput"; 
import WilayahFilter from "@/components/admin/WilayahFilter"; // 1. Import Filter Baru
import JemaatExportButton from "@/components/admin/JemaatExportButton"; // Import Export Button
import Link from "next/link";
import { AddJemaatButton, ActionButtons } from "@/components/admin/JemaatClient"; 

const ITEMS_PER_PAGE = 5;

export default async function JemaatPage(props: {
  searchParams: Promise<{ query?: string; page?: string; wilayah?: string }>; // 2. Tambah tipe 'wilayah'
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  
  // 3. Ambil parameter
  const query = searchParams?.query || '';
  const wilayah = searchParams?.wilayah || ''; // Ambil wilayah dari URL
  const currentPage = Number(searchParams?.page) || 1;
  
  const itemStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const itemEnd = itemStart + ITEMS_PER_PAGE - 1;

  // 4. Mulai Query
  let dbQuery = supabase
    .from('jemaat')
    .select('*', { count: 'exact' }) 
    .order('created_at', { ascending: false })
    .range(itemStart, itemEnd);

  // 5. Terapkan Filter Pencarian (Nama)
  if (query) {
    dbQuery = dbQuery.ilike('nama_lengkap', `%${query}%`);
  }

  // 6. Terapkan Filter Wilayah (Baru)
  if (wilayah) {
    dbQuery = dbQuery.eq('wilayah', wilayah);
  }

  const { data: jemaat, count } = await dbQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  return (
    <div>
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Database Jemaat</h1>
          <p className="text-gray-500">
            {/* Update teks total agar dinamis sesuai filter */}
            Menampilkan {count} data {wilayah ? `dari ${wilayah}` : ''} {query ? `pencarian "${query}"` : ''}
          </p>
        </div>
        <AddJemaatButton />
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100 bg-gray-50">
            <SearchInput placeholder="Cari nama jemaat..." />
            
            {/* 7. Pasang Komponen Filter Disini */}
            <div className="flex gap-2 w-full md:w-auto">
              <WilayahFilter />
              <JemaatExportButton />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 min-w-[900px]">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">ID Database</th>
                  <th className="px-6 py-3">Nama Lengkap</th>
                  <th className="px-6 py-3">Wilayah</th>
                  <th className="px-6 py-3">No. Telepon</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-center">Opsi</th>
                </tr>
              </thead>
              <tbody>
                {jemaat?.map((person) => (
                  <tr key={person.id} className="bg-white border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-mono text-gray-400 text-xs">
                        #{person.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{person.nama_lengkap}</td>
                    <td className="px-6 py-4">
                        {/* Highlight Wilayah jika sedang difilter */}
                        <span className={wilayah ? "font-bold text-primary" : ""}>
                            {person.wilayah || '-'}
                        </span>
                    </td>
                    <td className="px-6 py-4">{person.telepon || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          person.status === 'Aktif' ? 'bg-green-100 text-green-700' : 
                          person.status === 'Pindah' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <ActionButtons jemaat={person} />
                    </td>
                  </tr>
                ))}

                {jemaat?.length === 0 && (
                    <tr>
                        <td colSpan={6} className="text-center py-12 text-gray-400">
                            Data tidak ditemukan
                            {wilayah && <span> untuk filter <b>{wilayah}</b></span>}.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4 border-t border-gray-100">
            <span>Halaman {currentPage} dari {totalPages || 1}</span>
            <div className="flex gap-2">
                {/* Pagination Links perlu menyertakan parameter wilayah agar tidak hilang saat pindah halaman */}
                <Link
                    href={{
                        pathname: '/dashboard/jemaat',
                        query: { 
                            query: query, 
                            page: currentPage - 1, 
                            wilayah: wilayah // Persist filter
                        }
                    }}
                    className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                    <CaretLeft /> Prev
                </Link>

                <Link
                    href={{
                        pathname: '/dashboard/jemaat',
                        query: { 
                            query: query, 
                            page: currentPage + 1, 
                            wilayah: wilayah // Persist filter
                        }
                    }}
                    className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-gray-50' : 'hover:bg-gray-50'}`}
                >
                    Next <CaretRight />
                </Link>
            </div>
        </div>

      </div>
    </div>
  );
}