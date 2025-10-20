import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold">Organisation du travail</h1>
        <p className="text-muted">Espace interne Romain & Thibaud</p>
        <div className="flex gap-4 justify-center">
          <Link className="px-4 py-2 rounded bg-accent text-white" href="/login">Se connecter</Link>
          <Link className="px-4 py-2 rounded bg-surface" href="/dashboard">Dashboard</Link>
        </div>
      </div>
    </main>
  )
}
