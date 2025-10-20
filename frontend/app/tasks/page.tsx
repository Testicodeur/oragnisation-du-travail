"use client"
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Badge from '@/components/ui/Badge'
import { 
  ListTodo, 
  Plus, 
  Search, 
  Filter, 
  Clock,
  CheckCircle2,
  Circle,
  MessageSquare,
  Paperclip,
  X,
  Send,
  Upload,
  AlertCircle,
  Zap,
  Calendar,
  User,
  Edit3,
  Trash2,
  MoreVertical,
  CheckSquare,
  Square,
  Users
} from 'lucide-react'

const statuses = ['todo','doing','done'] as const

type Task = { 
  id: number; 
  title: string; 
  description?: string; 
  status: typeof statuses[number]; 
  priority: string; 
  project: number;
  project_name?: string;
  assignee?: number;
  assignee_name?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  comments?: any[]; 
  attachments?: any[]; 
  subtasks?: any[] 
}

type Project = { id: number; name: string }
type UserType = { id: number; personal_identifier: string; first_name?: string; last_name?: string }

const statusConfig = {
  todo: { label: 'À faire', icon: Circle, color: 'from-neutral-500 to-neutral-600', bgColor: 'from-neutral-500/10 to-neutral-600/10' },
  doing: { label: 'En cours', icon: Clock, color: 'from-amber-500 to-orange-500', bgColor: 'from-amber-500/10 to-orange-500/10' },
  done: { label: 'Terminé', icon: CheckCircle2, color: 'from-emerald-500 to-green-500', bgColor: 'from-emerald-500/10 to-green-500/10' }
}

const priorityConfig = {
  low: { color: 'neutral', icon: Circle, label: 'Faible' },
  medium: { color: 'warning', icon: AlertCircle, label: 'Moyenne' },
  high: { color: 'danger', icon: AlertCircle, label: 'Haute' },
  urgent: { color: 'danger', icon: Zap, label: 'Urgente' }
}

