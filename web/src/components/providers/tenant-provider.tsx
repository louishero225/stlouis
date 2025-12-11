'use client'

import { createClient } from '@/utils/supabase/client'
import { createContext, useContext, useEffect, useState } from 'react'
import { Database } from '@/types/database.types'

type Parish = Database['public']['Tables']['parishes']['Row']

interface TenantContextType {
    parish: Parish | null
    loading: boolean
}

const TenantContext = createContext<TenantContextType>({
    parish: null,
    loading: true,
})

export function TenantProvider({ children }: { children: React.ReactNode }) {
    const [parish, setParish] = useState<Parish | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        let mounted = true

        async function fetchParishData(userId: string) {
            try {
                // Fetch profile to get parish_id
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('parish_id')
                    .eq('id', userId)
                    .single()

                if (profile?.parish_id) {
                    // Fetch parish details
                    const { data: parishData } = await supabase
                        .from('parishes')
                        .select('*')
                        .eq('id', profile.parish_id)
                        .single()

                    if (mounted && parishData) {
                        setParish(parishData)
                        const root = document.documentElement
                        if (parishData.primary_color) root.style.setProperty('--primary', parishData.primary_color)
                        if (parishData.secondary_color) root.style.setProperty('--secondary', parishData.secondary_color)
                    }
                }
            } catch (error) {
                console.error('TenantProvider: Unexpected error', error)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                fetchParishData(session.user.id)
            } else {
                if (mounted) {
                    setParish(null)
                    setLoading(false)
                }
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [])

    return (
        <TenantContext.Provider value={{ parish, loading }}>
            {children}
        </TenantContext.Provider>
    )
}

export const useTenantContext = () => useContext(TenantContext)
