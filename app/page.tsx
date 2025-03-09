// app/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  
  // If user is logged in, redirect to dashboard
  if (data?.user) {
    redirect('/dashboard')
  }
  
  // Otherwise redirect to login
  redirect('/login')
}