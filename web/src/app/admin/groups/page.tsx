'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Users, MapPin, Clock, Calendar, Edit, User } from 'lucide-react'
import Link from 'next/link'

// Define type manually since database.types.ts might be out of sync
type Group = {
    id: string
    name: string
    description: string | null
    group_type: string
    image_url: string | null
    leader_id: string | null
    meeting_day: string | null
    meeting_time: string | null
    meeting_location: string | null
    members_count: number
    is_active: boolean
    tags: string[] | null
    parish_id: string | null
}

const SECTION_LABELS: Record<string, string> = {
    'all': 'Tout',
    'movement': 'Mouvements',
    'association': 'Associations',
    'committee': 'Comités',
    'ethnic_group': 'Groupes Ethniques',
    'other': 'Autres'
}

const GROUP_TYPES = ['movement', 'association', 'committee', 'ethnic_group', 'other']

export default function GroupsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function fetchGroups() {
            if (!parish) return

            try {
                const { data, error } = await supabase
                    .from('groups')
                    .select('*')
                    .eq('parish_id', parish.id)
                    .order('name', { ascending: true })

                if (error) throw error
                setGroups(data as any[] || [])
            } catch (error) {
                console.error('Error fetching groups:', error)
            } finally {
                setLoading(false)
            }
        }

        if (parish) {
            fetchGroups()
        }
    }, [parish])

    const getFilteredGroups = (type: string) => {
        if (type === 'all') return groups
        return groups.filter(g => g.group_type === type)
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groupes & Mouvements</h1>
                    <p className="text-gray-500">Gérez les différentes entités de la paroisse.</p>
                </div>
                <Link href="/admin/groups/create">
                    <Button className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nouveau Groupe
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4 flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
                    <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] border border-gray-200 bg-white"
                    >
                        Tout
                    </TabsTrigger>
                    {GROUP_TYPES.map(type => (
                        <TabsTrigger
                            key={type}
                            value={type}
                            className="data-[state=active]:bg-[var(--primary)] data-[state=active]:text-[var(--primary-foreground)] border border-gray-200 bg-white"
                        >
                            {SECTION_LABELS[type]}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {['all', ...GROUP_TYPES].map(type => (
                    <TabsContent key={type} value={type} className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-24 w-full bg-gray-100 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : getFilteredGroups(type).length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                                <p className="text-gray-500 mb-4">Aucun groupe dans cette catégorie.</p>
                                <Link href="/admin/groups/create">
                                    <Button variant="outline">Ajouter un groupe</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                                {getFilteredGroups(type).map((group) => (
                                    <div key={group.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">

                                        {/* Avatar */}
                                        <Avatar className="h-16 w-16 rounded-lg">
                                            <AvatarImage src={group.image_url || ''} className="object-cover" />
                                            <AvatarFallback className="rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                                                {group.name.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                                                    {group.name}
                                                </h3>
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {SECTION_LABELS[group.group_type]}
                                                </Badge>
                                                {!group.is_active && (
                                                    <Badge variant="destructive" className="text-xs">Inactif</Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                {(group.meeting_day || group.meeting_time) && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {group.meeting_day} {group.meeting_time}
                                                    </span>
                                                )}
                                                {group.meeting_location && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {group.meeting_location}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stats & Actions */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                                <div className="flex items-center justify-center gap-1 text-[var(--primary)] font-bold text-xl">
                                                    <Users className="w-4 h-4" />
                                                    {group.members_count || 0}
                                                </div>
                                                <p className="text-xs text-gray-500">Membres</p>
                                            </div>

                                            <Link href={`/admin/groups/${group.id}`}>
                                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-[var(--primary)]">
                                                    <Edit className="w-5 h-5" />
                                                </Button>
                                            </Link>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}
