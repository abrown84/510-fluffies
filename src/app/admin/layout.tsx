import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Dog, Baby, FileText, Mail, Settings, LayoutDashboard, LogOut, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from './logout-button'

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/dogs', label: 'Dogs', icon: Dog },
  { href: '/admin/litters', label: 'Litters', icon: Baby },
  { href: '/admin/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/admin/applications', label: 'Applications', icon: FileText },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-neutral-200 bg-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-neutral-200 px-6">
            <Link href="/admin" className="text-xl font-bold">
              510<span className="text-amber-600">.</span>Fluffies
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-600">
                {user.email?.[0].toUpperCase()}
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-neutral-900">
                  {user.email}
                </p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 flex-1 bg-neutral-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
