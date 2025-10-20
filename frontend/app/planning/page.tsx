"use client"
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  Users,
  Briefcase,
  Coffee,
  User,
  Zap,
  MoreHorizontal
} from 'lucide-react'

type Event = {
  id: number | string
  title: string
  description?: string
  event_type: string
  start_datetime: string
  end_datetime: string
  all_day: boolean
  location?: string
  color: string
  project_name?: string
  task_title?: string
  duration_minutes: number
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'todo' | 'doing' | 'done'
  task_id?: number
}

type Task = {
  id: number
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'doing' | 'done'
  project: number
  assignee?: number
  project_name?: string
}

const eventTypeConfig = {
  work: { label: 'Travail', icon: Briefcase, color: '#3B82F6' },
  meeting: { label: 'Réunion', icon: Users, color: '#8B5CF6' },
  break: { label: 'Pause', icon: Coffee, color: '#10B981' },
  personal: { label: 'Personnel', icon: User, color: '#F59E0B' },
  focus: { label: 'Focus Time', icon: Zap, color: '#EF4444' },
  deadline: { label: 'Échéance', icon: CalendarIcon, color: '#DC2626' },
  other: { label: 'Autre', icon: MoreHorizontal, color: '#6B7280' }
}

const priorityColors = {
  low: '#10B981',
  medium: '#F59E0B', 
  high: '#F97316',
  urgent: '#DC2626'
}

