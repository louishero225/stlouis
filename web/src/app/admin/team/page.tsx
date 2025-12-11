'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Plus, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type PastoralMember = {
    id: string
    full_name: string
    role: string
    image_url: string | null
    bio: string | null
    rank_order: number
}

export default function PastoralTeamPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [members, setMembers] = useState<PastoralMember[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchMembers() {
            if (!parish) return

            try {
                const { data, error } = await supabase
                    .from('pastoral_members')
                    .select('*')
                    .eq('parish_id', parish.id)
                    .order('rank_order')

                if (error) throw error
                setMembers(data as any[] || [])
            } catch (error) {
                console.error('Error fetching pastoral team:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchMembers()
        }
    }, [parish])

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Équipe Pastorale</h1>
                    <p className="text-gray-500">Gérez les membres du clergé et les responsables de la paroisse.</p>
                </div>
                <Link href="/admin/team/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter un membre
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 text-gray-400">
                        Chargement...
                    </div>
                ) : members.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-12 bg-gray-50 rounded-lg border border-dashed text-gray-500">
                        <p className="mb-4">Aucun membre dans l'équipe pastorale.</p>
                        <Link href="/admin/team/create">
                            <Button variant="outline">Ajouter le Curé</Button>
                        </Link>
                    </div>
                ) : (
                    members.map(member => (
                        <Card key={member.id} className="overflow-hidden">
                            <div className="h-24 bg-[var(--primary)]/10"></div>
                            <CardContent className="-mt-12 flex flex-col items-center pb-6">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-sm mb-4">
                                    <AvatarImage src={member.image_url || ''} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-bold text-gray-400 bg-gray-100">
                                        {member.full_name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <h3 className="text-xl font-bold text-gray-900">{member.full_name}</h3>
                                <Badge variant="secondary" className="mt-1 mb-3">{member.role}</Badge>

                                {member.bio && (
                                    <p className="text-sm text-gray-500 text-center line-clamp-3 mb-4 px-2">
                                        {member.bio}
                                    </p>
                                )}

                                <div className="flex gap-2">
                                    <Link href={`/admin/team/${member.id}`}>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Edit className="w-4 h-4" />
                                            Modifier
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
