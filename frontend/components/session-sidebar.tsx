"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { AuthModal } from '@/components/auth-modal'
import { CreditDisplay } from '@/components/credit-display'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { apiService, InterviewSession } from '@/lib/api-service'
import { sessionManager } from '@/lib/session-manager'
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  Building, 
  Briefcase, 
  Trash2, 
  LogIn, 
  User,
  LogOut,
  Settings,
  Crown,
  Gift
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface SessionSidebarProps {
  currentSessionId?: string
  onSessionSelect: (session: InterviewSession) => void
  onNewSession: () => void
  onSessionUpdate?: () => void  // Callback to refresh sessions
  className?: string
}

export function SessionSidebar({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession,
  onSessionUpdate,
  className 
}: SessionSidebarProps) {
  const { user, isAuthenticated, logout } = useAuth()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Load sessions when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      sessionManager.setUser(user)
      loadSessions()
    } else {
      sessionManager.clearCache()
      setSessions([])
    }
  }, [isAuthenticated, user])

  const loadSessions = async () => {
    if (!isAuthenticated) return

    try {
      setIsLoading(true)
      const sessions = await sessionManager.loadSessions()
      setSessions(sessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
      toast.error('Failed to load saved sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }
    
    const success = await sessionManager.deleteSession(sessionId)
    if (success && onSessionUpdate) {
      onSessionUpdate()
    }
  }

  const handleEditSession = async (sessionId: string, newName: string) => {
    const updatedSession = await sessionManager.updateSession(sessionId, {
      company_name: newName
    })
    
    if (updatedSession) {
      setEditingSession(null)
      setEditName('')
      toast.success('Session name updated')
      
      if (onSessionUpdate) {
        onSessionUpdate()
      }
    }
  }

  const startEditing = (session: InterviewSession, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingSession(session.id!)
    setEditName(session.company_name || session.job_title || 'Untitled Session')
  }

  const cancelEditing = () => {
    setEditingSession(null)
    setEditName('')
  }

  // Listen for session updates via custom events instead of polling
  useEffect(() => {
    if (!isAuthenticated) return

    const handleSessionCreated = (event: CustomEvent) => {
      const newSession = event.detail
      setSessions(prev => [newSession, ...prev])
    }

    const handleSessionUpdated = (event: CustomEvent) => {
      const { session: updatedSession, silent } = event.detail
      setSessions(prev => prev.map(session => 
        session.id === updatedSession.id ? updatedSession : session
      ))
      
      // Only show toast for non-silent updates (not auto-save)
      if (!silent) {
        // Toast already handled by session manager
      }
    }

    const handleSessionDeleted = (event: CustomEvent) => {
      const deletedSessionId = event.detail
      setSessions(prev => prev.filter(session => session.id !== deletedSessionId))
    }

    const handleSessionsBatchUpdated = (event: CustomEvent) => {
      const updatedSessions = event.detail
      setSessions(prev => {
        const updated = [...prev]
        updatedSessions.forEach((updatedSession: InterviewSession) => {
          const index = updated.findIndex(s => s.id === updatedSession.id)
          if (index !== -1) {
            updated[index] = updatedSession
          }
        })
        return updated
      })
    }

    // Listen for custom events
    window.addEventListener('sessionCreated', handleSessionCreated as EventListener)
    window.addEventListener('sessionUpdated', handleSessionUpdated as EventListener)
    window.addEventListener('sessionDeleted', handleSessionDeleted as EventListener)
    window.addEventListener('sessionsBatchUpdated', handleSessionsBatchUpdated as EventListener)

    return () => {
      window.removeEventListener('sessionCreated', handleSessionCreated as EventListener)
      window.removeEventListener('sessionUpdated', handleSessionUpdated as EventListener)
      window.removeEventListener('sessionDeleted', handleSessionDeleted as EventListener)
      window.removeEventListener('sessionsBatchUpdated', handleSessionsBatchUpdated as EventListener)
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    await logout()
    setSessions([])
    setShowUserMenu(false)
  }

  const filteredSessions = sessions.filter(session =>
    session.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.job_title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getSessionStats = (session: InterviewSession) => {
    const totalQuestions = session.questions.length
    const answeredQuestions = Object.keys(session.answers).filter(
      key => session.answers[key]?.trim().length > 0
    ).length
    const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0

    return { totalQuestions, answeredQuestions, completionPercentage }
  }

  if (!isAuthenticated) {
    // Anonymous user view
    return (
      <div className={`w-80 border-r bg-card/30 p-6 space-y-6 ${className}`}>
        <div className="space-y-4">
          {/* Credit display for anonymous users */}
          <CreditDisplay showUpgradeButton={true} showProgress={true} />
          
          <Separator />

          {/* Upgrade prompt */}
          <Alert className="border-blue-200 bg-blue-50">
            <Crown className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-3">
                <div>
                  <strong>🔒 Login to unlock:</strong>
                  <ul className="mt-2 text-sm space-y-1">
                    <li>• Save your interview sessions</li>
                    <li>• Access session history</li>
                    <li>• Get 50 free credits</li>
                    <li>• Unlimited session storage</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setShowAuthModal(true)}
                    className="flex-1"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAuthModal(true)}
                    className="flex-1"
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialTab="signup"
        />
      </div>
    )
  }

  // Authenticated user view
  return (
    <div className={`w-80 border-r bg-card/30 flex flex-col ${className}`}>
      {/* User header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </div>

        {/* User menu dropdown */}
        {showUserMenu && (
          <div className="mt-2 p-2 bg-background border rounded-lg shadow-lg">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}

        {/* Credit display */}
        <div className="mt-3">
          <CreditDisplay showUpgradeButton={!!(user?.credits && user.credits <= 10)} />
        </div>
      </div>

      {/* Sessions section */}
      <div className="flex-1 flex flex-col">
        {/* Action bar */}
        <div className="p-3 space-y-3 border-b border-border/50">
          <Button onClick={onNewSession} className="w-full h-9 font-medium shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-background/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 px-3 pt-1 pb-3 space-y-0.5 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading sessions...
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery ? 'No sessions match your search' : 'No saved sessions yet'}
              {!searchQuery && (
                <p className="text-xs mt-2">Create your first session to get started!</p>
              )}
            </div>
          ) : (
            filteredSessions.map((session) => {
              const stats = getSessionStats(session)
              const isActive = session.id === currentSessionId

              return (
                <div
                  key={session.id}
                  className={`relative cursor-pointer transition-all duration-200 group rounded-lg border ${
                    isActive 
                      ? 'bg-primary/5 border-primary/40 shadow-sm' 
                      : 'bg-background border-border/40 hover:bg-accent/30 hover:border-border/60 hover:shadow-sm'
                  }`}
                  onClick={() => onSessionSelect(session)}
                >
                  <div className="px-2.5 py-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        {editingSession === session.id ? (
                          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="text-xs h-6 border focus:ring-1 focus:ring-primary/20"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditSession(session.id!, editName)
                                } else if (e.key === 'Escape') {
                                  cancelEditing()
                                }
                              }}
                              autoFocus
                            />
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                className="h-5 px-2 text-xs"
                                onClick={() => handleEditSession(session.id!, editName)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-5 px-2 text-xs"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h4 className="font-medium text-xs text-foreground truncate leading-tight">
                              {session.company_name || session.job_title || 'Untitled Session'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <FileText className="w-3 h-3" />
                                <span className="text-xs">{stats.totalQuestions}</span>
                              </div>
                              {stats.totalQuestions > 0 && (
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs px-1.5 py-0 h-4 font-medium ${
                                    stats.completionPercentage === 100 
                                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                      : stats.completionPercentage >= 50
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30'
                                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                  }`}
                                >
                                  {stats.completionPercentage}%
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground/60 ml-auto">
                                {(() => {
                                  const now = new Date()
                                  const sessionDate = new Date(session.updated_at)
                                  const diffInMinutes = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60))
                                  
                                  if (diffInMinutes < 1) return 'now'
                                  if (diffInMinutes < 60) return `${diffInMinutes}m`
                                  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
                                  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d`
                                  return sessionDate.toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: '2-digit',
                                    year: '2-digit'
                                  })
                                })()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {editingSession !== session.id && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => startEditing(session, e)}
                                className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Settings className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => handleDeleteSession(session.id!, e)}
                                className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}