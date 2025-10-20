"use client"
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Pages qui ne nécessitent pas d'authentification
    const publicPages = ['/login']
    
    if (publicPages.includes(pathname)) {
      setIsAuthenticated(true)
      return
    }

    // Vérifier l'authentification
    const token = localStorage.getItem('access')
    if (!token) {
      // Redirection immédiate sans loading
      router.replace('/login')
      return
    }

    // Optionnel: vérifier la validité du token
    setIsAuthenticated(true)
  }, [pathname, router, mounted])

  if (!mounted) {
    return (
      <main className="min-h-screen grid place-items-center bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] text-white">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold">Organisation du travail</h1>
          <p className="text-gray-300">Initialisation...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated && !pathname.includes('/login')) {
    return null // Redirection en cours
  }

  return <>{children}</>
}
