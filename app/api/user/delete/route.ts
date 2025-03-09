// app/api/user/delete/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(request: NextRequest) {
  // Create a Supabase server client using the request cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        // No need to set cookies here; we'll handle it manually.
        setAll: () => {},
      },
    }
  );

  // Verify the session/user.
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return new NextResponse(
      JSON.stringify({ error: 'Unauthorized or no active session.' }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Delete the user using the admin API.
  const { error } = await supabase.auth.admin.deleteUser(user.id);
  if (error) {
    return new NextResponse(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create a new JSON response.
  const response = new NextResponse(
    JSON.stringify({ message: 'User deleted successfully.' }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  // Clear all cookies that start with "sb-"
  const allCookies = request.cookies.getAll();
  allCookies.forEach((cookie) => {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.set(cookie.name, '', { maxAge: 0, path: '/' });
    }
  });

  return response;
}