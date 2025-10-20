"use client"
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ScheduleRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Rediriger automatiquement vers /planning
    router.replace('/planning')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Redirection...</h1>
        <p className="text-slate-400">Vous êtes redirigé vers la nouvelle page Planning</p>
      </div>
    </div>
  )
}
