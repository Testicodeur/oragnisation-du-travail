"use client"
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown,
  Edit3,
  Trash2,
  ExternalLink,
  Users,
  Calendar,
  Briefcase,
  Building2,
  User
} from 'lucide-react'

type Project = { id: number; name: string; description?: string; status: string; category: string }
type SortKey = 'name' | 'status' | 'category'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("perso")
  const [editing, setEditing] = useState<Project | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // UX: search / filters / sort
  const [query, setQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const api = process.env.NEXT_PUBLIC_API_URL

  const headers = () => {
    const access = typeof window !== 'undefined' ? localStorage.getItem("access") : null
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const load = async () => {
    const res = await fetch(api + "/api/projects/", { headers: headers() })
    if (res.ok) setProjects(await res.json())
  }
  useEffect(() => { load() }, [])

  const createProject = async () => {
    setError(null)
    const res = await fetch(api + "/api/projects/", { method: 'POST', headers: headers(), body: JSON.stringify({ name, description, status: 'active', category }) })
    if (!res.ok) { setError("Création projet échouée"); return }
    setName(""); setDescription(""); setCategory("perso"); setShowCreateForm(false); load()
  }

  const startEdit = (p: Project) => setEditing(p)
  const saveEdit = async () => {
    if (!editing) return
    const res = await fetch(api + `/api/projects/${editing.id}/`, { method: 'PUT', headers: headers(), body: JSON.stringify(editing) })
    if (!res.ok) { setError("Sauvegarde échouée"); return }
    setEditing(null); load()
  }
  const deleteProject = async (id: number) => {
    if (!confirm('Supprimer ce projet ?')) return
    const res = await fetch(api + `/api/projects/${id}/`, { method: 'DELETE', headers: headers() })
    if (res.status !== 204) { setError("Suppression échouée"); return }
    load()
  }

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = projects.filter(p => {
      const matchQ = !q || [p.name, p.category, p.status].some(v => (v || '').toLowerCase().includes(q))
      const matchS = filterStatus === 'all' || p.status === filterStatus
      const matchC = filterCategory === 'all' || p.category === filterCategory
      return matchQ && matchS && matchC
    })
    rows.sort((a, b) => {
      const av = String(a[sortBy] || '').toLowerCase()
      const bv = String(b[sortBy] || '').toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return rows
  }, [projects, query, filterStatus, filterCategory, sortBy, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(key); setSortDir('asc') }
  }

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'perso': return User
      case 'oodrive': return Briefcase
      case 'tharios': return Building2
      default: return FolderKanban
    }
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            Projets
          </h1>
          <p className="text-neutral-400 mt-2">Gérez vos projets et suivez leur progression</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouveau projet
        </Button>
      </motion.div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl"
        >
          {error}
        </motion.div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Créer un nouveau projet
            </h2>
            <div className="space-y-4 mb-4">
              <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom du projet" />
              <Input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description du projet (optionnel)" />
              <Select value={category} onChange={e=>setCategory(e.target.value)}>
                <option value="perso">Perso</option>
                <option value="oodrive">Oodrive</option>
                <option value="tharios">Tharios</option>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={createProject}>Créer le projet</Button>
              <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Annuler</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input 
                value={query} 
                onChange={e=>setQuery(e.target.value)} 
                placeholder="Rechercher un projet..." 
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <Select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)}>
                <option value="all">Tous statuts</option>
                <option value="planned">Planifié</option>
                <option value="active">Actif</option>
                <option value="paused">En pause</option>
                <option value="done">Terminé</option>
              </Select>
              <Select value={filterCategory} onChange={e=>setFilterCategory(e.target.value as any)}>
                <option value="all">Toutes catégories</option>
                <option value="perso">Perso</option>
                <option value="oodrive">Oodrive</option>
                <option value="tharios">Tharios</option>
              </Select>
              <Button variant="ghost" onClick={()=>setSortDir(d=>d==='asc'?'desc':'asc')} className="gap-2">
                <ArrowUpDown className="w-4 h-4" />
                {sortDir === 'asc' ? 'A-Z' : 'Z-A'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredSorted.map((p, i) => {
          const CategoryIcon = getCategoryIcon(p.category)
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="p-6 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-accent/20 to-blue-600/20">
                      <CategoryIcon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-sm text-neutral-400">{p.description || 'Aucune description'}</p>
                    </div>
                  </div>
                  <Badge tone={p.status === 'active' ? 'success' : p.status === 'done' ? 'neutral' : 'warning'}>
                    {p.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{p.category}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/projects/${p.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(p)} className="gap-1">
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => deleteProject(p.id)} className="gap-1">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
        
        {filteredSorted.length === 0 && (
          <div className="col-span-full">
            <Card className="p-12 text-center">
              <FolderKanban className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
              <p className="text-neutral-400 mb-4">Créez votre premier projet pour commencer</p>
              <Button onClick={() => setShowCreateForm(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Créer un projet
              </Button>
            </Card>
          </div>
        )}
      </motion.div>

      {/* Edit Modal */}
      {editing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Éditer le projet
              </h2>
              <div className="space-y-4">
                <Input 
                  value={editing.name} 
                  onChange={e=>setEditing({ ...editing, name: e.target.value })} 
                  placeholder="Nom du projet" 
                />
                <Input 
                  value={editing.description || ''} 
                  onChange={e=>setEditing({ ...editing, description: e.target.value })} 
                  placeholder="Description du projet" 
                />
                <Select 
                  value={editing.category} 
                  onChange={e=>setEditing({ ...editing, category: e.target.value })}
                >
                  <option value="perso">Perso</option>
                  <option value="oodrive">Oodrive</option>
                  <option value="tharios">Tharios</option>
                </Select>
                <Select 
                  value={editing.status} 
                  onChange={e=>setEditing({ ...editing, status: e.target.value })}
                >
                  <option value="planned">Planifié</option>
                  <option value="active">Actif</option>
                  <option value="paused">En pause</option>
                  <option value="done">Terminé</option>
                </Select>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={saveEdit}>Sauvegarder</Button>
                <Button variant="ghost" onClick={() => setEditing(null)}>Annuler</Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
