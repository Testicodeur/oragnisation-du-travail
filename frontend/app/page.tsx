"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // En mode Electron, aller directement au dashboard
    if (typeof window !== 'undefined' && window.location.href.includes('localhost:3000')) {
      // Simuler un token pour éviter la boucle
      localStorage.setItem('access', 'electron-token')
      router.replace('/dashboard')
    } else {
      // Vérifier si l'utilisateur est connecté
      const token = localStorage.getItem('access')
      if (token) {
        // Si connecté, rediriger vers le dashboard
        router.replace('/dashboard')
      } else {
        // Si pas connecté, rediriger vers le login
        router.replace('/login')
      }
    }
  }, [router, mounted])

  // Afficher un écran de chargement pendant la vérification
  if (!mounted) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold">Organisation du travail</h1>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </main>
    )
  }

  // Ne rien afficher après le mount, redirection en cours
  return null
}
