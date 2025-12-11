'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, MapPin, Clock } from 'lucide-react'
import { Database } from '@/types/database.types'
import Link from 'next/link'

type Event = Database['public']['Tables']['events']['Row']

export default function EventsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // ... (keeping imports)

    useEffect(() => {
        async function fetchEvents() {
            if (!parish) return

            try {
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('parish_id', parish.id)
                    .order('date', { ascending: true }) // Changed start_time to date

                if (error) throw error
                setEvents(data || [])
            } catch (error) {
                console.error('Error fetching events:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchEvents()
        }
    }, [parish])

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Évènements & Activités</h1>
                    <p className="text-gray-500">Gérez l'agenda de la paroisse.</p>
                </div>
                <Link href="/admin/events/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvel Évènement
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-64 bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : events.length === 0 ? (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Aucun évènement prévu</CardTitle>
                        <CardDescription>Ajoutez des messes, des réunions ou des célébrations à l'agenda.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/events/create">
                            <Button variant="outline" className="mt-4">
                                Ajouter un évènement
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((event) => (
                        <Card key={event.id} className="flex flex-col overflow-hidden">
                            {event.image_url && (
                                <div className="h-32 w-full bg-gray-200 relative">
                                    <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary" className="capitalize">{event.event_type}</Badge>
                                    {/* Status removed as column doesn't exist yet */}
                                </div>
                                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                                <CardDescription className="flex flex-col gap-1 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(event.date).toLocaleDateString('fr-FR')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(event.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {event.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {event.location}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    {event.description}
                                </p>
                            </CardContent>
                            <CardFooter className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <Button variant="ghost" className="w-full text-sm">Modifier</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
