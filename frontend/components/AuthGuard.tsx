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
      // Redirection immédiate sans loading
      router.replace('/login')
      return
    }

    // Optionnel: vérifier la validité du token
    setIsAuthenticated(true)
    setIsLoading(false)
  }, [pathname, router])

  if (isLoading || !isAuthenticated) {
    return null // Redirection en cours ou chargement
  }

  return <>{children}</>
}
