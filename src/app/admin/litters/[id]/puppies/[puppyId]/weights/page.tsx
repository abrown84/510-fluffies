import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus, TrendingUp, Scale } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { WeightForm } from './weight-form'
import { DeleteWeightButton } from './delete-weight-button'
import type { Puppy, PuppyWeight, Litter } from '@/types/database'

interface WeightsPageProps {
  params: Promise<{ id: string; puppyId: string }>
}

async function getPuppy(puppyId: string): Promise<Puppy | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('puppies')
    .select('*')
    .eq('id', puppyId)
    .single()
  return data as Puppy | null
}

async function getLitter(litterId: string): Promise<Litter | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('litters')
    .select('*')
    .eq('id', litterId)
    .single()
  return data as Litter | null
}

async function getWeights(puppyId: string): Promise<PuppyWeight[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('puppy_weights')
    .select('*')
    .eq('puppy_id', puppyId)
    .order('recorded_at', { ascending: false })
  return (data as PuppyWeight[]) || []
}

function calculateGrowth(weights: PuppyWeight[]): {
  dailyAvg: number
  weeklyGain: number
  trend: 'up' | 'down' | 'stable'
} {
  if (weights.length < 2) {
    return { dailyAvg: 0, weeklyGain: 0, trend: 'stable' }
  }

  const sorted = [...weights].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  )

  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  const days = Math.max(1, (new Date(last.recorded_at).getTime() - new Date(first.recorded_at).getTime()) / (1000 * 60 * 60 * 24))
  const totalGain = last.weight_oz - first.weight_oz
  const dailyAvg = totalGain / days
  const weeklyGain = dailyAvg * 7

  // Determine trend from last 3 weights
  const recent = sorted.slice(-3)
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (recent.length >= 2) {
    const recentGain = recent[recent.length - 1].weight_oz - recent[0].weight_oz
    if (recentGain > 0.5) trend = 'up'
    else if (recentGain < -0.5) trend = 'down'
  }

  return { dailyAvg, weeklyGain, trend }
}

export default async function WeightsPage({ params }: WeightsPageProps) {
  const { id, puppyId } = await params
  const [puppy, litter, weights] = await Promise.all([
    getPuppy(puppyId),
    getLitter(id),
    getWeights(puppyId),
  ])

  if (!puppy || !litter) {
    notFound()
  }

  const growth = calculateGrowth(weights)
  const latestWeight = weights[0]?.weight_oz || puppy.current_weight_oz || 0

  return (
    <div>
      <Link
        href={`/admin/litters/${id}/puppies`}
        className="mb-4 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to {litter.name} Puppies
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Weight Tracking: {puppy.name || `${puppy.collar_color || 'No'} Collar`}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={puppy.gender === 'male' ? 'info' : 'default'}>
              {puppy.gender === 'male' ? '♂ Male' : '♀ Female'}
            </Badge>
            {puppy.color && (
              <span className="text-neutral-600">{puppy.color}</span>
            )}
          </div>
        </div>
        <Link href={`/admin/litters/${id}/puppies/${puppyId}`}>
          <Badge variant="default" className="cursor-pointer">
            Edit Puppy
          </Badge>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Current Weight</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {(latestWeight / 16).toFixed(2)} lbs
                </p>
                <p className="text-sm text-neutral-500">{latestWeight} oz</p>
              </div>
              <Scale className="h-8 w-8 text-neutral-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Weekly Gain</p>
                <p className="text-2xl font-bold text-green-600">
                  +{growth.weeklyGain.toFixed(1)} oz
                </p>
                <p className="text-sm text-neutral-500">
                  {growth.dailyAvg.toFixed(2)} oz/day avg
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${
                growth.trend === 'up' ? 'text-green-500' :
                growth.trend === 'down' ? 'text-red-500' :
                'text-neutral-400'
              }`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Records</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {weights.length}
                </p>
                <p className="text-sm text-neutral-500">weight entries</p>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                growth.trend === 'up' ? 'bg-green-100 text-green-600' :
                growth.trend === 'down' ? 'bg-red-100 text-red-600' :
                'bg-neutral-100 text-neutral-600'
              }`}>
                {growth.trend === 'up' ? '↑' : growth.trend === 'down' ? '↓' : '→'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Weight Form */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="mr-2 h-5 w-5" />
            Record Weight
          </CardTitle>
        </CardHeader>
        <CardContent>
          <WeightForm puppyId={puppyId} litterId={id} />
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weights.length > 0 ? (
            <div className="space-y-3">
              {weights.map((weight, index) => {
                const prevWeight = weights[index + 1]?.weight_oz
                const change = prevWeight ? weight.weight_oz - prevWeight : null

                return (
                  <div
                    key={weight.id}
                    className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {weight.weight_oz} oz
                          <span className="ml-2 text-sm font-normal text-neutral-500">
                            ({(weight.weight_oz / 16).toFixed(2)} lbs)
                          </span>
                        </p>
                        <p className="text-sm text-neutral-500">
                          {formatDate(weight.recorded_at)}
                        </p>
                      </div>
                      {change !== null && (
                        <Badge
                          variant={change > 0 ? 'success' : change < 0 ? 'danger' : 'default'}
                        >
                          {change > 0 ? '+' : ''}{change.toFixed(1)} oz
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {weight.notes && (
                        <span className="text-sm text-neutral-500">{weight.notes}</span>
                      )}
                      <DeleteWeightButton weightId={weight.id} puppyId={puppyId} litterId={id} />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-neutral-500">
              No weight records yet. Add the first one above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
