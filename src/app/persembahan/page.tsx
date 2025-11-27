import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { Heart, HandCoins, QrCode, Bank, Copy } from "@phosphor-icons/react/dist/ssr";

export const metadata = {
  title: "Persembahan Kasih | Gereja Kristen Pasundan Tasikmalaya",
};

export default async function PersembahanPage() {
  const supabase = await createClient();

  // Fetch Data Rekening yang Aktif
  const { data: rekeningList } = await supabase
    .from('rekening_gereja')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  // Pisahkan QRIS dan Transfer Bank Biasa
  const bankAccounts = rekeningList?.filter(r => r.nama_bank !== 'QRIS') || [];
  const qrisData = rekeningList?.find(r => r.nama_bank === 'QRIS');

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Persembahan Kasih" 
        subtitle="Mendukung pelayanan gereja secara digital."
      />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden mb-12">
                    {/* Decor */}
                    <Heart weight="fill" className="text-[200px] absolute -top-10 -right-10 text-white/5" />
                    
                    <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">Rekening GKP Tasikmalaya</h2>
                    <p className="text-blue-100 mb-8 relative z-10">
                        "Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan." (2 Korintus 9:7)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {/* Loop Rekening Bank */}
                        {bankAccounts.map((bank) => (
                            <div key={bank.id} className="bg-white text-gray-800 rounded-xl p-6 shadow-lg text-left flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-primary shrink-0">
                                    <Bank size={24} weight="fill"/>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase">{bank.nama_bank}</p>
                                    <h3 className="text-xl font-bold text-primary tracking-wide">{bank.nomor_rekening}</h3>
                                    <p className="text-sm text-gray-600 truncate">a.n {bank.atas_nama}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bagian QRIS (Jika ada data QRIS di database) */}
                {qrisData && (
                    <div className="text-center mt-12">
                        <div className="relative">
                             <span className="bg-white px-4 text-gray-400 text-sm font-medium relative z-10">SCAN QRIS (GOPAY / OVO / DANA)</span>
                             <div className="absolute top-1/2 left-0 w-full border-t border-gray-200 z-0"></div>
                        </div>
                        
                        <div className="mt-8 flex flex-col items-center">
                            <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm inline-block">
                                {qrisData.qris_image_url ? (
                                    // Jika admin upload gambar QRIS
                                    <img src={qrisData.qris_image_url} alt="QRIS Code" className="w-48 h-48 object-contain" />
                                ) : (
                                    // Fallback icon jika belum ada gambar
                                    <div className="w-48 h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                                        <QrCode size={64} />
                                    </div>
                                )}
                            </div>
                            <p className="mt-4 text-sm text-gray-500">a.n {qrisData.atas_nama}</p>
                        </div>
                    </div>
                )}
            </div>

        </div>
      </section>
      <Footer />
    </main>
  );
}