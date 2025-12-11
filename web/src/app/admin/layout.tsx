import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Settings, LogOut, Users, FileText, Megaphone, Calendar, Clock } from 'lucide-react'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch parish info for the sidebar header if needed, 
    // but TenantProvider handles the context globally for now.

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    {/* Logo or Parish Name will be injected here via CSS variables ideally, or we can use the context in a client component */}
                    <h1 className="text-xl font-bold text-[var(--primary)]">Paroisse Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <Link href="/admin" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <LayoutDashboard className="w-5 h-5 mr-3" />
                        Tableau de bord
                    </Link>
                    <Link href="/admin/settings" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Settings className="w-5 h-5 mr-3" />
                        Réglages Paroisse
                    </Link>

                    <div className="pt-4 pb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Communication
                    </div>
                    <Link href="/admin/announcements" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Megaphone className="w-5 h-5 mr-3" />
                        Annonces
                    </Link>
                    <Link href="/admin/mass-requests" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <FileText className="w-5 h-5 mr-3" />
                        Demandes de Messes
                    </Link>
                    <Link href="/admin/events" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Calendar className="w-5 h-5 mr-3" />
                        Évènements
                    </Link>
                    <Link href="/admin/calendar" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Clock className="w-5 h-5 mr-3" />
                        Calendrier
                    </Link>
                    <Link href="/admin/masses" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Clock className="w-5 h-5 mr-3" />
                        Horaires de Messes
                    </Link>
                    <Link href="/admin/groups" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Groupes
                    </Link>
                    <Link href="/admin/team" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Users className="w-5 h-5 mr-3" />
                        Équipe Pastorale
                    </Link>
                    <Link href="/admin/notifications" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <Megaphone className="w-5 h-5 mr-3" />
                        Notifications
                    </Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-500 hover:text-gray-700 cursor-not-allowed">
                        <FileText className="w-5 h-5 mr-3" />
                        Contenus
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                            <LogOut className="w-5 h-5 mr-3" />
                            Déconnexion
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
