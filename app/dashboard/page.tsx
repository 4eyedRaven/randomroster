import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ClientHome from '@/components/ClientHome'
import { logout } from './actions'
import DeleteAccountButton from '@/components/DeleteAccountButton'

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
          <form action={logout}>
            <button type="submit" className="logout-button">Log out</button>
            <DeleteAccountButton /> 
          </form>
        </div>
        <ClientHome />
      </main>
    </div>
  )
}
