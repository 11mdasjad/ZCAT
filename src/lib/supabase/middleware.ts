import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Basic route protection
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/candidate') || request.nextUrl.pathname.startsWith('/admin');

  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && user) {
    // If we have a user and they try to hit login/register, redirect to their dashboard
    // We fetch role from users table not profiles
    const { data: userRecord } = await supabase.from('users').select('role').eq('id', user.id).single();
    const url = request.nextUrl.clone();
    
    if (userRecord?.role === 'ADMIN' || userRecord?.role === 'RECRUITER' || userRecord?.role === 'SUPER_ADMIN') {
      url.pathname = '/admin';
    } else {
      url.pathname = '/candidate';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
