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
      router.replace('/dashboard')
    } else {
      // Si pas connecté, rediriger vers le login
      router.replace('/login')
    }
  }, [router])

  // Ne rien afficher, redirection immédiate
  return null
}
