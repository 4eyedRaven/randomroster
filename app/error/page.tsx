'use client'

export default function ErrorPage() {
  return (
    <div className="container">
      <main>
        <h1>Random Roster</h1>
        <div className="error-container">
          <h2>Error</h2>
          <p>Sorry, something went wrong with your authentication.</p>
          <a href="/login" className="button">Return to Login</a>
        </div>
      </main>
    </div>
  )
}
