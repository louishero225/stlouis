'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateEventPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [startTime, setStartTime] = useState('')
    const [endTime, setEndTime] = useState('')
    const [location, setLocation] = useState('')
    const [category, setCategory] = useState('mass')
    const [imageUrl, setImageUrl] = useState('')
    const [sendNotification, setSendNotification] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        try {
            // 1. Create Event
            const { data: eventData, error } = await supabase
                .from('events')
                .insert({
                    title,
                    description,
                    date: new Date(startTime).toISOString(),
                    end_date: endTime ? new Date(endTime).toISOString() : null,
                    location,
                    event_type: category, // Mapping category to event_type
                    image_url: imageUrl || null,
                    // status: 'scheduled', // Column does not exist in DB
                    parish_id: parish.id,
                })
                .select()
                .single()

            if (error) throw error

            // 2. Send Notification if requested
            if (sendNotification && eventData) {
                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert({
                        title: `Nouvel évènement : ${title}`,
                        body: `Le ${new Date(startTime).toLocaleDateString('fr-FR')} à ${new Date(startTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}. ${location ? `Lieu : ${location}` : ''}`,
                        type: 'event',
                        parish_id: parish.id,
                        action_url: `/events/${eventData.id}`,
                        user_id: null, // Broadcast
                        data: { event_id: eventData.id }
                    })

                if (notifError) {
                    console.error('Error creating notification:', notifError)
                    // We don't block the user if notification fails, but we could alert them
                }
            }

            router.push('/admin/events')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating event:', error)
            alert(`Erreur lors de la création: ${error.message || 'Erreur inconnue'}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/events">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvel Évènement</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails de l'évènement</CardTitle>
                        <CardDescription>Ajoutez une activité au calendrier paroissial.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title">Titre</Label>
                            <Input
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Chorale du dimanche"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Catégorie</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="mass">Messe</SelectItem>
                                    <SelectItem value="confession">Confession</SelectItem>
                                    <SelectItem value="prayer">Prière</SelectItem>
                                    <SelectItem value="meeting">Réunion</SelectItem>
                                    <SelectItem value="social">Vie paroissiale</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="start">Début</Label>
                                <Input
                                    id="start"
                                    type="datetime-local"
                                    required
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end">Fin (Optionnel)</Label>
                                <Input
                                    id="end"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Lieu</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: Église Saint-Louis, Salle paroissiale..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (optionnel)</Label>
                            <Textarea
                                id="description"
                                className="min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Détails supplémentaires..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Image (Optionnelle)</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="events"
                            />
                        </div>

                        <div className="flex items-center space-x-2 pt-4 border-t">
                            <input
                                type="checkbox"
                                id="notification"
                                checked={sendNotification}
                                onChange={(e) => setSendNotification(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <Label htmlFor="notification" className="cursor-pointer">Envoyer une notification aux fidèles</Label>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/events">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Création...' : 'Créer l\'évènement'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
