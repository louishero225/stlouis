'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { ImageUpload } from '@/components/ui/image-upload'
import Link from 'next/link'

export default function CreateTeamMemberPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('')
    const [bio, setBio] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [rankOrder, setRankOrder] = useState('0')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('pastoral_members')
                .insert({
                    full_name: fullName,
                    role,
                    bio,
                    image_url: imageUrl || null,
                    rank_order: parseInt(rankOrder) || 0,
                    parish_id: parish.id
                })

            if (error) throw error

            router.push('/admin/team')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating member:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/team">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajouter un membre</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Profil du membre</CardTitle>
                        <CardDescription>Curé, Vicaire, Diacre, Laïc engagé...</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label>Photo de profil</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="team"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullname">Nom Complet</Label>
                            <Input
                                id="fullname"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="ex: Père Jean Dupont"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rôle / Fonction</Label>
                            <Input
                                id="role"
                                required
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder="ex: Curé de la paroisse"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Biographie courte</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Quelques mots sur son parcours..."
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rank">Ordre d'affichage (Priorité)</Label>
                            <Input
                                id="rank"
                                type="number"
                                value={rankOrder}
                                onChange={(e) => setRankOrder(e.target.value)}
                                placeholder="0 = premier, 1 = deuxième..."
                            />
                            <p className="text-xs text-gray-500">Utilisez 1 pour le Curé, 2 pour les Vicaires, etc.</p>
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/team">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Création...' : 'Ajouter au trombinoscope'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
