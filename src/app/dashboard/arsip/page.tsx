import { createClient } from "@/utils/supabase/server";
import { AddArsipButton } from "@/components/admin/ArsipClient";
import { ArsipPageContent } from "@/components/admin/ArsipPageContent";

const ITEMS_PER_PAGE = 5;

async function getArsipData(query: string, kategori: string, page: number) {
  const supabase = await createClient();
  const itemStart = (page - 1) * ITEMS_PER_PAGE;
  const itemEnd = itemStart + ITEMS_PER_PAGE - 1;

  let dbQuery = supabase
    .from('arsip')
    .select('id, nama_dokumen, kategori, url_file, created_at, status_ocr, hasil_ocr', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(itemStart, itemEnd);

  // Cari di nama_dokumen saja di server (client-side filter untuk hasil_ocr)
  if (query) {
    dbQuery = dbQuery.ilike('nama_dokumen', `%${query}%`);
  }
  if (kategori) dbQuery = dbQuery.eq('kategori', kategori);

  const { data: arsip, count } = await dbQuery;
  const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);
  
  return { arsip: arsip || [], count: count || 0, totalPages };
}

export default async function ArsipPage(props: {
  searchParams: Promise<{ query?: string; page?: string; kategori?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const kategori = searchParams?.kategori || '';
  const currentPage = Number(searchParams?.page) || 1;

  const { arsip, count, totalPages } = await getArsipData(query, kategori, currentPage);

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

      <ArsipPageContent
        arsip={arsip}
        count={count}
        currentPage={currentPage}
        totalPages={totalPages}
        query={query}
        kategori={kategori}
      />
    </div>
  );
}