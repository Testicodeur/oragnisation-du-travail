"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, FolderKanban, ListTodo, CalendarDays, Settings, Sparkles } from 'lucide-react'

const tabs = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projets', icon: FolderKanban },
  { href: '/tasks', label: 'Tâches', icon: ListTodo },
  { href: '/planning', label: 'Planning', icon: CalendarDays },
  { href: '/settings', label: 'Paramètres', icon: Settings },
]

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Ne pas afficher la navigation sur la page de login
  if (pathname === '/login') {
    return <>{children}</>
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b3a] via-[#2d1b69] to-[#1a1b3a] text-white flex">
      <motion.aside 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 shrink-0 border-r border-[#3d2a7a]/30 bg-gradient-to-b from-[#1e1b4b]/95 to-[#1a1b3a]/95 backdrop-blur-xl sticky top-0 h-screen shadow-2xl"
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#3d2a7a]/20">
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-white">
              WorkFlow
            </span>
            <div className="text-xs text-[#a78bfa]/70">Gestion de projets</div>
          </div>
        </div>
        <nav className="px-4 py-6 space-y-2">
          {tabs.map((t, i) => {
            const active = pathname?.startsWith(t.href)
            const Icon = t.icon
            return (
              <motion.div
                key={t.href}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link 
                  href={t.href} 
                  className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-[#3b82f6]/20 text-white border border-[#8b5cf6]/30 shadow-lg shadow-[#8b5cf6]/20' 
                      : 'hover:bg-[#3d2a7a]/30 text-[#a78bfa]/80 hover:text-white hover:shadow-md'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-all duration-300 ${
                    active 
                      ? 'bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] shadow-md' 
                      : 'bg-[#3d2a7a]/40 group-hover:bg-[#8b5cf6]/50'
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="truncate">{t.label}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-3 w-2 h-2 bg-[#8b5cf6] rounded-full shadow-lg shadow-[#8b5cf6]/50"
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </nav>
        
        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#3d2a7a]/20">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#3d2a7a]/20 hover:bg-[#3d2a7a]/30 transition-all cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white font-semibold text-sm">
              R
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Romain</div>
              <div className="text-xs text-[#a78bfa]/70">Admin</div>
            </div>
          </div>
        </div>
      </motion.aside>
      <main className="flex-1 min-w-0 bg-gradient-to-br from-[#1a1b3a]/30 to-[#2d1b69]/20 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="h-full px-8 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )}
