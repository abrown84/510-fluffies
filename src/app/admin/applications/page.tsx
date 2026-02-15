import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { ApplicationStatusSelect } from './status-select'
import type { Application } from '@/types/database'

async function getApplications(): Promise<Application[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })
  return (data as Application[]) || []
}

const statusVariants = {
  pending: 'warning',
  reviewing: 'info',
  approved: 'success',
  declined: 'danger',
  waitlisted: 'purple',
} as const

export default async function AdminApplicationsPage() {
  const applications = await getApplications()

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Applications</h1>
      <p className="mt-1 text-neutral-600">
        Review and manage puppy applications
      </p>

      {applications.length > 0 ? (
        <div className="mt-8 space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{app.name}</CardTitle>
                    <p className="text-sm text-neutral-500">
                      {app.email} • {app.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[app.status]}>
                      {app.status}
                    </Badge>
                    <ApplicationStatusSelect
                      applicationId={app.id}
                      currentStatus={app.status}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Location
                    </p>
                    <p className="text-sm text-neutral-900">
                      {app.city}, {app.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Experience
                    </p>
                    <p className="text-sm text-neutral-900">
                      {app.experience_level?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Budget
                    </p>
                    <p className="text-sm text-neutral-900">{app.budget_range}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Applied
                    </p>
                    <p className="text-sm text-neutral-900">
                      {formatDate(app.created_at)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Living Situation
                    </p>
                    <p className="text-sm text-neutral-700">
                      {app.living_situation} • {app.has_yard ? 'Has yard' : 'No yard'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Preferences
                    </p>
                    <p className="text-sm text-neutral-700">
                      {app.preferred_sex} • {app.preferred_color || 'No color preference'}
                    </p>
                  </div>
                </div>

                {app.household_description && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Household
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {app.household_description}
                    </p>
                  </div>
                )}

                {app.goals && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Goals
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">{app.goals}</p>
                  </div>
                )}

                {app.additional_notes && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase text-neutral-500">
                      Additional Notes
                    </p>
                    <p className="mt-1 text-sm text-neutral-700">
                      {app.additional_notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No applications yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
