import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { Envelope, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import ContactForm from "@/components/ContactForm"; // 1. Import komponen baru

export default async function KontakPage() {
  const supabase = await createClient();

  // Ambil Info Gereja dari Database
  const { data: settings } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('id', 1)
    .single();

  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Hubungi Kami" 
        subtitle=""
      />
      
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Kolom Informasi Kontak */}
                <div className="lg:w-1/3 space-y-8">
                    <div>
                        <h3 className="text-2xl font-bold text-primary mb-6">Informasi Sekretariat</h3>
                        <p className="text-gray-600 mb-6">
                             {settings?.nama_gereja || 'Gereja Kristen Pasundan Jemaat Tasikmalaya'}
                        </p>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary shrink-0">
                            <MapPin size={24} weight="fill"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Alamat</h4>
                            <p className="text-gray-500">{settings?.alamat}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary shrink-0">
                            <Phone size={24} weight="fill"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Telepon</h4>
                            <p className="text-gray-500">{settings?.telepon}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary shrink-0">
                            <Envelope size={24} weight="fill"/>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Email</h4>
                            <p className="text-gray-500">{settings?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Kolom Form Kontak (Client Component) */}
                <div className="lg:w-2/3 bg-gray-50 p-8 md:p-10 rounded-2xl">
                    <h3 className="text-2xl font-bold text-primary mb-6">Kirim Pesan</h3>
                    
                    {/* 2. Panggil Komponen Form Disini */}
                    <ContactForm />
                    
                </div>

            </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}