export default function TasksPage() {
  const api = process.env.NEXT_PUBLIC_API_URL
  const [projects, setProjects] = useState<Project[]>([])
  const [users, setUsers] = useState<UserType[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [query, setQuery] = useState("")
  const [projectId, setProjectId] = useState<number | 'all'>('all')
  const [priority, setPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all')
  const [assigneeId, setAssigneeId] = useState<number | 'all'>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Nouveau formulaire de création
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: 0,
    priority: 'medium',
    assignee: 0,
    due_date: '',
    status: 'todo' as typeof statuses[number]
  })

  const headers = () => {
    const access = localStorage.getItem("access")
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const load = async () => {
    try {
      const [pr, tr] = await Promise.all([
        fetch(api + "/api/projects/", { headers: headers() }),
        fetch(api + "/api/tasks/", { headers: headers() })
      ])
      if (pr.ok) setProjects(await pr.json())
      if (tr.ok) setTasks(await tr.json())
      
      // Simuler des utilisateurs pour l'assignation
      setUsers([
        { id: 1, personal_identifier: 'romain', first_name: 'Romain' },
        { id: 2, personal_identifier: 'thibaud', first_name: 'Thibaud' }
      ])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return tasks.filter(t => {
      const matchQ = !q || (t.title||'').toLowerCase().includes(q)
      const matchP = projectId === 'all' || t.project === projectId
      const matchPr = priority === 'all' || t.priority === priority
      const matchA = assigneeId === 'all' || t.assignee === assigneeId
      return matchQ && matchP && matchPr && matchA
    })
  }, [tasks, query, projectId, priority, assigneeId])

  // Drag & Drop
  const [dragId, setDragId] = useState<number | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, taskId: number) => {
    console.log('Drag start:', taskId)
    setDragId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId.toString())
  }
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, status: string) => {
    e.preventDefault()
    console.log('Drag enter:', status)
    if (dragId) {
      setDragOverColumn(status)
    }
  }
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Ne pas réinitialiser immédiatement pour éviter les clignotements
  }
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, newStatus: typeof statuses[number]) => {
    e.preventDefault()
    console.log('Drop:', dragId, 'vers', newStatus)
    
    if (!dragId) {
      console.log('Pas de dragId')
      return
    }
    
    // Trouver la tâche actuelle
    const currentTask = tasks.find(t => t.id === dragId)
    if (!currentTask) {
      console.log('Tâche non trouvée')
      return
    }
    
    // Ne rien faire si c'est le même statut
    if (currentTask.status === newStatus) {
      console.log('Même statut, pas de changement')
      setDragId(null)
      setDragOverColumn(null)
      return
    }
    
    try {
      console.log(`Déplacement de la tâche ${dragId} de ${currentTask.status} vers ${newStatus}`)
      
      const res = await fetch(`${api}/api/tasks/${dragId}/move/`, { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({ status: newStatus }) 
      })
      
      console.log('Response status:', res.status)
      
      if (res.ok) {
        const updatedTask = await res.json()
        console.log('Tâche mise à jour:', updatedTask)
        
        // Mettre à jour la tâche dans la liste locale
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === dragId ? { ...t, status: newStatus } : t
          )
        )
      } else {
        const errorText = await res.text()
        console.error('Erreur API:', errorText)
        alert('Erreur lors du déplacement de la tâche')
      }
    } catch (error) {
      console.error('Erreur réseau:', error)
      alert('Erreur de connexion')
    } finally {
      setDragId(null)
      setDragOverColumn(null)
    }
  }

  // CRUD Operations
  const createTask = async () => {
    if (!newTask.title.trim()) return
    if (!newTask.project) return alert('Sélectionne un projet')
    
    try {
      const res = await fetch(api + '/api/tasks/', { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({
          ...newTask,
          tags: []
        })
      })
      if (res.ok) {
        setNewTask({
          title: '',
          description: '',
          project: 0,
          priority: 'medium',
          assignee: 0,
          due_date: '',
          status: 'todo'
        })
        setShowCreateForm(false)
        load()
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const updateTask = async (taskId: number, updates: Partial<Task>) => {
    try {
      const res = await fetch(api + `/api/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(updates)
      })
      if (res.ok) {
        load()
        setEditingTask(null)
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
    }
  }

  const deleteTask = async (taskId: number) => {
    if (!confirm('Supprimer cette tâche ?')) return
    try {
      const res = await fetch(api + `/api/tasks/${taskId}/`, {
        method: 'DELETE',
        headers: headers()
      })
      if (res.status === 204) {
        load()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  // Detail panel
  const [openId, setOpenId] = useState<number | null>(null)
  const [detail, setDetail] = useState<Task | null>(null)
  const openDetail = async (id: number) => {
    setOpenId(id)
    try {
      const res = await fetch(api + `/api/tasks/${id}/`, { headers: headers() })
      if (res.ok) setDetail(await res.json())
    } catch (error) {
      console.error('Erreur lors du chargement du détail:', error)
    }
  }
  const closeDetail = () => { setOpenId(null); setDetail(null) }

  const addComment = async (content: string) => {
    if (!detail) return
    try {
      const res = await fetch(api + '/api/comments/', { 
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({ task: detail.id, content }) 
      })
      if (res.ok) openDetail(detail.id)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error)
    }
  }

  const uploadAttachment = async (file: File) => {
    if (!detail) return
    try {
      const access = localStorage.getItem('access')
      const fd = new FormData()
      fd.append('task', String(detail.id))
      fd.append('file', file)
      await fetch(api + '/api/attachments/', { 
        method: 'POST', 
        headers: { Authorization: `Bearer ${access}` }, 
        body: fd 
      })
      openDetail(detail.id)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null
    return new Date(dateStr).toLocaleDateString('fr-FR')
  }

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
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
            Tâches
          </h1>
          <p className="text-neutral-400 mt-2">Organisez votre travail avec le Kanban</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle tâche
        </Button>
      </motion.div>

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
                placeholder="Rechercher une tâche..." 
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <Select value={projectId as any} onChange={e=>setProjectId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                <option value="all">Tous projets</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
              <Select value={priority} onChange={e=>setPriority(e.target.value as any)}>
                <option value="all">Toutes priorités</option>
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </Select>
              <Select value={assigneeId as any} onChange={e=>setAssigneeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}>
                <option value="all">Tous assignés</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.first_name || u.personal_identifier}</option>)}
              </Select>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statuses.map((st, i) => {
          const config = statusConfig[st]
          const StatusIcon = config.icon
          const tasksInColumn = filtered.filter(t => t.status === st)
          
          return (
            <motion.div
              key={st}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div
                className={`min-h-[600px] transition-all duration-200 rounded-xl ${
                  dragOverColumn === st ? 'ring-4 ring-accent bg-accent/10' : ''
                } ${dragId ? 'border-2 border-dashed border-accent/30' : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, st)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, st)}
              >
                <Card className="h-full"
              >
                <div className="p-4 border-b border-neutral-900/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${config.bgColor}`}>
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-xs text-neutral-500">{tasksInColumn.length} tâche{tasksInColumn.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setNewTask({...newTask, status: st})
                        setShowCreateForm(true)
                      }} 
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {tasksInColumn.map((t, j) => {
                    const PriorityIcon = priorityConfig[t.priority as keyof typeof priorityConfig]?.icon || Circle
                    return (
                      <motion.div
                        key={t.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: j * 0.05 }}
                        draggable={true}
                        onDragStart={(e)=>handleDragStart(e, t.id)} 
                        onClick={()=>openDetail(t.id)} 
                        className={`group p-4 rounded-lg bg-background/80 backdrop-blur border border-neutral-900/60 cursor-grab active:cursor-grabbing hover:border-accent/50 transition-all duration-200 ${
                          dragId === t.id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-medium text-sm leading-tight group-hover:text-accent transition-colors flex-1 pr-2">
                            {t.title}
                          </h4>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                setEditingTask(t)
                              }}
                              className="p-1 h-6 w-6"
                            >
                              <Edit3 className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteTask(t.id)
                              }}
                              className="p-1 h-6 w-6"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            tone={priorityConfig[t.priority as keyof typeof priorityConfig]?.color as any || 'neutral'}
                            className="text-xs"
                          >
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {priorityConfig[t.priority as keyof typeof priorityConfig]?.label || t.priority}
                          </Badge>
                          
                          {t.due_date && (
                            <div className={`flex items-center gap-1 text-xs ${isOverdue(t.due_date) ? 'text-red-400' : 'text-neutral-500'}`}>
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(t.due_date)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <div className="flex items-center gap-3">
                            {(t.comments?.length || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{t.comments?.length}</span>
                              </div>
                            )}
                            {(t.attachments?.length || 0) > 0 && (
                              <div className="flex items-center gap-1">
                                <Paperclip className="w-3 h-3" />
                                <span>{t.attachments?.length}</span>
                              </div>
                            )}
                          </div>
                          
                          {t.assignee_name && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{t.assignee_name}</span>
                            </div>
                          )}
                        </div>

                        {t.project_name && (
                          <div className="mt-2 text-xs text-neutral-600 truncate">
                            📁 {t.project_name}
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                  
                  {tasksInColumn.length === 0 && (
                    <div className={`text-center py-12 transition-all duration-200 ${
                      dragId && dragOverColumn === st 
                        ? 'text-accent border-4 border-dashed border-accent rounded-lg bg-accent/10 scale-105' 
                        : 'text-neutral-500'
                    }`}>
                      <StatusIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-medium">
                        {dragId && dragOverColumn === st 
                          ? '🎯 Déposer ici !' 
                          : 'Aucune tâche'
                        }
                      </p>
                      {dragId && dragOverColumn === st && (
                        <p className="text-sm text-accent/70 mt-1">
                          Relâchez pour déplacer la tâche
                        </p>
                      )}
                      {!dragId && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            setNewTask({...newTask, status: st})
                            setShowCreateForm(true)
                          }}
                          className="mt-3 gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Ajouter une tâche
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Zone de drop visible même avec des tâches */}
                  {dragId && tasksInColumn.length > 0 && (
                    <div className={`text-center py-6 mt-4 transition-all duration-200 ${
                      dragOverColumn === st 
                        ? 'text-accent border-4 border-dashed border-accent rounded-lg bg-accent/10' 
                        : 'border-2 border-dashed border-neutral-600 rounded-lg text-neutral-500'
                    }`}>
                      <p className="text-sm font-medium">
                        {dragOverColumn === st ? '🎯 Déposer ici !' : 'Zone de dépôt'}
                      </p>
                    </div>
                  )}
                </div>
                </Card>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvelle tâche
              </h3>
              
              <div className="space-y-4">
                <Input
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Titre de la tâche"
                />
                
                <textarea
                  value={newTask.description}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Description (optionnel)"
                  className="w-full p-3 bg-background border border-neutral-900 rounded-lg resize-none h-20"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={newTask.project}
                    onChange={e => setNewTask({...newTask, project: Number(e.target.value)})}
                  >
                    <option value={0}>Sélectionner un projet</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                  
                  <Select
                    value={newTask.priority}
                    onChange={e => setNewTask({...newTask, priority: e.target.value})}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={newTask.assignee}
                    onChange={e => setNewTask({...newTask, assignee: Number(e.target.value)})}
                  >
                    <option value={0}>Non assigné</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name || u.personal_identifier}</option>)}
                  </Select>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Échéance</label>
                    <Input
                      type="date"
                      value={newTask.due_date}
                      onChange={e => setNewTask({...newTask, due_date: e.target.value})}
                    />
                  </div>
                </div>
                
                <Select
                  value={newTask.status}
                  onChange={e => setNewTask({...newTask, status: e.target.value as typeof statuses[number]})}
                >
                  <option value="todo">À faire</option>
                  <option value="doing">En cours</option>
                  <option value="done">Terminé</option>
                </Select>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={createTask}>Créer la tâche</Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Annuler</Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setEditingTask(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Éditer la tâche
              </h3>
              
              <div className="space-y-4">
                <Input
                  value={editingTask.title}
                  onChange={e => setEditingTask({...editingTask, title: e.target.value})}
                  placeholder="Titre de la tâche"
                />
                
                <textarea
                  value={editingTask.description || ''}
                  onChange={e => setEditingTask({...editingTask, description: e.target.value})}
                  placeholder="Description (optionnel)"
                  className="w-full p-3 bg-background border border-neutral-900 rounded-lg resize-none h-20"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={editingTask.project}
                    onChange={e => setEditingTask({...editingTask, project: Number(e.target.value)})}
                  >
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </Select>
                  
                  <Select
                    value={editingTask.priority}
                    onChange={e => setEditingTask({...editingTask, priority: e.target.value})}
                  >
                    <option value="low">Faible</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgente</option>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={editingTask.assignee || 0}
                    onChange={e => setEditingTask({...editingTask, assignee: Number(e.target.value) || undefined})}
                  >
                    <option value={0}>Non assigné</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name || u.personal_identifier}</option>)}
                  </Select>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Échéance</label>
                    <Input
                      type="date"
                      value={editingTask.due_date?.split('T')[0] || ''}
                      onChange={e => setEditingTask({...editingTask, due_date: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={() => updateTask(editingTask.id, editingTask)}>Sauvegarder</Button>
                <Button variant="ghost" onClick={() => setEditingTask(null)}>Annuler</Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Task Detail Panel */}
      {openId && detail && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 z-40" 
            onClick={closeDetail} 
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-surface/95 backdrop-blur-xl border-l border-neutral-900/60 z-50 shadow-2xl overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold truncate pr-4">{detail.title}</h2>
                <Button variant="ghost" size="sm" onClick={closeDetail}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <Badge tone={statusConfig[detail.status].label === 'Terminé' ? 'success' : statusConfig[detail.status].label === 'En cours' ? 'warning' : 'neutral'}>
                  {statusConfig[detail.status].label}
                </Badge>
                <Badge tone={priorityConfig[detail.priority as keyof typeof priorityConfig]?.color as any || 'neutral'}>
                  {priorityConfig[detail.priority as keyof typeof priorityConfig]?.label || detail.priority}
                </Badge>
                {detail.due_date && (
                  <Badge tone={isOverdue(detail.due_date) ? 'danger' : 'neutral'}>
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(detail.due_date)}
                  </Badge>
                )}
                {detail.assignee_name && (
                  <Badge tone="neutral">
                    <User className="w-3 h-3 mr-1" />
                    {detail.assignee_name}
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-2">Description</h3>
                <div className="bg-background/60 border border-neutral-900/60 rounded-lg p-4 min-h-[100px] whitespace-pre-wrap">
                  {detail.description || 'Aucune description'}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Commentaires ({detail.comments?.length || 0})
                </h3>
                <div className="space-y-3">
                  {detail.comments?.map((c:any)=> (
                    <motion.div 
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-background/60 border border-neutral-900/60 rounded-lg p-3"
                    >
                      <p className="text-sm">{c.content}</p>
                      <p className="text-xs text-neutral-500 mt-2">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </motion.div>
                  ))}
                  <AddComment onSubmit={addComment} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Pièces jointes ({detail.attachments?.length || 0})
                </h3>
                <div className="space-y-2">
                  {detail.attachments?.map((a:any)=> (
                    <div key={a.id} className="bg-background/60 border border-neutral-900/60 rounded-lg p-3">
                      <a 
                        className="text-sm text-accent hover:underline flex items-center gap-2" 
                        href={api + a.file} 
                        target="_blank"
                      >
                        <Paperclip className="w-3 h-3" />
                        {a.file.split('/').pop()}
                      </a>
                    </div>
                  ))}
                  <UploadAttachment onUpload={uploadAttachment} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

function AddComment({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [v, setV] = useState("")
  return (
    <form onSubmit={(e)=>{e.preventDefault(); if(v.trim()){ onSubmit(v.trim()); setV("")}}} className="flex gap-2">
      <Input 
        value={v} 
        onChange={e=>setV(e.target.value)} 
        placeholder="Ajouter un commentaire..." 
        className="flex-1" 
      />
      <Button type="submit" size="sm" className="gap-1">
        <Send className="w-3 h-3" />
      </Button>
    </form>
  )
}

function UploadAttachment({ onUpload }: { onUpload: (file: File) => void }) {
  return (
    <label className="flex items-center gap-2 p-3 border-2 border-dashed border-neutral-800 rounded-lg cursor-pointer hover:border-accent/50 transition-colors">
      <Upload className="w-4 h-4 text-neutral-500" />
      <span className="text-sm text-neutral-400">Ajouter un fichier</span>
      <input 
        type="file" 
        className="hidden" 
        onChange={e=>{ const f = e.target.files?.[0]; if(f) onUpload(f) }} 
      />
    </label>
  )
}