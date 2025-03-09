'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // Check error message for unconfirmed email or invalid credentials.
    const errMsg = error.message.toLowerCase()
    if (errMsg.includes("unconfirmed") || errMsg.includes("verify")) {
      // The user's email has not been confirmed.
      redirect(`/login?error=confirmEmail&email=${encodeURIComponent(email)}`)
    } else if (errMsg.includes("invalid") || errMsg.includes("credentials")) {
      // Invalid login credentials.
      redirect(`/login?error=invalidCredentials`)
    } else {
      // Fallback for unknown errors.
      redirect(`/login?error=unknown`)
    }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    const errMsg = error.message.toLowerCase()
    if (errMsg.includes("already registered") || errMsg.includes("duplicate")) {
      // User is already registered.
      redirect(`/login?error=alreadyRegistered&email=${encodeURIComponent(email)}`)
    } else {
      redirect(`/login?error=signupError`)
    }
  }

  // On successful signup, redirect to login with a flag to check email.
  redirect('/login?check_email=true')
}