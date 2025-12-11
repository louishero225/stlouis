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
import { Switch } from '@/components/ui/switch'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateAnnouncementPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [priority, setPriority] = useState('normal')
    const [isActive, setIsActive] = useState(true)
    const [imageUrl, setImageUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('announcements')
                .insert({
                    title,
                    content,
                    priority,
                    is_active: isActive,
                    parish_id: parish.id,
                    category: 'general', // Default category
                    published_at: new Date().toISOString(),
                    image_url: imageUrl || null
                })

            if (error) throw error

            router.push('/admin/announcements')
            router.refresh()
        } catch (error) {
            console.error('Error creating announcement:', error)
            alert('Erreur lors de la création de l\'annonce.')
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/announcements">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Annonce</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails de l'annonce</CardTitle>
                        <CardDescription>Informez vos paroissiens des dernières nouvelles.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="title">Titre</Label>
                            <Input
                                id="title"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ex: Messe de Noël"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Contenu</Label>
                            <Textarea
                                id="content"
                                required
                                className="min-h-[150px]"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Détails de l'annonce..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="priority">Priorité</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">Important</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col justify-end space-y-2 pb-2">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                    />
                                    <Label htmlFor="active">Annonce active</Label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Image (Optionnelle)</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="announcements"
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/announcements">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Création...' : 'Publier l\'annonce'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
