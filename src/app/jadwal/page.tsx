import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { Sun, Moon, UsersThree, MusicNotes, Baby } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Jadwal Ibadah | Gereja Kristen Pasundan Tasikmalaya",
};

export default async function JadwalPage() {
  const supabase = await createClient();

  // Fetch Data Jadwal dari DB
  const { data: jadwalList } = await supabase
    .from('jadwal_ibadah')
    .select('*')
    .order('created_at', { ascending: true });

  // Helper Icon berdasarkan kategori/nama
  const getIcon = (kategori: string) => {
    if (kategori === 'Pemuda') return <MusicNotes size={32} weight="fill"/>;
    if (kategori === 'Anak') return <Baby size={32} weight="fill"/>;
    return <Sun size={32} weight="fill"/>;
  };

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Jadwal Ibadah" 
        subtitle=""
      />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Looping Data dari Database */}
              {jadwalList?.map((item) => (
                 <div key={item.id} className="bg-white border border-gray-100 rounded-xl shadow-lg hover:shadow-xl transition p-8 text-center group relative overflow-hidden">
                    <div className="w-16 h-16 mx-auto bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition">
                        {getIcon(item.kategori)}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{item.nama_kegiatan}</h3>
                    
                    <div className="inline-block px-4 py-1 bg-accent/10 text-accent font-bold rounded-full mb-4 text-sm">
                        {item.hari}, {item.jam}
                    </div>
                    
                    <p className="text-gray-500 text-sm">
                        {item.lokasi} <br/>
                        <span className="text-xs text-gray-400">({item.kategori})</span>
                    </p>
                 </div>
              ))}

              {/* Empty State */}
              {jadwalList?.length === 0 && (
                  <div className="col-span-full text-center text-gray-500">
                      Jadwal ibadah belum tersedia.
                  </div>
              )}

           </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}