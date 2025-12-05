import { createClient } from "@/utils/supabase/server";
// PERBAIKAN IMPORT: Tambahkan 'Link as LinkIcon'
import { FilePdf, FileText, FileImage, DownloadSimple, CaretLeft, CaretRight, Link as LinkIcon } from "@phosphor-icons/react/dist/ssr";
import SearchInput from "@/components/admin/SearchInput";
import KategoriFilter from "@/components/admin/KategoriFilter";
import { AddArsipButton, ArsipActions } from "@/components/admin/ArsipClient";
import Link from "next/link";

const ITEMS_PER_PAGE = 5;

export default async function ArsipPage(props: {
  searchParams: Promise<{ query?: string; page?: string; kategori?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const query = searchParams?.query || '';
  const kategori = searchParams?.kategori || '';
  const currentPage = Number(searchParams?.page) || 1;
  const itemStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const itemEnd = itemStart + ITEMS_PER_PAGE - 1;

  let dbQuery = supabase
    .from('arsip')
    .select('id, nama_dokumen, kategori, url_file, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(itemStart, itemEnd);

  if (query) dbQuery = dbQuery.ilike('nama_dokumen', `%${query}%`);
  if (kategori) dbQuery = dbQuery.eq('kategori', kategori);

  const { data: arsip, count } = await dbQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

  const getIcon = (kat: string) => {
    if (kat === 'Laporan') return <FileText size={24} className="text-green-500 shrink-0" weight="duotone"/>;
    if (kat === 'Media') return <FileImage size={24} className="text-blue-500 shrink-0" weight="duotone"/>;
    return <FilePdf size={24} className="text-red-500 shrink-0" weight="duotone"/>;
  };

  return (
    <div>
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Arsip Digital</h1>
          <p className="text-gray-500">
             Menampilkan {count} dokumen {kategori ? `kategori ${kategori}` : ''}.
          </p>
        </div>
        <AddArsipButton />
      </header>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-4 border-b border-gray-100 bg-gray-50">
            <SearchInput placeholder="Cari nama dokumen..." />
            <KategoriFilter />
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 min-w-[800px]">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3">Nama Dokumen</th>
                  <th className="px-6 py-3">Kategori</th>
                  <th className="px-6 py-3">Tanggal Upload</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {arsip?.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                      {getIcon(item.kategori)}
                      <div className="flex flex-col">
                          <span className="truncate max-w-[200px] md:max-w-xs font-bold" title={item.nama_dokumen}>{item.nama_dokumen}</span>
                          {/* Tampilkan Link Download / Buka File */}
                          {item.url_file && (
                              <a href={item.url_file} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1">
                                <LinkIcon size={12}/> Lihat File
                              </a>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600 border border-gray-200 font-medium">
                            {item.kategori}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(item.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ArsipActions arsip={item} />
                    </td>
                  </tr>
                ))}
                
                {arsip?.length === 0 && (
                     <tr><td colSpan={4} className="text-center py-12 text-gray-400">Dokumen tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
        </div>

        <div className="p-4 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600 gap-4 border-t border-gray-100">
             <span>Halaman {currentPage} dari {totalPages || 1}</span>
             <div className="flex gap-2">
                <Link
                    href={{ pathname: '/dashboard/arsip', query: { query, page: currentPage - 1, kategori } }}
                    className={`px-3 py-1 border rounded flex items-center gap-1 ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'hover:bg-gray-50'}`}
                >
                    <CaretLeft/> Prev
                </Link>
                <Link
                    href={{ pathname: '/dashboard/arsip', query: { query, page: currentPage + 1, kategori } }}
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