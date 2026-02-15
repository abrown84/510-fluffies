import Link from 'next/link'
import { Dog, Baby, FileText, Mail, ArrowRight, Clock, AlertTriangle, CalendarClock, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import type { Application, Litter, ContactMessage } from '@/types/database'

interface Stats {
  totalDogs: number
  totalLitters: number
  pendingApplications: number
  unreadMessages: number
  availablePuppies: number
  depositsReceived: number
}

interface UpcomingLitter extends Litter {
  sire: { name: string } | null
  dam: { name: string } | null
}

async function getStats(): Promise<Stats> {
  const supabase = await createClient()

  const [dogs, litters, applications, messages, puppies, deposits] = await Promise.all([
    supabase.from('dogs').select('id', { count: 'exact' }),
    supabase.from('litters').select('id', { count: 'exact' }),
    supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
    supabase.from('puppies').select('id', { count: 'exact' }).eq('status', 'available'),
    supabase.from('puppies').select('id', { count: 'exact' }).eq('status', 'deposit'),
  ])

  return {
    totalDogs: dogs.count || 0,
    totalLitters: litters.count || 0,
    pendingApplications: applications.count || 0,
    unreadMessages: messages.count || 0,
    availablePuppies: puppies.count || 0,
    depositsReceived: deposits.count || 0,
  }
}

async function getRecentApplications(): Promise<Application[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data as Application[]) || []
}

async function getOverdueApplications(): Promise<Application[]> {
  const supabase = await createClient()
  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const { data } = await supabase
    .from('applications')
    .select('*')
    .eq('status', 'pending')
    .lt('created_at', threeDaysAgo.toISOString())
    .order('created_at', { ascending: true })
    .limit(5)
  return (data as Application[]) || []
}

async function getUpcomingLitters(): Promise<UpcomingLitter[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const twoMonthsFromNow = new Date()
  twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)

  const { data } = await supabase
    .from('litters')
    .select(`
      *,
      sire:dogs!litters_sire_id_fkey(name),
      dam:dogs!litters_dam_id_fkey(name)
    `)
    .eq('status', 'expected')
    .gte('expected_date', today)
    .lte('expected_date', twoMonthsFromNow.toISOString().split('T')[0])
    .order('expected_date', { ascending: true })
    .limit(3)
  return (data as UpcomingLitter[]) || []
}

async function getOldestUnreadMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('is_read', false)
    .order('created_at', { ascending: true })
    .limit(3)
  return (data as ContactMessage[]) || []
}

function getDaysAgo(dateString: string): number {
  const date = new Date(dateString)
  const now = new Date()
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

export default async function AdminDashboard() {
  const [stats, recentApplications, overdueApplications, upcomingLitters, oldestMessages] = await Promise.all([
    getStats(),
    getRecentApplications(),
    getOverdueApplications(),
    getUpcomingLitters(),
    getOldestUnreadMessages(),
  ])

  const statCards = [
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: FileText,
      href: '/admin/applications',
      color: 'bg-amber-500',
      urgent: stats.pendingApplications > 0,
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: Mail,
      href: '/admin/messages',
      color: 'bg-purple-500',
      urgent: stats.unreadMessages > 0,
    },
    {
      title: 'Available Puppies',
      value: stats.availablePuppies,
      icon: Dog,
      href: '/admin/litters',
      color: 'bg-green-500',
    },
    {
      title: 'Deposits Paid',
      value: stats.depositsReceived,
      icon: DollarSign,
      href: '/admin/litters',
      color: 'bg-blue-500',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
      <p className="mt-1 text-neutral-600">
        Welcome to your 510 Fluffies admin dashboard
      </p>

      {/* Urgent Actions Alert */}
      {(overdueApplications.length > 0 || oldestMessages.length > 0) && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Needs Attention</span>
          </div>
          <div className="mt-2 space-y-1 text-sm text-amber-700">
            {overdueApplications.length > 0 && (
              <p>• {overdueApplications.length} application(s) waiting 3+ days for response</p>
            )}
            {oldestMessages.some(m => getDaysAgo(m.created_at) >= 2) && (
              <p>• Unread messages older than 2 days</p>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className={`transition-shadow hover:shadow-md ${stat.urgent ? 'ring-2 ring-amber-400' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">
                      {stat.title}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-neutral-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
                  >
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Overdue Applications */}
        {overdueApplications.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center text-amber-800">
                <Clock className="mr-2 h-5 w-5" />
                Awaiting Response (3+ days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg bg-white p-3"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{app.name}</p>
                      <p className="text-sm text-neutral-500">
                        {app.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="danger">
                        {getDaysAgo(app.created_at)} days ago
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/admin/applications"
                className="mt-4 flex items-center justify-center text-sm text-amber-700 hover:text-amber-800"
              >
                Review all applications
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Litters */}
        {upcomingLitters.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <CalendarClock className="mr-2 h-5 w-5" />
                Upcoming Due Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingLitters.map((litter) => {
                  const daysUntil = litter.expected_date
                    ? Math.ceil((new Date(litter.expected_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                    : null

                  return (
                    <Link
                      key={litter.id}
                      href={`/admin/litters/${litter.id}/edit`}
                      className="block rounded-lg border border-neutral-100 p-3 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-900">{litter.name}</p>
                          <p className="text-sm text-neutral-500">
                            {litter.sire?.name || 'TBD'} × {litter.dam?.name || 'TBD'}
                          </p>
                        </div>
                        <div className="text-right">
                          {daysUntil !== null && (
                            <Badge variant={daysUntil <= 7 ? 'warning' : daysUntil <= 14 ? 'info' : 'default'}>
                              {daysUntil <= 0 ? 'Due now!' : `${daysUntil} days`}
                            </Badge>
                          )}
                          {litter.expected_date && (
                            <p className="mt-1 text-xs text-neutral-500">
                              {formatDate(litter.expected_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Applications */}
        <Card className={overdueApplications.length > 0 && upcomingLitters.length > 0 ? 'lg:col-span-2' : ''}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link
              href="/admin/applications"
              className="flex items-center text-sm text-amber-600 hover:text-amber-700"
            >
              View all
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {recentApplications.length > 0 ? (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{app.name}</p>
                      <p className="text-sm text-neutral-500">
                        {app.city}, {app.state} • {formatDate(app.created_at)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === 'pending'
                          ? 'warning'
                          : app.status === 'approved'
                          ? 'success'
                          : app.status === 'declined'
                          ? 'danger'
                          : 'default'
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-neutral-500">
                No applications yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link href="/admin/dogs">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Dog className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Dogs</p>
                  <p className="text-xl font-bold text-neutral-900">{stats.totalDogs}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/litters">
          <Card className="transition-shadow hover:shadow-md">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Baby className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Total Litters</p>
                  <p className="text-xl font-bold text-neutral-900">{stats.totalLitters}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-neutral-400" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
