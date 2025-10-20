"use client"
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Pages qui ne nécessitent pas d'authentification
    const publicPages = ['/login']
    
    if (publicPages.includes(pathname)) {
      setIsLoading(false)
      setIsAuthenticated(true)
      return
    }

    // Vérifier l'authentification
    const token = localStorage.getItem('access')
    if (!token) {
      router.push('/login')
      return
    }

    // Optionnel: vérifier la validité du token
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [pathname, router])

  if (isLoading) {
    return (
      <main className="min-h-screen grid place-items-center bg-background">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-semibold">Organisation du travail</h1>
          <p className="text-muted">Vérification de l'authentification...</p>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return null // Redirection en cours
  }

  return <>{children}</>
}
