"use client"
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'

// Note: Cette page nécessite une route dynamique
// Pour l'export statique, on pourrait la désactiver temporairement

export default function ProjectDetailPage() {
  const params = useParams() as { id: string }
  const router = useRouter()
  const [project, setProject] = useState<any | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [priority, setPriority] = useState("medium")
  const api = process.env.NEXT_PUBLIC_API_URL

  const headers = () => {
    const access = localStorage.getItem("access")
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const load = async () => {
    const [pr, tr] = await Promise.all([
      fetch(api + `/api/projects/${params.id}/`, { headers: headers() }),
      fetch(api + `/api/tasks/?project=${params.id}`, { headers: headers() }),
    ])
    if (pr.ok) setProject(await pr.json())
    if (tr.ok) setTasks(await tr.json())
  }
  useEffect(() => { load() }, [params.id])

  const addTask = async () => {
    const res = await fetch(api + '/api/tasks/', { method: 'POST', headers: headers(), body: JSON.stringify({ project: Number(params.id), title, status: 'todo', priority, tags: [] }) })
    if (res.ok) { setTitle(""); load() }
  }

  const back = () => router.push('/projects')

  if (!project) return <div>Chargement…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold truncate">{project.name}</h1>
        <div className="flex items-center gap-2">
          <Badge tone={project.status==='active'?'success':'neutral'}>{project.status}</Badge>
          <Button variant="ghost" onClick={back}>Retour</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-muted text-sm">Client</div>
            <div>{project.client || '—'}</div>
          </div>
          <div>
            <div className="text-muted text-sm">Catégorie</div>
            <div>{project.category}</div>
          </div>
          <div>
            <div className="text-muted text-sm">Statut</div>
            <div>{project.status}</div>
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Tâches</h2>
          <div className="flex gap-2">
            <Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Titre de la tâche" />
            <Select value={priority} onChange={e=>setPriority(e.target.value)}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </Select>
            <Button onClick={addTask}>Ajouter</Button>
          </div>
        </div>
        <div className="divide-y divide-neutral-900">
          {tasks.map(t => (
            <div key={t.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">{t.title}</div>
                <div className="text-sm text-muted">{t.status} · {t.priority}</div>
              </div>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-muted">Aucune tâche pour ce projet.</div>}
        </div>
      </Card>
    </div>
  )
}
