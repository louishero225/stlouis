'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form states
    const [name, setName] = useState('')
    const [primaryColor, setPrimaryColor] = useState('#000000')
    const [secondaryColor, setSecondaryColor] = useState('#ffffff')
    const [logoUrl, setLogoUrl] = useState('')

    // New fields
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [website, setWebsite] = useState('')
    const [description, setDescription] = useState('')
    const [history, setHistory] = useState('')
    const [foundingDate, setFoundingDate] = useState('')

    useEffect(() => {
        if (parish) {
            setName(parish.name || '')
            setPrimaryColor(parish.primary_color || '#000000')
            setSecondaryColor(parish.secondary_color || '#ffffff')
            setLogoUrl(parish.logo_url || '')
            setPhone(parish.contact_phone || '')
            setEmail(parish.contact_email || '')
            setWebsite(parish.website || '')
            setDescription(parish.description || '')
            setHistory(parish.history || '')
            setFoundingDate(parish.founding_date || '')
        }
    }, [parish])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return

        setLoading(true)
        setSuccess(false)

        try {
            const { error } = await supabase
                .from('parishes')
                .update({
                    name,
                    primary_color: primaryColor,
                    secondary_color: secondaryColor,
                    logo_url: logoUrl,
                    contact_phone: phone,
                    contact_email: email,
                    website,
                    description,
                    history,
                    founding_date: foundingDate || null
                })
                .eq('id', parish.id)

            if (error) throw error

            setSuccess(true)
            router.refresh()

            // Force reload to apply new colors immediately
            window.location.reload()

        } catch (error: any) {
            console.error('Error updating parish:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Réglages Paroisse</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Identité & Présentation</CardTitle>
                    <CardDescription>Informations générales et apparences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSave} className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="name">Nom de la paroisse</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="primary">Couleur Principale</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="secondary">Couleur Secondaire</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-12 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="font-mono uppercase"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Logo de la Paroisse</Label>
                            <ImageUpload
                                value={logoUrl}
                                onChange={setLogoUrl}
                                folder="parishes" // Using 'media' for consistent assets
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+509 ..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email de contact</Label>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="contact@..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">Site Web / Réseaux Sociaux</Label>
                            <Input
                                id="website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-lg font-semibold mb-4">Histoire & Présentation</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="founding_date">Date de fondation</Label>
                                    <Input
                                        id="founding_date"
                                        type="date"
                                        value={foundingDate}
                                        onChange={(e) => setFoundingDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="history">Historique & Faits marquants</Label>
                                    <Textarea
                                        id="history"
                                        value={history}
                                        onChange={(e) => setHistory(e.target.value)}
                                        placeholder="Racontez l'histoire de la paroisse..."
                                        className="min-h-[150px]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90" disabled={loading}>
                                {loading ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
                            </Button>
                        </div>

                        {success && (
                            <p className="text-green-600 font-medium animate-pulse">
                                Modifications enregistrées ! Rechargement...
                            </p>
                        )}

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
