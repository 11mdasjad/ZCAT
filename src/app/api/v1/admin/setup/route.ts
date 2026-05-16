/**
 * Admin Setup API
 * One-time endpoint to set the current logged-in user as ADMIN
 * This works by updating Supabase auth user_metadata (no DB table needed)
 * 
 * Usage: Log in as the user you want to make admin, then call:
 *   POST /api/v1/admin/setup
 *   body: { "secret": "zcat-admin-setup-2026" }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Change this secret or remove this file after first use
const SETUP_SECRET = 'zcat-admin-setup-2026';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Require a secret to prevent unauthorized use
    if (body.secret !== SETUP_SECRET) {
      return NextResponse.json({ error: 'Invalid setup secret' }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in' }, { status: 401 });
    }

    // Update user's own metadata to ADMIN role
    const { data, error } = await supabase.auth.updateUser({
      data: {
        role: 'ADMIN',
        is_admin: true,
      },
    });

    if (error) {
      return NextResponse.json({ error: `Failed to update: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${user.email} is now ADMIN`,
      user: {
        id: user.id,
        email: user.email,
        role: 'ADMIN',
        metadata: data.user?.user_metadata,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
