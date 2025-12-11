'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Clock, MapPin, Globe, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define type manually since database.types.ts might be out of sync
// Define type manually since database.types.ts might be out of sync
type Mass = {
    id: string
    day_of_week: string
    time_of_day: string
    description: string | null
    location: string | null
    parish_id: string | null
    is_exceptional: boolean
}

const DAYS = [
    { value: '0', label: 'Dimanche' },
    { value: '1', label: 'Lundi' },
    { value: '2', label: 'Mardi' },
    { value: '3', label: 'Mercredi' },
    { value: '4', label: 'Jeudi' },
    { value: '5', label: 'Vendredi' },
    { value: '6', label: 'Samedi' },
]

export default function MassesPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [masses, setMasses] = useState<Mass[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchMasses() {
            if (!parish) return

            try {
                const { data, error } = await supabase
                    .from('masses')
                    .select('*')
                    .eq('parish_id', parish.id)
                    .order('time_of_day')

                if (error) throw error
                setMasses(data as any[] || [])
            } catch (error) {
                console.error('Error fetching masses:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchMasses()
        }
    }, [parish])

    const getMassesForDay = (day: string) => {
        return masses.filter(m => m.day_of_week === day)
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Horaires des Messes</h1>
                    <p className="text-gray-500">Gérez les célébrations de la semaine.</p>
                </div>
                <Link href="/admin/masses/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Messe
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DAYS.map((day) => {
                    const dayMasses = getMassesForDay(day.value)
                    return (
                        <Card key={day.value} className="h-full">
                            <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
                                <CardTitle className="text-lg font-semibold flex justify-between items-center">
                                    {day.label}
                                    <Badge variant="secondary" className="font-normal text-xs">
                                        {dayMasses.length} célébrations
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-4">
                                {loading ? (
                                    <div className="space-y-2 animate-pulse">
                                        <div className="h-10 bg-gray-100 rounded" />
                                        <div className="h-10 bg-gray-100 rounded" />
                                    </div>
                                ) : dayMasses.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic text-center py-4">Aucune messe ce jour-là.</p>
                                ) : (
                                    dayMasses.map(mass => (
                                        <div key={mass.id} className="group flex items-start justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hovered:bg-gray-100 transition-colors">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[var(--primary)] text-lg">
                                                        {mass.time_of_day.slice(0, 5)}
                                                    </span>
                                                </div>
                                                {mass.description && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                                        {mass.description}
                                                    </p>
                                                )}
                                                {mass.location && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                                        <MapPin className="w-3 h-3" />
                                                        {mass.location}
                                                    </div>
                                                )}
                                            </div>
                                            <Link href={`/admin/masses/${mass.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
