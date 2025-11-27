'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server'; // Pastikan path import benar

export async function login(formData: FormData) {
  // PERUBAHAN 3: Tambahkan 'await' karena createClient sekarang async
  const supabase = await createClient();
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email dan password wajib diisi.' };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect('/dashboard');
}

// LOGOUT SERVER ACTION
export async function logout() {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Logout error:', error.message);
    return { error: error.message };
  }

  redirect('/login');
}