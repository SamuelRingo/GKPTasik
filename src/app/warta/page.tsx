import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { FilePdf, DownloadSimple, CalendarBlank } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Warta Jemaat | Gereja Kristen Pasundan Tasikmalaya",
};

export default async function WartaPage() {
  const supabase = await createClient();

  // 1. Ambil data Arsip kategori 'Warta' dari Database
  const { data: wartaList } = await supabase
    .from('arsip')
    .select('*')
    .eq('kategori', 'Warta') // Filter hanya Warta
    .order('created_at', { ascending: false }); // Terbaru di atas

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Warta Jemaat" 
        subtitle="Unduh warta jemaat mingguan dan informasi pelayanan terkini."
      />
      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
            
            {/* Grid Warta */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wartaList?.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100 flex flex-col">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                <FilePdf size={32} weight="duotone" />
                            </div>
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                PDF
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                            {item.nama_dokumen}
                        </h3>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                            <CalendarBlank size={16} />
                            <span>
                                {new Date(item.created_at).toLocaleDateString("id-ID", { 
                                    day: 'numeric', month: 'long', year: 'numeric' 
                                })}
                            </span>
                        </div>

                        <div className="mt-auto">
                            <a 
                                href={item.url_file || '#'} 
                                target="_blank"
                                className=" w-full py-3 text-center border border-primary text-primary rounded-lg font-bold hover:bg-primary hover:text-white transition flex items-center justify-center gap-2"
                            >
                                <DownloadSimple size={20} weight="bold"/> Download
                            </a>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {wartaList?.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-500">Belum ada warta jemaat yang diunggah.</p>
                    </div>
                )}
            </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}