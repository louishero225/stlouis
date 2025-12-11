'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Database } from '@/types/database.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import { QuickEditDialog } from '@/components/quick-edit-dialog'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'

type Event = Database['public']['Tables']['events']['Row']
type Mass = {
    id: string
    day_of_week: string
    time_of_day: string
    description: string | null
    location: string | null
    parish_id: string | null
    is_exceptional: boolean | null
    celebrant: string | null
    lang: string | null
    created_at: string | null
    valid_from: string | null
    valid_until: string | null
}

interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource: {
        type: 'event' | 'mass'
        data: Event | Mass
        location?: string
        description?: string
    }
}

const locales = {
    'fr': fr,
}

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { locale: fr }),
    getDay,
    locales,
})

const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export default function CalendarPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [events, setEvents] = useState<Event[]>([])
    const [masses, setMasses] = useState<Mass[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<View>('month')
    const [date, setDate] = useState(new Date())
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const supabase = createClient()

    const fetchData = useCallback(async () => {
        if (!parish) return

        try {
            setLoading(true)

            // Fetch events
            const { data: eventsData, error: eventsError } = await supabase
                .from('events')
                .select('*')
                .eq('parish_id', parish.id)
                .order('date', { ascending: true })

            if (eventsError) throw eventsError

            // Fetch masses
            const { data: massesData, error: massesError } = await supabase
                .from('masses')
                .select('*')
                .eq('parish_id', parish.id)
                .order('time_of_day')

            if (massesError) throw massesError

            setEvents(eventsData || [])
            setMasses(massesData || [])
        } catch (error) {
            console.error('Error fetching calendar data:', error)
        } finally {
            setLoading(false)
        }
    }, [parish, supabase])

    useEffect(() => {
        if (parish) {
            fetchData()
        }
    }, [parish, fetchData])

    // Convert events and masses to calendar events
    const calendarEvents = useMemo(() => {
        const items: CalendarEvent[] = []

        // Add Events
        events.forEach(event => {
            const startDate = new Date(event.date)
            const endDate = event.end_date ? new Date(event.end_date) : new Date(event.date)

            items.push({
                id: `event-${event.id}`,
                title: event.title,
                start: startDate,
                end: endDate,
                resource: {
                    type: 'event',
                    data: event,
                    location: event.location || undefined,
                    description: event.description || undefined
                }
            })
        })

        // Add Masses (recurring weekly)
        masses.forEach(mass => {
            // Generate mass occurrences for the current month view
            const currentDate = new Date(date)
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

            let currentDay = new Date(startOfMonth)
            while (currentDay <= endOfMonth) {
                if (getDay(currentDay).toString() === mass.day_of_week) {
                    const [hours, minutes] = mass.time_of_day.split(':').map(Number)
                    const massStart = new Date(currentDay)
                    massStart.setHours(hours, minutes, 0)

                    const massEnd = new Date(massStart)
                    massEnd.setHours(hours + 1, minutes, 0) // Assume 1 hour duration

                    items.push({
                        id: `mass-${mass.id}-${format(currentDay, 'yyyy-MM-dd')}`,
                        title: `Messe - ${mass.description || DAYS[parseInt(mass.day_of_week)]}`,
                        start: massStart,
                        end: massEnd,
                        resource: {
                            type: 'mass',
                            data: mass,
                            location: mass.location || undefined,
                            description: mass.description || undefined
                        }
                    })
                }
                currentDay.setDate(currentDay.getDate() + 1)
            }
        })

        return items
    }, [events, masses, date])

    const eventStyleGetter = useCallback((event: CalendarEvent) => {
        const style = {
            backgroundColor: event.resource.type === 'event' ? 'var(--primary)' : '#8b5cf6',
            borderRadius: '5px',
            opacity: 0.8,
            color: 'white',
            border: '0px',
            display: 'block'
        }
        return { style }
    }, [])

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        // Only open dialog for events, not masses
        if (event.resource.type === 'event') {
            setSelectedEvent(event.resource.data as Event)
            setIsDialogOpen(true)
        } else {
            // Show info for masses
            alert(`${event.title}\n${event.resource.location ? `Lieu: ${event.resource.location}\n` : ''}${event.resource.description || ''}`)
        }
    }, [])

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setSelectedEvent(null)
    }

    const handleEventUpdate = () => {
        fetchData() // Refresh the data after update
    }

    if (tenantLoading || loading) return <div className="p-8">Chargement...</div>

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendrier Paroissial</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Vue d'ensemble des événements et messes · Cliquez sur un événement pour le modifier
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Événements</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{events.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messes Régulières</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{masses.filter(m => !m.is_exceptional).length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Messes Exceptionnelles</CardTitle>
                        <Badge variant="outline" className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{masses.filter(m => m.is_exceptional === true).length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ce Mois</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {calendarEvents.filter(e => e.resource.type === 'event').length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--primary)' }}></div>
                            <span className="text-sm">Événements (cliquable)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-purple-600"></div>
                            <span className="text-sm">Messes</span>
                        </div>
                    </div>

                    <div style={{ height: '700px' }}>
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: '100%' }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            culture="fr"
                            messages={{
                                next: "Suivant",
                                previous: "Précédent",
                                today: "Aujourd'hui",
                                month: "Mois",
                                week: "Semaine",
                                day: "Jour",
                                agenda: "Agenda",
                                date: "Date",
                                time: "Heure",
                                event: "Événement",
                                noEventsInRange: "Aucun événement dans cette période",
                                showMore: (total: number) => `+ ${total} événement(s)`
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            <QuickEditDialog
                event={selectedEvent}
                isOpen={isDialogOpen}
                onClose={handleDialogClose}
                onUpdate={handleEventUpdate}
            />
        </div>
    )
}
