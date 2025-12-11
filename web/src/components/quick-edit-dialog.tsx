'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.types'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Clock, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

type Event = Database['public']['Tables']['events']['Row']

interface QuickEditDialogProps {
    event: Event | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
}

export function QuickEditDialog({ event, isOpen, onClose, onUpdate }: QuickEditDialogProps) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [location, setLocation] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    // Update form when event changes
    useEffect(() => {
        if (event) {
            setTitle(event.title)
            setDate(event.date.split('T')[0])
            setEndDate(event.end_date ? event.end_date.split('T')[0] : '')
            setLocation(event.location || '')
            setDescription(event.description || '')
        }
    }, [event])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!event) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('events')
                .update({
                    title,
                    date: new Date(date).toISOString(),
                    end_date: endDate ? new Date(endDate).toISOString() : null,
                    location: location || null,
                    description: description || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', event.id)

            if (error) throw error

            onUpdate()
            onClose()
        } catch (error: any) {
            console.error('Error updating event:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!event) return
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('events')
                .delete()
                .eq('id', event.id)

            if (error) throw error

            onUpdate()
            onClose()
        } catch (error: any) {
            console.error('Error deleting event:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (!event) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Modifier l'événement</span>
                        <Badge variant="outline">{event.event_type}</Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Modification rapide de l'événement. Pour plus d'options, utilisez le formulaire complet.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date de début</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="endDate">Date de fin (optionnel)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Lieu</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Église, salle paroissiale..."
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description de l'événement..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            Créé le {format(new Date(event.created_at || ''), 'PPP', { locale: fr })}
                        </span>
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <div className="flex gap-2 flex-1">
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={loading}
                                className="gap-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                            </Button>
                            <Link href={`/admin/events`} className="flex-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    Formulaire complet
                                </Button>
                            </Link>
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={loading} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90">
                                {loading ? 'Enregistrement...' : 'Enregistrer'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
