// app/page.tsx
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (data?.user) {
    redirect('/dashboard')
  }

  // Otherwise, show a marketing-style landing page
  return (
    <main className={"landingContainer"}>
      {/* Hero Section */}
      <section className={"heroSection"}>
        <div className={"heroContent"}>
          <h1 className={"heroTitle"}>Random Roster</h1>
          <p className={"heroSubtitle"}>
            Simplify your classroom management with quick, balanced student grouping.
          </p>
          <div className={"ctaButtons"}>
            <Link href="/register" className={"ctaButtonPrimary"}>
              Sign Up for Free
            </Link>
            <Link href="/login" className={"ctaButtonSecondary"}>
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={"featuresSection"}>
        <h2>Why Random Roster?</h2>
        <div className={"featuresGrid"}>
          <div className={"featureCard"}>
            <h3>Balanced Groups</h3>
            <p>
              Automatically distribute students by capability to ensure fair,
              engaging group assignments.
            </p>
          </div>
          <div className={"featureCard"}>
            <h3>Effortless Management</h3>
            <p>
              Save time on attendance, class creation, and group generation—so
              you can focus on teaching.
            </p>
          </div>
          <div className={"featureCard"}>
            <h3>Reusable Rosters</h3>
            <p>
              Quickly revisit past groupings or fine-tune them with an easy drag-and-drop interface.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}