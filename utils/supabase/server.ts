// utils/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Uncomment the following lines in production to enforce cookie security:
              // const secureOptions = {
              //   ...options,
              //   secure: true,        // Ensure cookie is sent only over HTTPS
              //   httpOnly: true,      // Prevent access via JavaScript
              //   sameSite: 'strict',  // Enforce strict same-site policy
              // };
              // cookieStore.set(name, value, secureOptions);

              // In development, set the cookie using the original options:
              cookieStore.set(name, value, options)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}