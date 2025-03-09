// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Uncomment the following lines in production to enforce cookie security:
            // const secureOptions = {
            //   ...options,
            //   secure: true,
            //   httpOnly: true,
            //   sameSite: 'strict',
            // };
            // request.cookies.set(name, value, secureOptions);

            // In development, set the cookie using the original options:
            request.cookies.set(name, value)
          })

          // Recreate the response so that new cookies can be set on it.
          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            // Uncomment the following lines in production to enforce cookie security:
            // const secureOptions = {
            //   ...options,
            //   secure: true,
            //   httpOnly: true,
            //   sameSite: 'strict',
            // };
            // supabaseResponse.cookies.set(name, value, secureOptions);

            // In development, set the cookie using the original options:
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Do not remove supabase.auth.getUser() as it prevents unexpected logouts.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // No user found on a protected route, redirect to the login page.
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: Always return the response object.
  return supabaseResponse
}