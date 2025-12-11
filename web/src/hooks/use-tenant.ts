import { useTenantContext } from '@/components/providers/tenant-provider'

export function useTenant() {
    const context = useTenantContext()
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider')
    }
    return context
}
