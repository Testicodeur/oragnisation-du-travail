"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  LogOut,
  Save,
  Trash2,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader
} from 'lucide-react'

type UserProfile = {
  id: number
  personal_identifier: string
  first_name: string
  last_name: string
  email: string
  full_name: string
  date_joined: string
}

type NotificationPrefs = {
  email: boolean
  telegram: boolean
  task_complete: boolean
  project_deadline: boolean
  daily_summary: boolean
  weekly_report: boolean
}

type AppearancePrefs = {
  theme: 'light' | 'dark'
  accent_color: string
  sidebar_collapsed: boolean
  animations_enabled: boolean
}

type PasswordData = {
  current_password: string
  new_password: string
  confirm_password: string
}

export default function SettingsPage() {
  const api = process.env.NEXT_PUBLIC_API_URL
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // États pour les données
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    email: true,
    telegram: false,
    task_complete: true,
    project_deadline: true,
    daily_summary: false,
    weekly_report: true
  })
  const [appearance, setAppearance] = useState<AppearancePrefs>({
    theme: 'dark',
    accent_color: '#8b5cf6',
    sidebar_collapsed: false,
    animations_enabled: true
  })
  const [passwordData, setPasswordData] = useState<PasswordData>({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const headers = () => {
    const access = localStorage.getItem("access")
    if (!access) {
      window.location.href = "/login"
      return {}
    }
    return { Authorization: `Bearer ${access}`, "Content-Type": "application/json" }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  // Charger les données au montage
  useEffect(() => {
    console.log('API URL:', api)
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setLoading(true)
    try {
      console.log('Loading data from:', `${api}/api/users/profile/`)
      const [profileRes, notifRes, appearanceRes] = await Promise.all([
        fetch(`${api}/api/users/profile/`, { headers: headers() }),
        fetch(`${api}/api/users/preferences/notifications/`, { headers: headers() }),
        fetch(`${api}/api/users/preferences/appearance/`, { headers: headers() })
      ])

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setProfile(profileData)
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifications(notifData)
      }

      if (appearanceRes.ok) {
        const appearanceData = await appearanceRes.json()
        setAppearance(appearanceData)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      showMessage('error', 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return
    setLoading(true)
    try {
      console.log('Saving profile:', profile)
      const res = await fetch(`${api}/api/users/profile/`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(profile)
      })
      console.log('Profile response:', res.status)
      if (res.ok) {
        const updatedProfile = await res.json()
        setProfile(updatedProfile)
        showMessage('success', 'Profil mis à jour avec succès')
      } else {
        const error = await res.json()
        console.error('Profile error:', error)
        showMessage('error', error.detail || 'Erreur lors de la mise à jour du profil')
      }
    } catch (error) {
      console.error('Profile catch error:', error)
      showMessage('error', 'Erreur lors de la mise à jour du profil')
    } finally {
      setLoading(false)
    }
  }

  const saveNotifications = async () => {
    setLoading(true)
    try {
      console.log('Saving notifications:', notifications)
      const res = await fetch(`${api}/api/users/preferences/notifications/`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(notifications)
      })
      console.log('Notifications response:', res.status)
      if (res.ok) {
        showMessage('success', 'Préférences de notification mises à jour')
      } else {
        const error = await res.json()
        console.error('Notifications error:', error)
        showMessage('error', 'Erreur lors de la mise à jour des notifications')
      }
    } catch (error) {
      console.error('Notifications catch error:', error)
      showMessage('error', 'Erreur lors de la mise à jour des notifications')
    } finally {
      setLoading(false)
    }
  }

  const saveAppearance = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${api}/api/users/preferences/appearance/`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(appearance)
      })
      if (res.ok) {
        showMessage('success', 'Préférences d\'apparence mises à jour')
        // Appliquer le thème immédiatement
        document.documentElement.className = appearance.theme
      } else {
        showMessage('error', 'Erreur lors de la mise à jour de l\'apparence')
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de la mise à jour de l\'apparence')
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      showMessage('error', 'Les nouveaux mots de passe ne correspondent pas')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`${api}/api/users/change-password/`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(passwordData)
      })
      if (res.ok) {
        showMessage('success', 'Mot de passe changé avec succès')
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' })
      } else {
        const error = await res.json()
        showMessage('error', error.detail || 'Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      showMessage('error', 'Erreur lors du changement de mot de passe')
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    try {
      const res = await fetch(`${api}/api/users/export-data/`, { headers: headers() })
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `workflow_data_${profile?.personal_identifier || 'user'}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showMessage('success', 'Données exportées avec succès')
      } else {
        showMessage('error', 'Erreur lors de l\'export des données')
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de l\'export des données')
    }
  }

  const deleteAllData = async () => {
    const password = prompt('Entrez votre mot de passe pour confirmer la suppression de TOUTES vos données:')
    if (!password) return

    if (!confirm('ATTENTION: Cette action est IRRÉVERSIBLE. Toutes vos données seront supprimées définitivement. Êtes-vous sûr ?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${api}/api/users/delete-data/`, {
        method: 'DELETE',
        headers: headers(),
        body: JSON.stringify({ password })
      })
      if (res.ok) {
        const result = await res.json()
        showMessage('success', 'Toutes les données ont été supprimées')
        // Recharger les données
        setTimeout(() => loadAllData(), 2000)
      } else {
        const error = await res.json()
        showMessage('error', error.error || 'Erreur lors de la suppression')
      }
    } catch (error) {
      showMessage('error', 'Erreur lors de la suppression des données')
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  const sections = [
    {
      id: 'profile',
      title: 'Profil utilisateur',
      icon: User,
      description: 'Gérez vos informations personnelles'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'Configurez vos préférences de notification'
    },
    {
      id: 'security',
      title: 'Sécurité',
      icon: Shield,
      description: 'Mot de passe et paramètres de sécurité'
    },
    {
      id: 'appearance',
      title: 'Apparence',
      icon: Palette,
      description: 'Thème et préférences visuelles'
    },
    {
      id: 'data',
      title: 'Données',
      icon: Database,
      description: 'Sauvegarde et gestion des données'
    }
  ]

  const [activeSection, setActiveSection] = useState('profile')

  const accentColors = [
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Bleu', value: '#3b82f6' },
    { name: 'Emeraude', value: '#10b981' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Orange', value: '#f59e0b' },
    { name: 'Rouge', value: '#ef4444' }
  ]

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-violet-400 bg-clip-text text-transparent">
            Paramètres
          </h1>
          <p className="text-slate-400 mt-2">Configurez votre espace de travail</p>
        </div>
        <Button onClick={logout} variant="danger" className="gap-2">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </motion.div>

      {/* Message de notification */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-4">
            <nav className="space-y-2">
              {sections.map((section, i) => {
                const Icon = section.icon
                return (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeSection === section.id 
                        ? 'bg-accent/20 border border-accent/50 text-accent' 
                        : 'hover:bg-slate-800/50 text-slate-300 hover:text-accent'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div>
                      <div className="font-medium text-sm">{section.title}</div>
                      <div className="text-xs text-slate-500">{section.description}</div>
                    </div>
                  </motion.button>
                )
              })}
            </nav>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <Card className="p-8">
            {activeSection === 'profile' && profile && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <User className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-semibold">Profil utilisateur</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Prénom</label>
                    <Input 
                      value={profile.first_name}
                      onChange={e => setProfile({...profile, first_name: e.target.value})}
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Nom</label>
                    <Input 
                      value={profile.last_name}
                      onChange={e => setProfile({...profile, last_name: e.target.value})}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Email</label>
                    <Input 
                      value={profile.email}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      placeholder="votre@email.com"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Identifiant personnel</label>
                    <Input 
                      value={profile.personal_identifier}
                      onChange={e => setProfile({...profile, personal_identifier: e.target.value})}
                      placeholder="Identifiant unique"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={saveProfile} disabled={loading} className="gap-2">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                  </Button>
                  <Button variant="ghost" onClick={loadAllData}>Annuler</Button>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-semibold">Notifications</h2>
                </div>
                
                <div className="space-y-4">
                  {[
                    { key: 'email', title: 'Notifications par email', desc: 'Recevoir les notifications importantes par email' },
                    { key: 'telegram', title: 'Notifications Telegram', desc: 'Recevoir les notifications via Telegram' },
                    { key: 'task_complete', title: 'Tâches terminées', desc: 'Notification quand une tâche est marquée comme terminée' },
                    { key: 'project_deadline', title: 'Échéances de projet', desc: 'Alertes pour les deadlines de projets' },
                    { key: 'daily_summary', title: 'Résumé quotidien', desc: 'Résumé des tâches et événements du jour' },
                    { key: 'weekly_report', title: 'Rapport hebdomadaire', desc: 'Rapport de productivité hebdomadaire' }
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-white">{item.title}</h3>
                        <p className="text-sm text-slate-400">{item.desc}</p>
                      </div>
                      <Button 
                        variant={notifications[item.key as keyof NotificationPrefs] ? "primary" : "ghost"}
                        onClick={() => setNotifications({...notifications, [item.key]: !notifications[item.key as keyof NotificationPrefs]})}
                      >
                        {notifications[item.key as keyof NotificationPrefs] ? 'Activé' : 'Désactivé'}
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={saveNotifications} disabled={loading} className="gap-2">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Shield className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-semibold">Sécurité</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Mot de passe actuel</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordData.current_password}
                      onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Nouveau mot de passe</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordData.new_password}
                      onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">Confirmer le nouveau mot de passe</label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordData.confirm_password}
                      onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button onClick={changePassword} disabled={loading} className="gap-2">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Changer le mot de passe
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Palette className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-semibold">Apparence</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium mb-2 text-white">Thème</h3>
                    <p className="text-sm text-slate-400 mb-4">Choisissez entre le mode sombre et clair</p>
                    <div className="flex gap-3">
                      <Button 
                        variant={appearance.theme === 'dark' ? 'primary' : 'ghost'}
                        onClick={() => setAppearance({...appearance, theme: 'dark'})}
                      >
                        Mode sombre
                      </Button>
                      <Button 
                        variant={appearance.theme === 'light' ? 'primary' : 'ghost'}
                        onClick={() => setAppearance({...appearance, theme: 'light'})}
                      >
                        Mode clair
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium mb-2 text-white">Couleur d'accent</h3>
                    <p className="text-sm text-slate-400 mb-4">Personnalisez la couleur principale de l'interface</p>
                    <div className="flex gap-2 flex-wrap">
                      {accentColors.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setAppearance({...appearance, accent_color: color.value})}
                          className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                            appearance.accent_color === color.value ? 'border-white shadow-lg' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium mb-2 text-white">Options avancées</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-white">Animations</div>
                          <div className="text-xs text-slate-400">Activer les animations d'interface</div>
                        </div>
                        <Button 
                          variant={appearance.animations_enabled ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => setAppearance({...appearance, animations_enabled: !appearance.animations_enabled})}
                        >
                          {appearance.animations_enabled ? 'Activé' : 'Désactivé'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm text-white">Sidebar réduite</div>
                          <div className="text-xs text-slate-400">Réduire la barre latérale par défaut</div>
                        </div>
                        <Button 
                          variant={appearance.sidebar_collapsed ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => setAppearance({...appearance, sidebar_collapsed: !appearance.sidebar_collapsed})}
                        >
                          {appearance.sidebar_collapsed ? 'Activé' : 'Désactivé'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button onClick={saveAppearance} disabled={loading} className="gap-2">
                    {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Database className="w-6 h-6 text-accent" />
                  <h2 className="text-2xl font-semibold">Données</h2>
                </div>
                
                <div className="space-y-6">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium mb-2 text-white">Sauvegarde</h3>
                    <p className="text-sm text-slate-400 mb-4">Exportez toutes vos données (projets, tâches, événements) au format JSON</p>
                    <Button onClick={exportData} className="gap-2">
                      <Download className="w-4 h-4" />
                      Exporter les données
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                      <h3 className="font-medium text-red-400">Zone de danger</h3>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">
                      Cette action supprimera définitivement TOUTES vos données : projets, tâches, événements, commentaires, etc. 
                      Cette action est <strong>irréversible</strong>.
                    </p>
                    <Button variant="danger" onClick={deleteAllData} disabled={loading} className="gap-2">
                      {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Supprimer toutes les données
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}