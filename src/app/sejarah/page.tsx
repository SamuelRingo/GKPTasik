import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import History from "@/components/History";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sejarah Gereja | Gereja Kristen Pasundan Tasikmalaya",
};

export default function SejarahPage() {
  return (
    <main>
      <Navbar />
      <PageHeader 
        title="Sejarah Singkat" 
        subtitle=""
        bgImage="https://images.unsplash.com/photo-1470058869958-2a77ade41c02?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
      />
      <History />
      <Footer />
    </main>
  );
}