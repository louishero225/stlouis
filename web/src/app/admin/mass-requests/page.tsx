'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Check, X, Clock } from 'lucide-react'
import { Database } from '@/types/database.types'

type MassIntention = Database['public']['Tables']['mass_intentions']['Row']

export default function MassRequestsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [intentions, setIntentions] = useState<MassIntention[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetchIntentions = async () => {
        if (!parish) return

        try {
            const { data, error } = await supabase
                .from('mass_intentions')
                .select('*')
                .eq('parish_id', parish.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setIntentions(data || [])
        } catch (error) {
            console.error('Error fetching intentions:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (parish) {
            fetchIntentions()
        }
    }, [parish])

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('mass_intentions')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            // Optimistic update
            setIntentions(intentions.map(i => i.id === id ? { ...i, status: newStatus } : i))
        } catch (error) {
            console.error('Error updating status:', error)
            alert('Erreur lors de la mise à jour.')
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Demandes de Messes</h1>
                <p className="text-gray-500">Gérez les intentions de prière demandées par les fidèles.</p>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : intentions.length === 0 ? (
                <Card className="text-center py-12">
                    <CardHeader>
                        <CardTitle>Aucune demande</CardTitle>
                        <CardDescription>Vous n'avez pas encore reçu de demandes d'intentions de messe.</CardDescription>
                    </CardHeader>
                </Card>
            ) : (
                <div className="space-y-4">
                    {intentions.map((item) => (
                        <Card key={item.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 gap-4">
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg">"{item.intention_text}"</span>
                                    {item.status === 'pending' && <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">En attente</Badge>}
                                    {item.status === 'approved' && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approuvée</Badge>}
                                    {item.status === 'rejected' && <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Refusée</Badge>}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        Pour le : {item.requested_date ? new Date(item.requested_date).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Reçu le : {new Date(item.created_at || '').toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </div>

                            {item.status === 'pending' && (
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                                        onClick={() => updateStatus(item.id, 'approved')}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Accepter
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={() => updateStatus(item.id, 'rejected')}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Refuser
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
