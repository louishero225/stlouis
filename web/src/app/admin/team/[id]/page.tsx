'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { useRouter, useParams } from 'next/navigation'
import { ChevronLeft, Trash2, User } from 'lucide-react'
import Link from 'next/link'

export default function EditTeamMemberPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [fullName, setFullName] = useState('')
    const [role, setRole] = useState('')
    const [bio, setBio] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const [rankOrder, setRankOrder] = useState('0')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (!parish || !id) return

        async function fetchMember() {
            const { data, error } = await supabase
                .from('pastoral_members')
                .select('*')
                .eq('id', id)
                .single()

            if (data) {
                setFullName(data.full_name)
                setRole(data.role)
                setBio(data.bio || '')
                setImageUrl(data.image_url || '')
                setRankOrder(data.rank_order?.toString() || '0')
            }
            setLoading(false)
        }
        fetchMember()
    }, [parish, id])

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error('Vous devez sélectionner une image.')
            }

            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `team-${Math.random()}.${fileExt}`
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
                .from('pastoral_members')
                .update({
                    full_name: fullName,
                    role,
                    bio,
                    image_url: imageUrl || null,
                    rank_order: parseInt(rankOrder) || 0,
                })
                .eq('id', id)

            if (error) throw error

            router.push('/admin/team')
            router.refresh()
        } catch (error: any) {
            console.error('Error updating member:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return
        setSaving(true)
        try {
            const { error } = await supabase
                .from('pastoral_members')
                .delete()
                .eq('id', id)

            if (error) throw error
            router.push('/admin/team')
            router.refresh()
        } catch (error: any) {
            alert(`Erreur: ${error.message}`)
            setSaving(false)
        }
    }

    if (tenantLoading || loading) return <div>Chargement...</div>

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/team">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Modifier le membre</h1>
                </div>
                <Button variant="destructive" size="sm" onClick={handleDelete} disabled={saving}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                </Button>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Profil du membre</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="image">Photo de profil</Label>
                            <div className="flex items-center gap-4">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border border-dashed border-gray-300">
                                        <User className="w-8 h-8 text-gray-400" />
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
                                </div>
                            </div>
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
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/team">
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
