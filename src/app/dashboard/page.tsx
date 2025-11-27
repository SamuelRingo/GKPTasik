import { createClient } from "@/utils/supabase/server";
import { Users, Wallet, FolderSimple, TrendUp } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";

// Utility untuk format Rupiah
const formatRupiah = (number: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Komponen StatCard (Server Component UI)
const StatCard = ({ title, value, icon: Icon, subtext, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-lg font-bold text-gray-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon size={24} weight="fill" className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs font-medium text-gray-500">
      <TrendUp size={14} className="mr-1 text-green-600" />
      <span>{subtext}</span>
    </div>
  </div>
);

export default async function DashboardPage() {
  // 1. Inisialisasi Supabase Client (Next.js 15 Compatible)
  const supabase = await createClient();

  // 2. Cek User Session (Double protection selain middleware)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // 3. FETCHING DATA (BACKEND LOGIC)
  // Kita gunakan Promise.all agar request berjalan paralel (lebih cepat)
  const [
    jemaatRes, 
    arsipRes, 
    transaksiRes, 
    logsRes
  ] = await Promise.all([
    // Get Total Jemaat (Hanya hitung jumlah/count, tidak ambil datanya agar ringan)
    supabase.from("jemaat").select("*", { count: "exact", head: true }),
    
    // Get Total Arsip
    supabase.from("arsip").select("*", { count: "exact", head: true }),

    // Get Data Keuangan (Untuk dihitung totalnya)
    supabase.from("transaksi").select("jumlah, jenis"),

    // Get Recent Activity (Limit 5 terakhir)
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(5)
  ]);

  // 4. Pengolahan Data (Business Logic)
  const totalJemaat = jemaatRes.count || 0;
  const totalArsip = arsipRes.count || 0;

  // Hitung Saldo (Pemasukan - Pengeluaran)
  const transaksiData = transaksiRes.data || [];
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  transaksiData.forEach((t: any) => {
    if (t.jenis === 'masuk') totalPemasukan += Number(t.jumlah);
    if (t.jenis === 'keluar') totalPengeluaran += Number(t.jumlah);
  });
  
  const saldoAkhir = totalPemasukan - totalPengeluaran;

  // Simulasi data "Pengunjung Baru" (Logic: jemaat yang dibuat 7 hari terakhir)
  // Untuk sekarang kita hardcode logikanya atau ambil dari count query lain
  const pengunjungBaru = 12; // Contoh statis atau bisa query count jemaat where created_at > 7 days ago

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500">
          Selamat datang kembali, <span className="font-semibold text-primary">{user.email}</span>.
        </p>
      </header>

      {/* STATS GRID - REAL DATA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
            title="Total Jemaat" 
            value={totalJemaat} 
            icon={Users} 
            subtext="Terdaftar di database" 
            color="bg-blue-600" 
        />
        <StatCard 
            title="Saldo Kas" 
            value={formatRupiah(saldoAkhir)} 
            icon={Wallet} 
            subtext="Pemasukan - Pengeluaran" 
            color="bg-emerald-500" 
        />
        <StatCard 
            title="Arsip Digital" 
            value={totalArsip} 
            icon={FolderSimple} 
            subtext="Dokumen tersimpan" 
            color="bg-amber-500" 
        />
        <StatCard 
            title="Pemasukan (Total)" 
            value={formatRupiah(totalPemasukan)} 
            icon={TrendUp} 
            subtext="Akumulasi semua dana" 
            color="bg-purple-500" 
        />
      </div>

      {/* TABLE RECENT ACTIVITY - REAL DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Aktivitas Sistem Terbaru</h3>
          <button className="text-primary text-sm font-medium hover:underline">Refresh Log</button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Aktivitas</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Waktu</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {logsRes.data?.map((log: any) => (
                   <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.aktivitas}</td>
                    <td className="px-6 py-4">{log.user_name}</td>
                    <td className="px-6 py-4 text-gray-400">
                        {new Date(log.created_at).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.status === 'Sukses' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {log.status}
                        </span>
                    </td>
                  </tr>
                ))}

                {(!logsRes.data || logsRes.data.length === 0) && (
                    <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                            Belum ada aktivitas tercatat.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}