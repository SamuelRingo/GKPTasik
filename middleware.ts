import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
            return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
            response = NextResponse.next({
                request: {
                    headers: request.headers,
                },
            })
            cookiesToSet.forEach(({ name, value, options }) =>
                response.cookies.set(name, value, options)
            )
        },
      },
    }
  );

  // Cek session user
  const { data: { user } } = await supabase.auth.getUser();

  // LOGIKA PROTEKSI RUTE
  // 1. Jika user belum login dan mencoba masuk dashboard -> Lempar ke login
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika user SUDAH login dan mencoba masuk halaman login -> Lempar ke dashboard
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Pastikan semua respons memiliki cookie yang benar untuk production
  // Ini memastikan session cookie diupdate dengan benar di production build
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};