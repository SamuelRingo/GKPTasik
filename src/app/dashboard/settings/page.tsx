import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import SettingsClient from "@/components/admin/SettingsClient";
import { redirect } from "next/navigation";

type AdminProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
};

/**
 * Fungsi untuk mengambil semua admin dari Supabase Auth + Profiles
 */
async function getAllAdmins(): Promise<AdminProfile[]> {
  try {
    const adminClient = createAdminClient();

    // 1. Ambil semua user dari auth.users menggunakan admin API
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
    
    if (usersError) {
      console.error("Error fetching users:", usersError);
      return [];
    }

    // 2. Ambil semua profile dari tabel profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, full_name, role');

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }

    // 3. Gabungkan data: user dari auth.users dengan profile data
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const adminsList: AdminProfile[] = (users || []).map(user => ({
      id: user.id,
      email: user.email || null,
      full_name: profileMap.get(user.id)?.full_name || 'Admin Tanpa Nama',
      role: profileMap.get(user.id)?.role || 'Staff',
    }));

    return adminsList;
  } catch (error) {
    console.error("Error in getAllAdmins:", error);
    return [];
  }
}

export default async function SettingsPage() {
  const supabase = await createClient();

  // 1. Cek Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Fetch Data Organisasi (ID = 1)
  const { data: orgData } = await supabase
    .from('organization_settings')
    .select('*')
    .eq('id', 1)
    .single();

  // 3. Fetch Profile User Sendiri
  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 4. Fetch Daftar Semua Admin dengan admin client
  const adminsList = await getAllAdmins();

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Pengaturan Sistem</h1>
        <p className="text-gray-500">Kelola preferensi akun dan konfigurasi website gereja.</p>
      </header>

      <SettingsClient 
        orgData={orgData}
        profileData={profileData}
        userEmail={user.email || ''}
        adminsList={adminsList || []}
      />
    </div>
  );
}