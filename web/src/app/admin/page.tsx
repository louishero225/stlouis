'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Calendar,
    Users,
    Megaphone,
    Clock,
    BookOpen,
    Plus,
    MessageSquare,
    CalendarDays,
    Sparkles,
    ArrowRight,
    Bell as BellIcon,
    Settings,
    UserCircle2
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Stats = {
    pendingMassRequests: number
    upcomingEvents: number
    totalEvents: number
    activeAnnouncements: number
    totalAnnouncements: number
    activeGroups: number
    totalGroups: number
}

type Event = {
    id: string
    title: string
    date: string
    end_date: string | null
    event_type: string
    location: string | null
}

type Mass = {
    id: string
    day_of_week: string
    time_of_day: string
    description: string | null
    location: string | null
}

type Announcement = {
    id: string
    title: string
    created_at: string | null
    is_active: boolean | null
    priority: string | null
}

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function AdminDashboard() {
    const { parish, loading: tenantLoading } = useTenant()
    const [stats, setStats] = useState<Stats>({
        pendingMassRequests: 0,
        upcomingEvents: 0,
        totalEvents: 0,
        activeAnnouncements: 0,
        totalAnnouncements: 0,
        activeGroups: 0,
        totalGroups: 0
    })
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
    const [upcomingMasses, setUpcomingMasses] = useState<Mass[]>([])
    const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchDashboardData() {
            if (!parish) return

            try {
                setLoading(true)
                const now = new Date().toISOString()

                const [
                    eventsResult,
                    upcomingEventsResult,
                    massesResult,
                    groupsResult,
                    announcementsResult,
                    recentAnnouncementsResult,
                    massRequestsResult,
                ] = await Promise.all([
                    supabase.from('events').select('id', { count: 'exact', head: true }).eq('parish_id', parish.id),
                    supabase.from('events').select('*').eq('parish_id', parish.id).gte('date', now).order('date', { ascending: true }).limit(3),
                    supabase.from('masses').select('*').eq('parish_id', parish.id).order('day_of_week').limit(3),
                    supabase.from('groups').select('id, is_active').eq('parish_id', parish.id),
                    supabase.from('announcements').select('id, is_active').eq('parish_id', parish.id),
                    supabase.from('announcements').select('*').eq('parish_id', parish.id).order('created_at', { ascending: false }).limit(3),
                    supabase.from('mass_intentions').select('id, status').eq('parish_id', parish.id),
                ])

                const groups = groupsResult.data || []
                const announcements = announcementsResult.data || []
                const massRequests = massRequestsResult.data || []

                setStats({
                    pendingMassRequests: massRequests.filter(r => r.status === 'pending').length,
                    upcomingEvents: upcomingEventsResult.data?.length || 0,
                    totalEvents: eventsResult.count || 0,
                    activeAnnouncements: announcements.filter(a => a.is_active).length,
                    totalAnnouncements: announcements.length,
                    activeGroups: groups.filter(g => g.is_active).length,
                    totalGroups: groups.length
                })

                setUpcomingEvents(upcomingEventsResult.data || [])
                setUpcomingMasses(massesResult.data || [])
                setRecentAnnouncements(recentAnnouncementsResult.data || [])

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchDashboardData()
        }
    }, [parish])

    if (tenantLoading || loading) {
        return <div className="text-[var(--primary)] p-8">Chargement...</div>
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Tableau de bord
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Vue d'ensemble de votre paroisse
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {parish && (
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                            {parish.name}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" className="relative">
                        <BellIcon className="h-5 w-5" />
                        {stats.pendingMassRequests > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                    </Button>
                    <Link href="/admin/settings">
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pending Mass Requests - Highlighted */}
                <Link href="/admin/mass-requests">
                    <Card className="border-2 border-red-500 hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-red-600 uppercase tracking-wide">
                                    Demandes Messes
                                </CardTitle>
                                <BookOpen className="h-5 w-5 text-red-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-red-600">{stats.pendingMassRequests}</div>
                            <p className="text-sm text-red-600 mt-1">En attente</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Upcoming Events */}
                <Link href="/admin/events">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                    Événements à venir
                                </CardTitle>
                                <Calendar className="h-5 w-5 text-blue-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.upcomingEvents}</div>
                            <p className="text-sm text-gray-500 mt-1">{stats.totalEvents} au total</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Active Announcements */}
                <Link href="/admin/announcements">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                    Annonces Actives
                                </CardTitle>
                                <MessageSquare className="h-5 w-5 text-green-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.activeAnnouncements}</div>
                            <p className="text-sm text-gray-500 mt-1">{stats.totalAnnouncements} au total</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Active Groups */}
                <Link href="/admin/groups">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                                    Groupes Actifs
                                </CardTitle>
                                <Users className="h-5 w-5 text-purple-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.activeGroups}</div>
                            <p className="text-sm text-gray-500 mt-1">sur {stats.totalGroups} groupes</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/events/create">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full mb-3">
                                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nouvel Événement
                                </span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/announcements/create">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full mb-3">
                                    <MessageSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nouvelle Annonce
                                </span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/calendar">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full mb-3">
                                    <CalendarDays className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Ouvrir Calendrier
                                </span>
                            </CardContent>
                        </Card>
                    </Link>

                    <Link href="/admin/notifications/create">
                        <Card className="bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer h-full">
                            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                                <div className="bg-white/20 p-3 rounded-full mb-3">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">
                                    Notifier Paroissiens
                                </span>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Dates */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Prochaines Dates & Horaires</CardTitle>
                            <Link href="/admin/calendar">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    Voir tout
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {upcomingEvents.length === 0 && upcomingMasses.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                                Aucun événement planifié
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {/* Upcoming Events */}
                                {upcomingEvents.map((event) => (
                                    <div key={event.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                                        <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">{event.title}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                                                {event.location && ` - ${event.location}`}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="shrink-0 text-xs uppercase">
                                            {event.event_type}
                                        </Badge>
                                    </div>
                                ))}

                                {/* Upcoming Masses */}
                                {upcomingMasses.map((mass) => (
                                    <div key={mass.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                                        <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                                            <Clock className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Messe du {DAYS[parseInt(mass.day_of_week)]}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {mass.time_of_day}
                                                {mass.location && ` - ${mass.location}`}
                                            </p>
                                        </div>
                                        <Badge variant="outline" className="shrink-0 text-xs uppercase">
                                            Régulier
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Announcements as Activity */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg font-semibold">Annonces Récentes</CardTitle>
                            <Link href="/admin/announcements">
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                                    Voir tout
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentAnnouncements.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">
                                Aucune annonce récente
                            </p>
                        ) : (
                            <div className="space-y-4">
                                {recentAnnouncements.map((announcement) => (
                                    <div key={announcement.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                                        <div className={`p-2 rounded-lg ${announcement.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                                                announcement.is_active ? 'bg-green-100 dark:bg-green-900/20' :
                                                    'bg-gray-100 dark:bg-gray-800'
                                            }`}>
                                            <MessageSquare className={`h-5 w-5 ${announcement.priority === 'high' ? 'text-red-600' :
                                                    announcement.is_active ? 'text-green-600' :
                                                        'text-gray-600'
                                                }`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                {announcement.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {announcement.created_at && format(new Date(announcement.created_at), 'dd MMMM yyyy', { locale: fr })}
                                            </p>
                                        </div>
                                        <div className="shrink-0 flex flex-col items-end gap-1">
                                            {announcement.priority === 'high' && (
                                                <Badge variant="destructive" className="text-xs uppercase">
                                                    Urgent
                                                </Badge>
                                            )}
                                            {announcement.is_active && (
                                                <Badge className="bg-green-500 hover:bg-green-600 text-xs uppercase">
                                                    Active
                                                </Badge>
                                            )}
                                            {!announcement.is_active && (
                                                <Badge variant="secondary" className="text-xs uppercase">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
