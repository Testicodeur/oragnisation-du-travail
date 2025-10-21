"use client"
// @ts-nocheck
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { 
  FolderKanban, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Calendar,
  ArrowRight,
  Plus,
  Activity
} from 'lucide-react'
import Link from 'next/link'

type Project = { id: number; name: string; status: string; deadline?: string; client?: string }
type Task = { id: number; title: string; status: string; priority: string; project: number }

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState<string | null>(null)
  const apiUrl = process.env.NEXT_PUBLIC_API_URL

  const getHeaders = () => {
    const access = localStorage.getItem("access")
    if (!access) return null
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) return false
    
    try {
      const res = await fetch(apiUrl + "/api/auth/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh })
      })
      
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem("access", data.access)
        return true
      }
    } catch (e) {
      console.error("Refresh token failed:", e)
    }
    
    // Si le refresh échoue, rediriger vers login
    localStorage.clear()
    window.location.href = "/login"
    return false
  }

  const loadData = async () => {
    setError(null)
    let headers = getHeaders()
    if (!headers) { window.location.href = "/login"; return }
    
    try {
      console.log('Loading data with headers:', headers)
      
      // Faire les requêtes une par une pour déboguer
      let pr = await fetch(apiUrl + "/api/projects/", { headers })
      console.log('Projects response:', pr.status, pr.statusText)
      
      // Si 401, essayer de rafraîchir le token
      if (pr.status === 401) {
        console.log('Token expired, trying to refresh...')
        const refreshed = await refreshToken()
        if (refreshed) {
          headers = getHeaders()
          pr = await fetch(apiUrl + "/api/projects/", { headers })
          console.log('Projects response after refresh:', pr.status, pr.statusText)
        }
      }
      
      if (!pr.ok) throw new Error(`Erreur projets: ${pr.status}`)
      
      const tr = await fetch(apiUrl + "/api/tasks/", { headers })
      console.log('Tasks response:', tr.status, tr.statusText)
      if (!tr.ok) throw new Error(`Erreur tâches: ${tr.status}`)
      
      const [p, t] = await Promise.all([pr.json(), tr.json()])
      console.log('Data loaded:', { projects: p.length, tasks: t.length })
      setProjects(p)
      setTasks(t)
    } catch (e: any) { 
      console.error('Load error:', e)
      setError(e.message) 
    }
  }
  useEffect(() => { loadData() }, [])

  const logout = () => { localStorage.clear(); window.location.href = "/login" }

  const activeProjects = projects.filter(p => p.status === 'active')
  const tasksInProgress = tasks.filter(t => t.status !== 'done')
  const completedTasks = tasks.filter(t => t.status === 'done')
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done')

  const kpis = [
    {
      title: "Projets actifs",
      value: activeProjects.length,
      icon: FolderKanban,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "Tâches en cours",
      value: tasksInProgress.length,
      icon: Clock,
      color: "from-amber-500 to-orange-500",
      bgColor: "from-amber-500/10 to-orange-500/10"
    },
    {
      title: "Tâches terminées",
      value: completedTasks.length,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-500",
      bgColor: "from-emerald-500/10 to-green-500/10"
    },
    {
      title: "Tâches urgentes",
      value: urgentTasks.length,
      icon: TrendingUp,
      color: "from-red-500 to-pink-500",
      bgColor: "from-red-500/10 to-pink-500/10"
    }
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-neutral-400 mt-2">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={logout}>Se déconnecter</Button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card hover className="p-6 relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.bgColor} opacity-50`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${kpi.color}`}>
                    <kpi.icon className="w-6 h-6 text-white" />
                  </div>
                  <Activity className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-neutral-400">{kpi.title}</p>
                  <p className="text-3xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/projects">
              <Button className="w-full justify-between group">
                Nouveau projet
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="secondary" className="w-full justify-between group">
                Nouvelle tâche
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/planning">
              <Button variant="ghost" className="w-full justify-between group">
                Voir le planning
                <Calendar className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FolderKanban className="w-5 h-5" />
                Projets récents
              </h2>
              <Link href="/projects">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 5).map(p => (
                <motion.div
                  key={p.id}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-neutral-900/50"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-neutral-400">{p.client || 'Pas de client'}</p>
                  </div>
                  <Badge tone={p.status === 'active' ? 'success' : 'neutral'}>
                    {p.status}
                  </Badge>
                </motion.div>
              ))}
              {projects.length === 0 && (
                <p className="text-neutral-500 text-center py-8">Aucun projet pour le moment</p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Tâches prioritaires
              </h2>
              <Link href="/tasks">
                <Button variant="ghost" size="sm">Voir tout</Button>
              </Link>
            </div>
            <div className="space-y-3">
              {tasks
                .filter(t => t.status !== 'done')
                .sort((a, b) => {
                  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
                  return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                         (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
                })
                .slice(0, 5)
                .map(t => (
                  <motion.div
                    key={t.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-neutral-900/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge tone={t.status === 'doing' ? 'warning' : 'neutral'} className="text-xs">
                          {t.status}
                        </Badge>
                        <Badge tone={t.priority === 'urgent' ? 'danger' : t.priority === 'high' ? 'warning' : 'neutral'} className="text-xs">
                          {t.priority}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              {tasksInProgress.length === 0 && (
                <p className="text-neutral-500 text-center py-8">Aucune tâche en cours</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
