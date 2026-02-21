'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CaretDown, CaretRight, GenderMale, GenderFemale, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Dog, DogWithLineage, Litter, Puppy } from '@/types/database'

interface FamilyListViewProps {
  dogs: Dog[]
  dogsWithLineage: DogWithLineage[]
  litters: (Litter & { sire: Dog | null; dam: Dog | null; puppies: Puppy[] })[]
}

interface DogListItemProps {
  dog: Dog
  depth?: number
  sire?: Dog | null
  dam?: Dog | null
  showParents?: boolean
  isExternal?: boolean
}

function DogListItem({ dog, depth = 0, sire, dam, showParents = true, isExternal }: DogListItemProps) {
  const [expanded, setExpanded] = useState(depth === 0)
  const hasParents = sire || dam
  const paddingLeft = depth * 16

  return (
    <div className="border-b border-neutral-100 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full flex items-center gap-3 p-3 hover:bg-neutral-50 transition-colors text-left',
          isExternal && 'bg-neutral-50'
        )}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Expand/collapse indicator */}
        {hasParents && showParents ? (
          expanded ? (
            <CaretDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
          ) : (
            <CaretRight className="h-4 w-4 text-neutral-400 flex-shrink-0" />
          )
        ) : (
          <div className="w-4 flex-shrink-0" />
        )}

        {/* Dog photo */}
        <div
          className={cn(
            'relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-1',
            dog.gender === 'male' ? 'ring-blue-400' : 'ring-pink-400',
            isExternal && 'ring-dashed ring-neutral-400'
          )}
        >
          {dog.image_url ? (
            <Image
              src={dog.image_url}
              alt={dog.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-neutral-100">
              <span className="text-lg">🐕</span>
            </div>
          )}
        </div>

        {/* Dog info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900 truncate">{dog.name}</span>
            {dog.gender === 'male' ? (
              <GenderMale weight="bold" className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <GenderFemale weight="bold" className="h-4 w-4 text-pink-500 flex-shrink-0" />
            )}
            {isExternal && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-600">
                {dog.owner_name || 'External'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span>{dog.color}</span>
            {dog.status && dog.status !== 'breeding' && (
              <>
                <span>•</span>
                <span className="capitalize">{dog.status}</span>
              </>
            )}
          </div>
        </div>

        {/* View link */}
        <Link
          href={`/dogs/${dog.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-amber-600 hover:text-amber-700 font-medium flex-shrink-0"
        >
          View
        </Link>
      </button>

      {/* Parents (collapsed section) */}
      {expanded && hasParents && showParents && (
        <div className="bg-neutral-50/50">
          {sire && (
            <div className="flex items-center gap-2 py-2 text-xs text-neutral-500" style={{ paddingLeft: `${paddingLeft + 48}px` }}>
              <span className="text-blue-500 font-medium">Sire:</span>
              <Link href={`/dogs/${sire.slug}`} className="text-neutral-700 hover:text-amber-600">
                {sire.name}
              </Link>
              {sire.ownership_type && sire.ownership_type !== 'owned' && (
                <span className="text-neutral-400">({sire.owner_name || 'External'})</span>
              )}
            </div>
          )}
          {dam && (
            <div className="flex items-center gap-2 py-2 text-xs text-neutral-500" style={{ paddingLeft: `${paddingLeft + 48}px` }}>
              <span className="text-pink-500 font-medium">Dam:</span>
              <Link href={`/dogs/${dam.slug}`} className="text-neutral-700 hover:text-amber-600">
                {dam.name}
              </Link>
              {dam.ownership_type && dam.ownership_type !== 'owned' && (
                <span className="text-neutral-400">({dam.owner_name || 'External'})</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function FamilyListView({ dogs, dogsWithLineage, litters }: FamilyListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGender, setFilterGender] = useState<'all' | 'male' | 'female'>('all')
  const [showExternal, setShowExternal] = useState(true)

  // Create a map for quick lineage lookup
  const lineageMap = useMemo(() => {
    const map = new Map<string, DogWithLineage>()
    dogsWithLineage.forEach(dog => map.set(dog.id, dog))
    return map
  }, [dogsWithLineage])

  // Filter and organize dogs
  const { ownedDogs, externalDogs } = useMemo(() => {
    let filtered = dogsWithLineage

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(dog =>
        dog.name.toLowerCase().includes(query) ||
        dog.color.toLowerCase().includes(query)
      )
    }

    // Gender filter
    if (filterGender !== 'all') {
      filtered = filtered.filter(dog => dog.gender === filterGender)
    }

    // Separate owned vs external
    const owned = filtered.filter(d => !d.ownership_type || d.ownership_type === 'owned' || d.ownership_type === 'co_owned')
    const external = filtered.filter(d => d.ownership_type === 'external' || d.ownership_type === 'stud_service')

    // Sort by name
    owned.sort((a, b) => a.name.localeCompare(b.name))
    external.sort((a, b) => a.name.localeCompare(b.name))

    return { ownedDogs: owned, externalDogs: external }
  }, [dogsWithLineage, searchQuery, filterGender])

  // Group owned dogs by gender
  const males = ownedDogs.filter(d => d.gender === 'male')
  const females = ownedDogs.filter(d => d.gender === 'female')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      {/* Search and Filters */}
      <div className="p-3 border-b border-neutral-200 bg-neutral-50">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search dogs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => setFilterGender('all')}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors',
              filterGender === 'all'
                ? 'bg-amber-500 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterGender('male')}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
              filterGender === 'male'
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            )}
          >
            <GenderMale weight="bold" className="h-3 w-3" />
            Males
          </button>
          <button
            onClick={() => setFilterGender('female')}
            className={cn(
              'px-3 py-1 text-xs rounded-full transition-colors flex items-center gap-1',
              filterGender === 'female'
                ? 'bg-pink-500 text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            )}
          >
            <GenderFemale weight="bold" className="h-3 w-3" />
            Females
          </button>
          {externalDogs.length > 0 && (
            <button
              onClick={() => setShowExternal(!showExternal)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition-colors ml-auto',
                showExternal
                  ? 'bg-neutral-200 text-neutral-700'
                  : 'bg-white border border-neutral-200 text-neutral-400'
              )}
            >
              External ({externalDogs.length})
            </button>
          )}
        </div>
      </div>

      {/* Dog Lists */}
      <div className="divide-y divide-neutral-200">
        {/* Males Section */}
        {males.length > 0 && (filterGender === 'all' || filterGender === 'male') && (
          <div>
            <div className="px-3 py-2 bg-blue-50 flex items-center gap-2">
              <GenderMale weight="bold" className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-semibold text-blue-700">Studs ({males.length})</span>
            </div>
            {males.map(dog => (
              <DogListItem
                key={dog.id}
                dog={dog}
                sire={dog.sire}
                dam={dog.dam}
              />
            ))}
          </div>
        )}

        {/* Females Section */}
        {females.length > 0 && (filterGender === 'all' || filterGender === 'female') && (
          <div>
            <div className="px-3 py-2 bg-pink-50 flex items-center gap-2">
              <GenderFemale weight="bold" className="h-4 w-4 text-pink-500" />
              <span className="text-sm font-semibold text-pink-700">Dams ({females.length})</span>
            </div>
            {females.map(dog => (
              <DogListItem
                key={dog.id}
                dog={dog}
                sire={dog.sire}
                dam={dog.dam}
              />
            ))}
          </div>
        )}

        {/* External Dogs Section */}
        {showExternal && externalDogs.length > 0 && (
          <div>
            <div className="px-3 py-2 bg-neutral-100 flex items-center gap-2">
              <span className="text-sm font-semibold text-neutral-600">External Dogs ({externalDogs.length})</span>
            </div>
            {externalDogs.map(dog => (
              <DogListItem
                key={dog.id}
                dog={dog}
                sire={dog.sire}
                dam={dog.dam}
                isExternal
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {ownedDogs.length === 0 && externalDogs.length === 0 && (
          <div className="p-8 text-center text-neutral-500">
            <p>No dogs found matching your search.</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-3 py-2 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
        <span>{ownedDogs.length} dogs shown</span>
        <span>Tap to expand • View for details</span>
      </div>
    </div>
  )
}
