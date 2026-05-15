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

  // Route classification
  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isAdminRoute = pathname.startsWith('/admin');
  const isCandidateRoute = pathname.startsWith('/candidate');
  const isDashboardRoute = isAdminRoute || isCandidateRoute;

  // ── 1. If no user is logged in, block all dashboard routes ──
  if (isDashboardRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // ── 2. If user is logged in, check role-based access ──
  if (user && isDashboardRoute) {
    // Fetch user role from DB
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userRecord?.role || user.user_metadata?.role || 'CANDIDATE';

    // ── ADMIN route protection ──
    // Only ADMIN, SUPER_ADMIN, and RECRUITER can access /admin routes
    if (isAdminRoute) {
      const isAdminUser = ['ADMIN', 'SUPER_ADMIN', 'RECRUITER'].includes(role.toUpperCase());
      if (!isAdminUser) {
        // Non-admin trying to access admin panel → redirect to candidate dashboard
        const url = request.nextUrl.clone();
        url.pathname = '/candidate';
        url.searchParams.set('error', 'unauthorized');
        return NextResponse.redirect(url);
      }
    }

    // ── Candidate route — admin users can access too (for testing) ──
    // No restrictions on /candidate routes for any authenticated user
  }

  // ── 3. If already logged in and hitting auth routes, redirect to dashboard ──
  if (isAuthRoute && user) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userRecord?.role || user.user_metadata?.role || 'CANDIDATE';
    const url = request.nextUrl.clone();

    if (['ADMIN', 'SUPER_ADMIN', 'RECRUITER'].includes(role.toUpperCase())) {
      url.pathname = '/admin';
    } else {
      url.pathname = '/candidate';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
