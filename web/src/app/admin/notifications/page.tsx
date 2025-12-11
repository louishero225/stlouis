'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Bell, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

type Notification = {
    id: string
    title: string
    body: string
    type: string
    link_url: string | null
    priority: string | null // Derived from data or separate?
    action_url: string | null
    data: any
    created_at: string
    is_read: boolean
}

export default function NotificationsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchNotifications = async () => {
        if (!parish) return

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('parish_id', parish.id)
                .order('created_at', { ascending: false })

            if (data) {
                setNotifications(data as any[])
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (parish) {
            fetchNotifications()
        }
    }, [parish])

    const handleDelete = async (id: string) => {
        if (!confirm('Supprimer cette notification ?')) return
        try {
            await supabase.from('notifications').delete().eq('id', id)
            fetchNotifications()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                    <p className="text-gray-500">Envoyez des alertes et informations aux fidèles.</p>
                </div>
                <Link href="/admin/notifications/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouvelle Notification
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <p>Chargement des notifications...</p>
                ) : notifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-gray-500">
                            Aucune notification envoyée pour le moment.
                        </CardContent>
                    </Card>
                ) : (
                    notifications.map((notif) => {
                        const priority = notif.data?.priority || 'normal'
                        return (
                            <Card key={notif.id} className="overflow-hidden">
                                <div className="p-6 flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${notif.type === 'alert' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{notif.title}</h3>
                                                <Badge variant="outline">{notif.type}</Badge>
                                                {priority === 'high' && <Badge variant="destructive">Urgent</Badge>}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300">{notif.body}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                                <span>
                                                    Envoyé le {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {notif.action_url && (
                                                    <a href={notif.action_url} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-[var(--primary)]">
                                                        <ExternalLink className="w-3 h-3 mr-1" />
                                                        Lien attaché
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(notif.id)} className="text-gray-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
