import Link from "next/link";
import { CalendarCheck, Info } from "@phosphor-icons/react/dist/ssr";

export default function Hero() {
  return (
    <section
      id="beranda"
      className="h-screen flex items-center justify-center text-white px-6 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.85), rgba(30, 58, 138, 0.7)), url('/HeroBG.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="text-center max-w-4xl mx-auto">
        <span className="inline-block py-1 px-3 rounded-full bg-accent/20 border border-accent/50 text-accent font-semibold text-xs mb-4 tracking-wider uppercase">
          SELAMAT DATANG DI GKP TASIKMALAYA
        </span>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Bertumbuh dalam Iman <br /> Bersatu dalam Kasih
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
          Sarana digital untuk mempererat persaudaraan dan mendukung pertumbuhan rohani jemaat.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="#jadwal" className="bg-accent hover:bg-amber-700 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2">
            <CalendarCheck size={20} weight="bold" /> Jadwal Kebaktian
          </Link>
          <Link href="#tentang" className="bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white px-8 py-4 rounded-lg font-semibold transition flex items-center justify-center gap-2">
            <Info size={20} weight="bold" /> Tentang Kami
          </Link>
        </div>
      </div>
    </section>
  );
}