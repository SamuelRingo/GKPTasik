import { createClient } from "@/utils/supabase/server";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
// import Schedule from "@/components/Schedule"; // Komponen Schedule perlu disesuaikan agar menerima props, atau biarkan statis sebagai preview
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Sun, MusicNotes, Baby } from "@phosphor-icons/react/dist/ssr";


// Agar halaman ini tidak full statis (karena fetch data), kita set revalidate
export const revalidate = 60; // Refresh data setiap 60 detik

export default async function Home() {
  const supabase = await createClient();

  // 1. Ambil Info Gereja
  const { data: settings } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('id', 1)
    .single();

  // 2. Ambil 3 Jadwal Ibadah Terbaru untuk ditampilkan di Beranda
  const { data: jadwalList } = await supabase
    .from('jadwal_ibadah')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(5);

  // Helper Icon berdasarkan kategori/nama
  const getIcon = (kategori: string) => {
    if (kategori === 'Pemuda') return <MusicNotes size={32} weight="fill"/>;
    if (kategori === 'Anak') return <Baby size={32} weight="fill"/>;
    return <Sun size={32} weight="fill"/>;
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Kita bisa passing data settings ke komponen Hero jika ingin teksnya dinamis */}
      {/* Untuk sekarang kita biarkan default, tapi Footer sudah dinamis */}
      <Hero /> 
      
      {/* <div className="py-10 bg-blue-50 text-center">
         <p className="text-primary font-semibold">
            Selamat Datang di Website Resmi {settings?.nama_gereja || 'Gereja Cloud'}
         </p>
      </div> */}

      <About />
      
      {/* BAGIAN JADWAL IBADAH (BARU) */}
      <section id="jadwal" className="py-20 bg-light">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-primary mb-2">Jadwal Ibadah & Kegiatan</h2>
              <p className="text-gray-500">Ikuti kegiatan rohani kami untuk bertumbuh bersama dalam iman.</p>
            </div>
            
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
           </div>

           {/* Tombol Lihat Semua */}
           <div className="text-center mt-12">
              <Link href="/jadwal" className="bg-primary text-white font-bold px-8 py-3 rounded-lg hover:bg-blue-800 transition shadow-lg shadow-blue-500/10 inline-flex items-center gap-2">
                Lihat Semua Jadwal <ArrowRight weight="bold" />
              </Link>
           </div>
        </div>
      </section>
      
      <Footer />
    </main>
  );
}