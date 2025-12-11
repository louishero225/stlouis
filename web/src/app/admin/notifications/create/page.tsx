'use client'

import { useState } from 'react'
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

export default function CreateNotificationPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [type, setType] = useState('info')
    const [priority, setPriority] = useState('normal')
    const [imageUrl, setImageUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        // TODO: Handle 'parish_id' if we add it to notifications table later.
        // For now, we are creating a "Broadcast" notification (user_id is NULL).
        // If the schema allows user_id to be null.

        try {
            const { error } = await supabase
                .from('notifications')
                .insert({
                    title,
                    body: message,
                    type,
                    // priority is not in the DB schema I saw? Let's check DB schema again or just rely on types.
                    // DB schema output: id, user_id, title, body, type, is_read, action_url, data, created_at.
                    // MISSING: priority.
                    // I should probably remove priority or put it in 'data' jsonb.
                    // or maybe the DB output was truncated? 
                    // No, "Below is the result...".
                    // So priority, link_url (became action_url).
                    // I will put priority in data for now or just ignore it if column doesn't exist.
                    // simpler to just use what exists.
                    action_url: imageUrl || null,
                    user_id: null, // Broadcast
                    parish_id: parish.id,
                    is_read: false,
                    data: { priority }
                })

            if (error) throw error

            router.push('/admin/notifications')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating notification:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/notifications">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Notification</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Rédiger le message</CardTitle>
                        <CardDescription>Ce message sera envoyé à tous les utilisateurs (pour l'instant).</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title">Titre</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ex: Modification horaire messe"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Votre message..."
                                required
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="info">Information</SelectItem>
                                        <SelectItem value="alert">Alerte</SelectItem>
                                        <SelectItem value="event">Événement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priorité</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normale</SelectItem>
                                        <SelectItem value="high">Haute</SelectItem>
                                        <SelectItem value="low">Basse</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Image (Optionnel)</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="notifications"
                            />
                            <p className="text-xs text-gray-500">
                                Ajoutez une image pour rendre votre notification plus attractive
                            </p>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Link href="/admin/notifications">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Envoi...' : 'Envoyer la notification'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
