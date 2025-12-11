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
import { ChevronLeft, Upload, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Profile = {
    id: string
    full_name: string | null
    email: string
}

export default function EditGroupPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
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
    const [uploading, setUploading] = useState(false)

    // Admins
    const [admin1, setAdmin1] = useState<string>('')
    const [admin2, setAdmin2] = useState<string>('')

    useEffect(() => {
        if (!parish || !id) return

        async function init() {
            setLoading(true)
            await Promise.all([fetchProfiles(), fetchGroup()])
            setLoading(false)
        }

        async function fetchProfiles() {
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, email')
                .eq('parish_id', parish!.id)
                .order('full_name')

            if (data) setProfiles(data)
        }

        async function fetchGroup() {
            const { data, error } = await supabase
                .from('groups')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching group:', error)
                return
            }
            if (data) {
                setName(data.name)
                setDescription(data.description || '')
                setGroupType(data.group_type)
                setMeetingDay(data.meeting_day || '')
                setMeetingTime(data.meeting_time || '')
                setMeetingDay2(data.meeting_day_2 || '')
                setMeetingTime2(data.meeting_time_2 || '')
                setMeetingLocation(data.meeting_location || '')
                setImageUrl(data.image_url || '')
                setAdmin1(data.admin1_id || '')
                setAdmin2(data.admin2_id || '')
            }
        }

        init()
    }, [parish, id])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('groups')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage
                .from('groups')
                .getPublicUrl(filePath)

            setImageUrl(data.publicUrl)
        } catch (error: any) {
            alert(error.message)
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setSaving(true)

        try {
            const { error } = await supabase
                .from('groups')
                .update({
                    name,
                    description,
                    group_type: groupType,
                    meeting_day: meetingDay,
                    meeting_time: meetingTime || null,
                    meeting_day_2: meetingDay2 || null,
                    meeting_time_2: meetingTime2 || null,
                    meeting_location: meetingLocation,
                    image_url: imageUrl || null,
                    admin1_id: admin1 || null,
                    admin2_id: admin2 || null,
                })
                .eq('id', id)

            if (error) throw error

            router.push('/admin/groups')
            router.refresh()
        } catch (error: any) {
            console.error('Error updating group:', error)
            alert(`Erreur lors de la mise à jour: ${error.message || 'Erreur inconnue'}`)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce groupe ? Cette action est irréversible.')) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('groups')
                .delete()
                .eq('id', id)

            if (error) throw error
            router.push('/admin/groups')
            router.refresh()
        } catch (error: any) {
            alert(`Erreur : ${error.message}`)
            setSaving(false)
        }
    }

    if (tenantLoading || loading) return <div>Chargement...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/groups">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le Groupe</h1>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                </Button>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails du groupe</CardTitle>
                        <CardDescription>Mouvement, Association, Comité ou Groupe Ethnique.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="image">Logo / Photo</Label>
                            <div className="flex items-center gap-4">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                        <Upload className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {uploading ? 'Téléchargement en cours...' : 'PNG, JPG jusqu\'à 5MB'}
                                    </p>
                                </div>
                            </div>
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
                        <Button type="submit" disabled={saving || uploading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
