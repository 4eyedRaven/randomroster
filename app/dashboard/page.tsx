// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClientHome from '@/components/ClientHome'
import HamburgerMenu from '@/components/HamburgerMenu'  // import the new component

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  }

  return (
    <div className="container">
      <main>
        <div className="header-container">
          <h1>Random Roster</h1>
          <HamburgerMenu />
        </div>
        <ClientHome />
      </main>
    </div>
  )
}