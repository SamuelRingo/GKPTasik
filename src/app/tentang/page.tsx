import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import About from "@/components/About";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang Kami | Gereja Kristen Pasundan Tasikmalaya",
};

export default function TentangPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Tentang Kami" 
        subtitle=""
      />
      {/* Kita reuse komponen About yang sudah ada */}
      <About /> 
      
      {/* Tambahan konten spesifik halaman ini jika perlu */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
            <h3 className="text-2xl font-bold text-primary mb-8">Teknologi yang Digunakan</h3>
            <div className="flex flex-wrap justify-center gap-4">
                {['Next.js 14', 'React', 'Tailwind CSS', 'Cloud Storage', 'Digital Encryption', 'Real-time Database'].map((tech) => (
                    <span key={tech} className="px-6 py-3 bg-white border border-gray-200 rounded-full text-gray-600 shadow-sm font-medium">
                        {tech}
                    </span>
                ))}
            </div>
        </div>
      </section> */}
      <Footer />
    </main>
  );
}