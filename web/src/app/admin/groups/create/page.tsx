'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import Link from 'next/link'

type Profile = {
    id: string
    full_name: string | null
    email: string
}

export default function CreateGroupPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const [profiles, setProfiles] = useState<Profile[]>([])
    const router = useRouter()
    const supabase = createClient()

    // Form
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [groupType, setGroupType] = useState('movement')

    // Meeting Day 1
    const [meetingDay, setMeetingDay] = useState('')
    const [meetingTime, setMeetingTime] = useState('')

    // Meeting Day 2
    const [meetingDay2, setMeetingDay2] = useState('')
    const [meetingTime2, setMeetingTime2] = useState('')

    const [meetingLocation, setMeetingLocation] = useState('')
    const [imageUrl, setImageUrl] = useState('')

    // Admins
    const [admin1, setAdmin1] = useState<string>('')
    const [admin2, setAdmin2] = useState<string>('')

    useEffect(() => {
        if (!parish) return
        async function fetchProfiles() {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('parish_id', parish!.id)
                .order('full_name') // Assuming full_name exists, otherwise email

            if (data) setProfiles(data)
        }
        fetchProfiles()
    }, [parish])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('groups')
                .insert({
                    name,
                    description,
                    group_type: groupType,
                    meeting_day: meetingDay,
                    meeting_time: meetingTime || null,
                    meeting_day_2: meetingDay2 || null,
                    meeting_time_2: meetingTime2 || null,
                    meeting_location: meetingLocation,
                    image_url: imageUrl || null,
                    is_active: true,
                    members_count: 0,
                    parish_id: parish.id,
                    admin1_id: admin1 || null,
                    admin2_id: admin2 || null,
                })

            if (error) throw error

            router.push('/admin/groups')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating group:', error)
            alert(`Erreur lors de la création: ${error.message || 'Erreur inconnue'}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/groups">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouveau Groupe</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails du groupe</CardTitle>
                        <CardDescription>Mouvement, Association, Comité ou Groupe Ethnique.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label>Logo / Photo</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="groups" // Keep using 'groups' bucket if that was the intent, or switch to 'media'
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Nom</Label>
                            <Input
                                id="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ex: Chorale Sainte Cécile, Scouts..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type de groupe</Label>
                            <Select value={groupType} onValueChange={setGroupType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="movement">Mouvement</SelectItem>
                                    <SelectItem value="association">Association</SelectItem>
                                    <SelectItem value="committee">Comité</SelectItem>
                                    <SelectItem value="ethnic_group">Groupe Ethnique</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Meeting 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="day">Jour de réunion 1 (Principal)</Label>
                                <Select value={meetingDay} onValueChange={setMeetingDay}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un jour" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lundi">Lundi</SelectItem>
                                        <SelectItem value="Mardi">Mardi</SelectItem>
                                        <SelectItem value="Mercredi">Mercredi</SelectItem>
                                        <SelectItem value="Jeudi">Jeudi</SelectItem>
                                        <SelectItem value="Vendredi">Vendredi</SelectItem>
                                        <SelectItem value="Samedi">Samedi</SelectItem>
                                        <SelectItem value="Dimanche">Dimanche</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time">Heure de réunion 1</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={meetingTime}
                                    onChange={(e) => setMeetingTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Meeting 2 (Optional) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
                            <div className="space-y-2">
                                <Label htmlFor="day2">Jour de réunion 2 (Optionnel)</Label>
                                <Select value={meetingDay2} onValueChange={setMeetingDay2}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un jour" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lundi">Lundi</SelectItem>
                                        <SelectItem value="Mardi">Mardi</SelectItem>
                                        <SelectItem value="Mercredi">Mercredi</SelectItem>
                                        <SelectItem value="Jeudi">Jeudi</SelectItem>
                                        <SelectItem value="Vendredi">Vendredi</SelectItem>
                                        <SelectItem value="Samedi">Samedi</SelectItem>
                                        <SelectItem value="Dimanche">Dimanche</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time2">Heure de réunion 2</Label>
                                <Input
                                    id="time2"
                                    type="time"
                                    value={meetingTime2}
                                    onChange={(e) => setMeetingTime2(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Lieu de réunion</Label>
                            <Input
                                id="location"
                                value={meetingLocation}
                                onChange={(e) => setMeetingLocation(e.target.value)}
                                placeholder="Ex: Salle 2, Sous-sol de l'église..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Activités, Buts...)</Label>
                            <Textarea
                                id="description"
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Description du groupe..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-4">
                            <div className="space-y-2">
                                <Label>Administrateur 1</Label>
                                <Select value={admin1} onValueChange={setAdmin1}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Administrateur 2</Label>
                                <Select value={admin2} onValueChange={setAdmin2}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un responsable" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profiles.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/groups">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Création...' : 'Créer le groupe'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