export default function PlanningPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'work',
    start_datetime: '',
    end_datetime: '',
    all_day: false,
    location: '',
    color: '#3B82F6'
  })

  const api = process.env.NEXT_PUBLIC_API_URL

  const headers = () => {
    const access = localStorage.getItem("access")
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const loadEvents = async () => {
    let startDate, endDate

    if (view === 'day') {
      startDate = new Date(currentDate)
      endDate = new Date(currentDate)
    } else if (view === 'week') {
      startDate = new Date(currentDate)
      startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
      endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
    } else { // month
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    }

    const params = new URLSearchParams({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    })

    // Charger les événements
    const eventsRes = await fetch(`${api}/api/events/?${params}`, { headers: headers() })
    if (eventsRes.ok) {
      const eventsData = await eventsRes.json()
      setEvents(eventsData)
    }

    // Charger les tâches avec deadlines dans la période
    const tasksRes = await fetch(`${api}/api/tasks/`, { headers: headers() })
    if (tasksRes.ok) {
      const tasksData = await tasksRes.json()
      // Filtrer les tâches qui ont une deadline dans la période affichée
      const tasksWithDeadlines = tasksData.filter((task: Task) => {
        if (!task.due_date) return false
        const dueDate = new Date(task.due_date)
        return dueDate >= startDate && dueDate <= endDate
      })
      setTasks(tasksWithDeadlines)
    }
  }

  useEffect(() => { loadEvents() }, [currentDate, view])

  const createEvent = async () => {
    const res = await fetch(`${api}/api/events/`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(newEvent)
    })
    if (res.ok) {
      setNewEvent({
        title: '',
        description: '',
        event_type: 'work',
        start_datetime: '',
        end_datetime: '',
        all_day: false,
        location: '',
        color: '#3B82F6'
      })
      setShowCreateForm(false)
      loadEvents()
    }
  }

  const deleteEvent = async (id: number) => {
    if (!confirm('Supprimer cet événement ?')) return
    const res = await fetch(`${api}/api/events/${id}/`, {
      method: 'DELETE',
      headers: headers()
    })
    if (res.status === 204) {
      loadEvents()
      setSelectedEvent(null)
    }
  }

  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  const getWeekDays = () => {
    const start = new Date(currentDate)
    start.setDate(currentDate.getDate() - currentDate.getDay() + 1)
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getEventsForDay = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    const dayEvents = events.filter(e => e.start_datetime.startsWith(dateStr))
    
    // Ajouter les deadlines des tâches pour ce jour
    const dayTasks = tasks.filter(task => task.due_date === dateStr).map(task => ({
      id: `task-${task.id}`,
      title: `📋 ${task.title}`,
      description: task.description || `Échéance de la tâche: ${task.title}`,
      event_type: 'deadline',
      start_datetime: `${dateStr}T23:59:00`,
      end_datetime: `${dateStr}T23:59:00`,
      all_day: true,
      location: task.project_name || '',
      color: priorityColors[task.priority],
      project_name: task.project_name,
      task_title: task.title,
      duration_minutes: 0,
      priority: task.priority,
      status: task.status,
      task_id: task.id
    }))
    
    return [...dayEvents, ...dayTasks]
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1) // Start from Monday
    
    const days = []
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getDayHours = () => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      hours.push(i)
    }
    return hours
  }

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const weekDays = getWeekDays()
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            Planning
          </h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">Gérez votre emploi du temps et vos événements</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 bg-neutral-900/50 rounded-lg p-1">
            <Button 
              variant={view === 'day' ? 'primary' : 'ghost'} 
              onClick={() => setView('day')}
              size="sm"
            >
              Jour
            </Button>
            <Button 
              variant={view === 'week' ? 'primary' : 'ghost'} 
              onClick={() => setView('week')}
              size="sm"
            >
              Semaine
            </Button>
            <Button 
              variant={view === 'month' ? 'primary' : 'ghost'} 
              onClick={() => setView('month')}
              size="sm"
            >
              Mois
            </Button>
          </div>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvel événement</span>
            <span className="sm:hidden">Nouveau</span>
          </Button>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('prev')} className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Précédent
            </Button>
            
            <h2 className="text-xl font-semibold">
              {view === 'week' 
                ? `Semaine du ${weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                : view === 'day'
                ? currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
              }
            </h2>
            
            <Button variant="ghost" onClick={() => navigate('next')} className="gap-2">
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Day View */}
      {view === 'day' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-neutral-900/50 bg-neutral-950/50">
              <h3 className="text-lg font-semibold text-center">
                {currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto">
              {getDayHours().map(hour => {
                const hourEvents = events.filter(e => {
                  const eventHour = new Date(e.start_datetime).getHours()
                  return eventHour === hour && e.start_datetime.startsWith(currentDate.toISOString().split('T')[0])
                })
                
                return (
                  <div key={hour} className="flex border-b border-neutral-900/30">
                    <div className="w-16 p-3 text-sm text-neutral-500 border-r border-neutral-900/30">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 p-3 min-h-[60px]">
                      {hourEvents.map((event, j) => {
                        const EventIcon = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.icon || Clock
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: j * 0.05 }}
                            onClick={() => setSelectedEvent(event)}
                            className="group cursor-pointer mb-2"
                          >
                            <div 
                              className="p-3 rounded-lg border border-neutral-900/60 hover:border-accent/50 transition-all"
                              style={{ backgroundColor: `${event.color}15`, borderColor: `${event.color}40` }}
                            >
                            <div className="flex items-center gap-2 mb-1">
                              <EventIcon className="w-4 h-4" style={{ color: event.color }} />
                              <span className="font-medium group-hover:text-accent transition-colors">
                                {event.title}
                              </span>
                              {event.priority && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {event.priority === 'urgent' ? 'URGENT' : 
                                   event.priority === 'high' ? 'HAUTE' :
                                   event.priority === 'medium' ? 'MOYENNE' : 'BASSE'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {event.event_type === 'deadline' ? 'Échéance' : 
                               event.all_day ? 'Toute la journée' : 
                               `${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.status && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                <span className={`px-2 py-0.5 rounded-full ${
                                  event.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                  event.status === 'doing' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {event.status === 'done' ? 'Terminé' :
                                   event.status === 'doing' ? 'En cours' : 'À faire'}
                                </span>
                              </div>
                            )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid md:grid-cols-7 border-b border-neutral-900/50">
              {weekDays.map((day, i) => {
                const isToday = day.toDateString() === new Date().toDateString()
                return (
                  <div 
                    key={day.toISOString()} 
                    className={`p-4 text-center border-r border-neutral-900/50 last:border-r-0 ${
                      isToday ? 'bg-accent/10' : 'bg-neutral-950/50'
                    }`}
                  >
                    <div className="text-sm text-neutral-400 uppercase tracking-wide">
                      {dayNames[i]}
                    </div>
                    <div className={`text-lg font-semibold mt-1 ${isToday ? 'text-accent' : ''}`}>
                      {day.getDate()}
                    </div>
                    {isToday && <div className="text-xs text-accent/70">Aujourd'hui</div>}
                  </div>
                )
              })}
            </div>

            {/* Events - Desktop */}
            <div className="hidden md:grid md:grid-cols-7 min-h-[600px]">
              {weekDays.map((day, i) => {
                const dayEvents = getEventsForDay(day)
                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-r border-neutral-900/50 last:border-r-0 p-3 space-y-2"
                  >
                    {dayEvents.map((event, j) => {
                      const EventIcon = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.icon || Clock
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.05 }}
                          onClick={() => setSelectedEvent(event)}
                          className="group cursor-pointer"
                        >
                          <div 
                            className="p-3 rounded-lg border border-neutral-900/60 hover:border-accent/50 transition-all"
                            style={{ backgroundColor: `${event.color}15`, borderColor: `${event.color}40` }}
                          >
                            <div className="flex items-center gap-1 mb-1">
                              <EventIcon className="w-3 h-3 flex-shrink-0" style={{ color: event.color }} />
                              <span className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                                {event.title}
                              </span>
                              {event.priority && (
                                <span className={`text-xs px-1 py-0.5 rounded font-medium flex-shrink-0 ${
                                  event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {event.priority === 'urgent' ? 'U' : 
                                   event.priority === 'high' ? 'H' :
                                   event.priority === 'medium' ? 'M' : 'L'}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-neutral-500">
                              {event.event_type === 'deadline' ? 'Échéance' : 
                               event.all_day ? 'Toute la journée' : 
                               `${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                <MapPin className="w-2 h-2" />
                                <span className="truncate">{event.location}</span>
                              </div>
                            )}
                            {event.status && (
                              <div className="mt-1">
                                <span className={`text-xs px-1 py-0.5 rounded ${
                                  event.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                  event.status === 'doing' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {event.status === 'done' ? '✓' :
                                   event.status === 'doing' ? '⏳' : '○'}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                    
                    {dayEvents.length === 0 && (
                      <div className="text-center py-8 text-neutral-600">
                        <Clock className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        <p className="text-xs opacity-50">Aucun événement</p>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* Events - Mobile */}
            <div className="md:hidden space-y-4 p-4">
              {weekDays.map((day, i) => {
                const dayEvents = getEventsForDay(day)
                const isToday = day.toDateString() === new Date().toDateString()
                return (
                  <div key={day.toISOString()} className="space-y-2">
                    <div className={`p-3 rounded-lg ${isToday ? 'bg-accent/10' : 'bg-neutral-950/50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-neutral-400 uppercase tracking-wide">
                            {dayNames[i]}
                          </div>
                          <div className={`text-lg font-semibold ${isToday ? 'text-accent' : ''}`}>
                            {day.getDate()}
                          </div>
                        </div>
                        {isToday && <div className="text-xs text-accent/70">Aujourd'hui</div>}
                      </div>
                    </div>
                    
                    {dayEvents.map((event, j) => {
                      const EventIcon = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.icon || Clock
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: j * 0.05 }}
                          onClick={() => setSelectedEvent(event)}
                          className="group cursor-pointer"
                        >
                          <div 
                            className="p-3 rounded-lg border border-neutral-900/60 hover:border-accent/50 transition-all"
                            style={{ backgroundColor: `${event.color}15`, borderColor: `${event.color}40` }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <EventIcon className="w-4 h-4" style={{ color: event.color }} />
                              <span className="font-medium group-hover:text-accent transition-colors">
                                {event.title}
                              </span>
                              {event.priority && (
                                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                  event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                  event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                  event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>
                                  {event.priority === 'urgent' ? 'URGENT' : 
                                   event.priority === 'high' ? 'HAUTE' :
                                   event.priority === 'medium' ? 'MOYENNE' : 'BASSE'}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-neutral-500">
                              {event.event_type === 'deadline' ? 'Échéance' : 
                               event.all_day ? 'Toute la journée' : 
                               `${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 text-sm text-neutral-500">
                                <MapPin className="w-3 h-3" />
                                <span>{event.location}</span>
                              </div>
                            )}
                            {event.status && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                <span className={`px-2 py-0.5 rounded-full ${
                                  event.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                  event.status === 'doing' ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {event.status === 'done' ? 'Terminé' :
                                   event.status === 'doing' ? 'En cours' : 'À faire'}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )
                    })}
                    
                    {dayEvents.length === 0 && (
                      <div className="text-center py-4 text-neutral-600">
                        <p className="text-sm opacity-50">Aucun événement</p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Month View */}
      {view === 'month' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-neutral-900/50">
              {dayNames.map((dayName, i) => (
                <div key={i} className="p-3 text-center border-r border-neutral-900/50 last:border-r-0 bg-neutral-950/50">
                  <div className="text-sm text-neutral-400 uppercase tracking-wide font-medium">
                    <span className="hidden sm:inline">{dayName}</span>
                    <span className="sm:hidden">{dayName.charAt(0)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {getMonthDays().map((day, i) => {
                const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                const isToday = day.toDateString() === new Date().toDateString()
                const dayEvents = getEventsForDay(day)
                
                return (
                  <motion.div
                    key={day.toISOString()}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className={`min-h-[80px] sm:min-h-[120px] border-r border-b border-neutral-900/30 last:border-r-0 p-1 sm:p-2 ${
                      !isCurrentMonth ? 'bg-neutral-900/20' : ''
                    } ${isToday ? 'bg-accent/5' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !isCurrentMonth ? 'text-neutral-600' : isToday ? 'text-accent' : 'text-neutral-300'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, j) => {
                        const EventIcon = eventTypeConfig[event.event_type as keyof typeof eventTypeConfig]?.icon || Clock
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: j * 0.02 }}
                            onClick={() => setSelectedEvent(event)}
                            className="group cursor-pointer"
                          >
                            <div 
                              className="p-1 sm:p-2 rounded text-xs border border-neutral-900/60 hover:border-accent/50 transition-all"
                              style={{ backgroundColor: `${event.color}15`, borderColor: `${event.color}40` }}
                            >
                              <div className="flex items-center gap-1">
                                <EventIcon className="w-2 h-2 sm:w-3 sm:h-3 flex-shrink-0" style={{ color: event.color }} />
                                <span className="font-medium truncate group-hover:text-accent transition-colors text-xs">
                                  {event.title}
                                </span>
                                {event.priority && (
                                  <span className={`text-xs px-1 py-0.5 rounded flex-shrink-0 hidden sm:inline ${
                                    event.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    event.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    event.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {event.priority === 'urgent' ? 'U' : 
                                     event.priority === 'high' ? 'H' :
                                     event.priority === 'medium' ? 'M' : 'L'}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-neutral-500 hidden sm:block">
                                {event.event_type === 'deadline' ? 'Échéance' : 
                                 event.all_day ? 'Journée' : formatTime(event.start_datetime)}
                                {event.status && (
                                  <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                    event.status === 'done' ? 'bg-green-500/20 text-green-400' :
                                    event.status === 'doing' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-gray-500/20 text-gray-400'
                                  }`}>
                                    {event.status === 'done' ? '✓' :
                                     event.status === 'doing' ? '⏳' : '○'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                      
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-neutral-500 px-1">
                          +{dayEvents.length - 3} autres
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Create Event Form */}
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
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Nouvel événement
              </h3>
              
              <div className="space-y-4">
                <Input
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Titre de l'événement"
                />
                
                <Select
                  value={newEvent.event_type}
                  onChange={e => setNewEvent({...newEvent, event_type: e.target.value})}
                >
                  {Object.entries(eventTypeConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </Select>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Début</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.start_datetime}
                      onChange={e => setNewEvent({...newEvent, start_datetime: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Fin</label>
                    <Input
                      type="datetime-local"
                      value={newEvent.end_datetime}
                      onChange={e => setNewEvent({...newEvent, end_datetime: e.target.value})}
                    />
                  </div>
                </div>
                
                <Input
                  value={newEvent.location}
                  onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Lieu (optionnel)"
                />
                
                <textarea
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Description (optionnel)"
                  className="w-full p-3 bg-background border border-neutral-900 rounded-lg resize-none h-20"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button onClick={createEvent} className="flex-1">Créer</Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)} className="flex-1">Annuler</Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                  {selectedEvent.priority && (
                    <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                      selectedEvent.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                      selectedEvent.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      selectedEvent.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {selectedEvent.priority === 'urgent' ? 'URGENT' : 
                       selectedEvent.priority === 'high' ? 'HAUTE' :
                       selectedEvent.priority === 'medium' ? 'MOYENNE' : 'BASSE'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {selectedEvent.event_type !== 'deadline' && (
                    <Button variant="ghost" size="sm">
                      <Edit3 className="w-4 h-4" />
                    </Button>
                  )}
                  {selectedEvent.event_type !== 'deadline' && (
                    <Button variant="danger" size="sm" onClick={() => deleteEvent(selectedEvent.id as number)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm">
                    {selectedEvent.event_type === 'deadline' ? 'Échéance' :
                     selectedEvent.all_day 
                      ? 'Toute la journée'
                      : `${formatTime(selectedEvent.start_datetime)} - ${formatTime(selectedEvent.end_datetime)}`
                    }
                  </span>
                </div>
                
                {selectedEvent.status && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <span className={`w-3 h-3 rounded-full ${
                        selectedEvent.status === 'done' ? 'bg-green-500' :
                        selectedEvent.status === 'doing' ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}></span>
                    </div>
                    <span className="text-sm">
                      Statut: {selectedEvent.status === 'done' ? 'Terminé' :
                               selectedEvent.status === 'doing' ? 'En cours' : 'À faire'}
                    </span>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm">
                      {selectedEvent.event_type === 'deadline' ? `Projet: ${selectedEvent.location}` : selectedEvent.location}
                    </span>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-400">{selectedEvent.description}</p>
                  </div>
                )}

                {selectedEvent.event_type === 'deadline' && selectedEvent.task_id && (
                  <div className="mt-4 p-3 bg-neutral-900/50 rounded-lg">
                    <p className="text-sm text-neutral-400 mb-2">Actions de la tâche:</p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          // Rediriger vers la page des tâches
                          window.location.href = `/tasks?task=${selectedEvent.task_id}`
                        }}
                      >
                        Voir la tâche
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button onClick={() => setSelectedEvent(null)}>Fermer</Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
