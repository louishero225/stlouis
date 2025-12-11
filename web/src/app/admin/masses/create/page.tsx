'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useTenant } from '@/hooks/use-tenant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

const DAYS = [
    { value: '0', label: 'Dimanche' },
    { value: '1', label: 'Lundi' },
    { value: '2', label: 'Mardi' },
    { value: '3', label: 'Mercredi' },
    { value: '4', label: 'Jeudi' },
    { value: '5', label: 'Vendredi' },
    { value: '6', label: 'Samedi' },
]

export default function CreateMassPage() {
    const { parish, loading: tenantLoading } = useTenant()
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const [day, setDay] = useState('0')
    const [time, setTime] = useState('')
    const [location, setLocation] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!parish) return
        setLoading(true)

        try {
            const { error } = await supabase
                .from('masses')
                .insert({
                    day_of_week: day,
                    time_of_day: time,
                    location,
                    description,
                    parish_id: parish.id,
                    is_exceptional: false
                })

            if (error) throw error

            router.push('/admin/masses')
            router.refresh()
        } catch (error: any) {
            console.error('Error creating mass:', error)
            alert(`Erreur: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    if (tenantLoading) return <div>Chargement...</div>

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/masses">
                    <Button variant="ghost" size="icon">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nouvelle Messe</h1>
            </div>

            <Card>
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>Détails de la célébration</CardTitle>
                        <CardDescription>Configurez l'horaire pour une journée spécifique.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <Label htmlFor="day">Jour de la semaine</Label>
                            <Select value={day} onValueChange={setDay}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le jour" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DAYS.map(d => (
                                        <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="time">Heure</Label>
                            <Input
                                id="time"
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Lieu (Optionnel)</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="ex: Église principale, Chapelle..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Note / Description (Optionnel)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="ex: Messe des jeunes, Adoration incluse..."
                            />
                        </div>

                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Link href="/admin/masses">
                            <Button variant="outline" type="button">Annuler</Button>
                        </Link>
                        <Button type="submit" disabled={loading} className="bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90">
                            {loading ? 'Création...' : 'Ajouter la messe'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
