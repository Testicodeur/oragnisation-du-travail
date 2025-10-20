"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('access')
    if (token) {
      // Si connecté, rediriger vers le dashboard
      router.push('/dashboard')
    } else {
      // Si pas connecté, rediriger vers le login
      router.push('/login')
    }
  }, [router])

  return (
    <main className="min-h-screen grid place-items-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-semibold">Organisation du travail</h1>
        <p className="text-muted">Chargement...</p>
      </div>
    </main>
  )
}
