'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Plus, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { Database } from '@/types/database.types'

type Announcement = Database['public']['Tables']['announcements']['Row']

export default function AnnouncementsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [announcements, setAnnouncements] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchAnnouncements() {
            if (!parish) return

            try {
                const { data, error } = await supabase
                    .from('announcements')
                    .select('*')
                    .eq('parish_id', parish.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setAnnouncements(data || [])
            } catch (error) {
                console.error('Error fetching announcements:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchAnnouncements()
        }
    }, [parish])

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Annonces Paroissiales</h1>
                    <p className="text-gray-500">Gérez les communications pour vos paroissiens.</p>
                </div>
                <Link href="/admin/announcements/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Annonce
                    </Button>
                </Link>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : announcements.length === 0 ? (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Aucune annonce pour le moment</CardTitle>
                        <CardDescription>Commencez par créer votre première annonce pour informer vos fidèles.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" className="mt-4">
                            Créer une annonce
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {announcements.map((item) => (
                        <Card key={item.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${item.priority === 'high' ? 'bg-red-100 text-red-800' :
                                        item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                        {item.priority === 'high' ? 'Important' : item.priority === 'urgent' ? 'Urgent' : 'Normal'}
                                    </div>
                                    {item.is_active ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                                <CardTitle className="line-clamp-2 mt-2">{item.title}</CardTitle>
                                <CardDescription className="flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(item.created_at || '').toLocaleDateString('fr-FR')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                                    {item.content}
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
