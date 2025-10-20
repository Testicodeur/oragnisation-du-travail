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
  id: number
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
}

const eventTypeConfig = {
  work: { label: 'Travail', icon: Briefcase, color: '#3B82F6' },
  meeting: { label: 'Réunion', icon: Users, color: '#8B5CF6' },
  break: { label: 'Pause', icon: Coffee, color: '#10B981' },
  personal: { label: 'Personnel', icon: User, color: '#F59E0B' },
  focus: { label: 'Focus Time', icon: Zap, color: '#EF4444' },
  other: { label: 'Autre', icon: MoreHorizontal, color: '#6B7280' }
}

export default function PlanningPage() {
  const [events, setEvents] = useState<Event[]>([])
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
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const params = new URLSearchParams({
      start_date: startOfWeek.toISOString().split('T')[0],
      end_date: endOfWeek.toISOString().split('T')[0]
    })

    const res = await fetch(`${api}/api/events/?${params}`, { headers: headers() })
    if (res.ok) {
      const data = await res.json()
      setEvents(data)
    }
  }

  useEffect(() => { loadEvents() }, [currentDate])

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
    return events.filter(e => e.start_datetime.startsWith(dateStr))
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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
            Planning
          </h1>
          <p className="text-neutral-400 mt-2">Gérez votre emploi du temps et vos événements</p>
        </div>
        <div className="flex gap-2">
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
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvel événement
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

      {/* Week View */}
      {view === 'week' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-7 border-b border-neutral-900/50">
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

            {/* Events */}
            <div className="grid grid-cols-7 min-h-[600px]">
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
                            <div className="flex items-center gap-2 mb-1">
                              <EventIcon className="w-3 h-3" style={{ color: event.color }} />
                              <span className="font-medium text-sm truncate group-hover:text-accent transition-colors">
                                {event.title}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">
                              {event.all_day ? 'Toute la journée' : `${formatTime(event.start_datetime)} - ${formatTime(event.end_datetime)}`}
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
                                <MapPin className="w-2 h-2" />
                                <span className="truncate">{event.location}</span>
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
            className="w-full max-w-md"
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
                
                <div className="grid grid-cols-2 gap-3">
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
              
              <div className="flex gap-2 mt-6">
                <Button onClick={createEvent}>Créer</Button>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>Annuler</Button>
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
            className="w-full max-w-md"
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedEvent.title}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteEvent(selectedEvent.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm">
                    {selectedEvent.all_day 
                      ? 'Toute la journée'
                      : `${formatTime(selectedEvent.start_datetime)} - ${formatTime(selectedEvent.end_datetime)}`
                    }
                  </span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}
                
                {selectedEvent.description && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-400">{selectedEvent.description}</p>
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
