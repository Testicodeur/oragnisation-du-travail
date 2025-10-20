"use client"
import { useState } from 'react'

export default function LoginPage() {
  const [pid, setPid] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/auth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personal_identifier: pid, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.detail || "Identifiants incorrects")
      }
      const data = await res.json()
      localStorage.setItem("access", data.access)
      localStorage.setItem("refresh", data.refresh)
      window.location.href = "/dashboard"
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-surface p-6 rounded space-y-4 shadow-lg">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <label className="block text-sm">Identifiant</label>
        <input value={pid} onChange={e => setPid(e.target.value)} className="w-full px-3 py-2 rounded bg-background border border-neutral-700" placeholder="personal_identifier" />
        <label className="block text-sm">Mot de passe</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded bg-background border border-neutral-700" placeholder="••••••••" />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button className="w-full px-4 py-2 bg-accent text-white rounded">Se connecter</button>
      </form>
    </main>
  )
}
