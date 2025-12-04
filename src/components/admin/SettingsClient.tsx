'use client';

import { useState } from "react";
import { User, LockKey, Globe, FloppyDisk, Camera, ShieldCheck, Users, Check } from "@phosphor-icons/react";
import toast from "react-hot-toast";
import { updateOrganization, updateProfile, changePassword } from "@/app/dashboard/settings/actions";

// Tipe data props yang diterima dari Server
type SettingsProps = {
  orgData: any;
  profileData: any;
  userEmail: string;
  adminsList: any[];
};

export default function SettingsClient({ orgData, profileData, userEmail, adminsList }: SettingsProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [isLoading, setIsLoading] = useState(false);

  // --- HANDLERS ---
  
  const handleUpdateOrg = async (formData: FormData) => {
    setIsLoading(true);
    const load = toast.loading('Menyimpan pengaturan gereja...');
    const res = await updateOrganization(formData);
    toast.dismiss(load);
    
    if (res?.error) toast.error(res.error);
    else toast.success('Info gereja berhasil diperbarui!');
    
    setIsLoading(false);
  };

  const handleUpdateProfile = async (formData: FormData) => {
    setIsLoading(true);
    const load = toast.loading('Update profil...');
    const res = await updateProfile(formData);
    toast.dismiss(load);

    if (res?.error) toast.error(res.error);
    else toast.success('Profil berhasil disimpan!');
    
    setIsLoading(false);
  };

  const handleChangePassword = async (formData: FormData) => {
    setIsLoading(true);
    const load = toast.loading('Mengubah password...');
    const res = await changePassword(formData);
    toast.dismiss(load);

    if (res?.error) toast.error(res.error);
    else {
        toast.success('Password berhasil diubah!');
        // Reset form manual jika perlu
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
        {/* SIDEBAR TABS */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 lg:gap-1 overflow-x-auto pb-2 lg:pb-0">
            {[
                { id: "general", label: "Umum & Website", icon: Globe },
                { id: "profile", label: "Profil Saya", icon: User },
                { id: "security", label: "Keamanan", icon: LockKey },
                { id: "admins", label: "Manajemen Admin", icon: Users },
            ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-md" 
                      : "bg-white lg:bg-transparent text-gray-600 hover:bg-white hover:shadow-sm border border-gray-100 lg:border-none"
                  }`}
                >
                  <tab.icon size={20} weight={activeTab === tab.id ? "fill" : "regular"} />
                  {tab.label}
                </button>
            ))}
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
            
            {/* TAB: UMUM (ORGANISASI) */}
            {activeTab === "general" && (
              <form action={handleUpdateOrg} className="space-y-6 animate-fade-in">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Informasi Gereja</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nama Gereja</label>
                      <input name="nama_gereja" defaultValue={orgData?.nama_gereja} type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                      <textarea name="alamat" rows={3} defaultValue={orgData?.alamat} className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Resmi</label>
                        <input name="email" defaultValue={orgData?.email} type="email" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                        <input name="telepon" defaultValue={orgData?.telepon} type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Fitur Website</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Mode Maintenance</p>
                        <p className="text-sm text-gray-500">Aktifkan jika website sedang perbaikan.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="maintenance" type="checkbox" defaultChecked={orgData?.maintenance_mode} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-700">Pendaftaran Online</p>
                        <p className="text-sm text-gray-500">Izinkan jemaat mendaftar via web.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="registration" type="checkbox" defaultChecked={orgData?.online_registration} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div> */}
                
                <div className="flex justify-end">
                     <button disabled={isLoading} type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition flex items-center gap-2">
                        <FloppyDisk size={20}/> Simpan Pengaturan
                     </button>
                </div>
              </form>
            )}

            {/* TAB: PROFIL SAYA */}
            {activeTab === "profile" && (
              <form action={handleUpdateProfile} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Profil Administrator</h3>
                <div className="flex items-center gap-6 mb-8">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-primary">
                      <User size={48} weight="fill" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xl font-bold text-gray-800 truncate">{profileData?.full_name || 'Admin'}</h4>
                    <p className="text-gray-500 truncate">{userEmail}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase">
                        {profileData?.role || 'Staff'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6 max-w-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input name="full_name" defaultValue={profileData?.full_name} type="text" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email (Read Only)</label>
                    <input type="text" value={userEmail} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                     <button disabled={isLoading} type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-800 transition flex items-center gap-2">
                        <FloppyDisk size={20}/> Update Profil
                     </button>
                </div>
              </form>
            )}

            {/* TAB: KEAMANAN (PASSWORD) */}
            {activeTab === "security" && (
               <form action={handleChangePassword} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                 <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Keamanan Akun</h3>
                 <div className="space-y-6 max-w-lg">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                        <input name="password" type="password" required minLength={6} placeholder="Min. 6 karakter" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                        <input name="confirm" type="password" required minLength={6} placeholder="Ulangi password baru" className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 items-start">
                        <ShieldCheck size={24} className="text-primary shrink-0" />
                        <p className="text-sm text-blue-800">Pastikan Anda menggunakan password yang kuat. Setelah password diubah, Anda mungkin diminta login ulang.</p>
                    </div>
                 </div>
                 <div className="flex justify-end mt-6">
                     <button disabled={isLoading} type="submit" className="bg-accent text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 transition flex items-center gap-2">
                        <LockKey size={20}/> Ganti Password
                     </button>
                </div>
               </form>
            )}

            {/* TAB: ADMINS (LIST ONLY) */}
            {activeTab === "admins" && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 border-b border-gray-100 pb-2">Daftar Admin</h3>
                    {adminsList.length === 0 ? (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Belum ada data admin ditemukan.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Nama</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Role</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminsList.map((admin) => (
                                        <tr key={admin.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="px-4 py-3 font-bold text-gray-900">
                                                {admin.full_name || 'Admin Tanpa Nama'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">
                                                {admin.email || '-'}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                                    {admin.role || 'Staff'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                    <Check weight="bold"/> Aktif
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <p className="mt-4 text-xs text-gray-400">*Untuk menambah admin baru, silakan hubungi tim IT Support atau Super Admin melalui Supabase Auth.</p>
                </div>
            )}

        </div>
    </div>
  );
}