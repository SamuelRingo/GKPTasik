import { CloudArrowUp, Files } from "@phosphor-icons/react/dist/ssr";

export default function About() {
  return (
    <section id="tentang" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/10 rounded-full blur-xl"></div>
            <img
              src="/MJ.jpeg"
              alt="Digital Archive"
              className="rounded-2xl shadow-2xl relative z-10 w-full"
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-primary mb-4">Tentang GKP Tasikmalaya</h2>
            <div className="w-20 h-1 bg-accent mb-6"></div>
            <p className="text-gray-600 leading-relaxed mb-4">
              Gereja Kristen Pasundan (GKP) Jemaat Tasikmalaya merupakan salah satu jemaat dari Sinode GKP dan anggota Persekutuan Gereja-gereja di Indonesia (PGI) yang hadir untuk menjadi saksi Kristus di Tanah Pasundan. Berdiri sejak tahun 1896 melalui pelayanan misi Nederlandsche Zendingsvereeniging (NZV) yang diawali oleh Zendeling H. Muller, gereja kami telah menempuh perjalanan panjang sejarah iman yang berpusat di Jalan Selakaso No. 61. Sebagai gereja yang tumbuh di tengah keberagaman etnis dan latar belakang, kami mewarisi tradisi yang menyambut hangat setiap jiwa untuk beribadah dan bertumbuh bersama dalam iman Kristiani.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Dalam semangat kasih Kristus, kami berkomitmen mewujudkan Tri-Panggilan Gereja yaitu bersekutu (Koinonia), melayani (Diakonia), dan bersaksi (Marturia) di tengah masyarakat Tasikmalaya. Kami percaya bahwa gereja bukan sekadar organisasi, melainkan persekutuan orang percaya yang dipanggil untuk menghadirkan tanda-tanda Kerajaan Allah melalui kasih, kebenaran, keadilan, dan damai sejahtera. Kami mengundang Anda untuk mengambil bagian dalam karya pelayanan ini, menjadi garam dan terang yang membawa dampak positif bagi sesama dan kemuliaan bagi nama Tuhan.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}