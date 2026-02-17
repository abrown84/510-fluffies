'use client'

import { useState, useMemo, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Dog, Baby, Search, Trash2, ExternalLink, Loader2, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { UnifiedImage } from './page'

interface Entity {
  id: string
  name: string
  type: 'dog' | 'litter' | 'puppy'
}

interface GalleryClientProps {
  images: UnifiedImage[]
  stats: {
    dogs: number
    litters: number
    puppies: number
    total: number
  }
  entities: Entity[]
}

const MAX_FILE_SIZE = 50 * 1024 * 1024
const TARGET_FILE_SIZE = 2 * 1024 * 1024
const MAX_DIMENSION = 2048

async function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      let { width, height } = img

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = (height / width) * MAX_DIMENSION
          width = MAX_DIMENSION
        } else {
          width = (width / height) * MAX_DIMENSION
          height = MAX_DIMENSION
        }
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.92
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to optimize image'))
              return
            }

            if (blob.size > TARGET_FILE_SIZE && quality > 0.5) {
              quality -= 0.05
              tryCompress()
            } else {
              const optimizedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(optimizedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }

      tryCompress()
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

const bucketMap = {
  dog: 'dogs',
  litter: 'litters',
  puppy: 'puppies',
} as const

const idColumnMap = {
  dog: 'dog_id',
  litter: 'litter_id',
  puppy: 'puppy_id',
} as const

const entityTypeColors = {
  dog: 'bg-blue-100 text-blue-800',
  litter: 'bg-purple-100 text-purple-800',
  puppy: 'bg-green-100 text-green-800',
}

const tableMap = {
  dog: 'dog_images',
  litter: 'litter_images',
  puppy: 'puppy_images',
} as const

export function GalleryClient({ images, stats, entities }: GalleryClientProps) {
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState<'all' | 'dog' | 'litter' | 'puppy'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Upload state
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Group entities by type
  const groupedEntities = useMemo(() => {
    const groups: Record<'dog' | 'litter' | 'puppy', Entity[]> = {
      dog: [],
      litter: [],
      puppy: [],
    }
    entities.forEach((entity) => {
      groups[entity.type].push(entity)
    })
    return groups
  }, [entities])

  // Filter images
  const filteredImages = useMemo(() => {
    return images.filter((img) => {
      if (typeFilter !== 'all' && img.entity_type !== typeFilter) return false
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          img.entity_name.toLowerCase().includes(query) ||
          (img.alt_text && img.alt_text.toLowerCase().includes(query))
        )
      }
      return true
    })
  }, [images, typeFilter, searchQuery])

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    processFiles(files)
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    processFiles(files)
  }

  const processFiles = async (files: File[]) => {
    if (!selectedEntity) {
      setUploadError('Please select a dog, litter, or puppy to upload to')
      return
    }

    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setUploadError('Please select image files')
      return
    }

    const entity = entities.find(e => `${e.type}-${e.id}` === selectedEntity)
    if (!entity) {
      setUploadError('Selected entity not found')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    const supabase = createClient()
    const bucket = bucketMap[entity.type]
    const tableName = tableMap[entity.type]
    const idColumn = idColumnMap[entity.type]
    let completed = 0

    try {
      // Get current max order for this entity
      const { data: existingImages } = await supabase
        .from(tableName)
        .select('display_order')
        .eq(idColumn, entity.id)
        .order('display_order', { ascending: false })
        .limit(1)

      // @ts-ignore - dynamic table name
      let maxOrder = existingImages?.[0]?.display_order ?? -1

      for (const file of imageFiles) {
        if (file.size > MAX_FILE_SIZE) {
          continue
        }

        const optimizedFile = await optimizeImage(file)
        const filename = `${Date.now()}-${optimizedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filename, optimizedFile)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename)

        await supabase
          .from(tableName)
          .insert({
            [idColumn]: entity.id,
            image_url: urlData.publicUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ''),
            display_order: maxOrder + 1 + completed,
          } as never)

        completed++
        setUploadProgress(Math.round((completed / imageFiles.length) * 100))
      }

      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setUploadError('Failed to upload some images')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (image: UnifiedImage) => {
    if (!confirm(`Delete this image from ${image.entity_name}?`)) return

    setDeletingId(image.id)
    try {
      const supabase = createClient()
      const tableName = tableMap[image.entity_type]
      await supabase.from(tableName).delete().eq('id', image.id)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  const updateAltText = async (image: UnifiedImage, altText: string) => {
    const supabase = createClient()
    const tableName = tableMap[image.entity_type]
    await supabase
      .from(tableName)
      .update({ alt_text: altText } as never)
      .eq('id', image.id)
  }

  const getEntityLink = (image: UnifiedImage) => {
    switch (image.entity_type) {
      case 'dog':
        return `/admin/dogs/${image.entity_id}/gallery`
      case 'litter':
        return `/admin/litters/${image.entity_id}/gallery`
      case 'puppy':
        // Puppies don't have a direct gallery page, link to litter
        return `/admin/litters`
      default:
        return '/admin/gallery'
    }
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            {/* Entity Selector */}
            <div className="flex-1">
              <label htmlFor="entity-select" className="mb-1.5 block text-sm font-medium text-neutral-700">
                Upload to:
              </label>
              <select
                id="entity-select"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="">Select a dog, litter, or puppy...</option>
                {groupedEntities.dog.length > 0 && (
                  <optgroup label="Dogs">
                    {groupedEntities.dog.map((e) => (
                      <option key={`dog-${e.id}`} value={`dog-${e.id}`}>
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groupedEntities.litter.length > 0 && (
                  <optgroup label="Litters">
                    {groupedEntities.litter.map((e) => (
                      <option key={`litter-${e.id}`} value={`litter-${e.id}`}>
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {groupedEntities.puppy.length > 0 && (
                  <optgroup label="Puppies">
                    {groupedEntities.puppy.map((e) => (
                      <option key={`puppy-${e.id}`} value={`puppy-${e.id}`}>
                        {e.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Drop Zone */}
            <div className="flex-1">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
                disabled={isUploading}
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                disabled={isUploading || !selectedEntity}
                className={cn(
                  'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                  isDragging
                    ? 'border-amber-400 bg-amber-50'
                    : isUploading
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-50'
                    : !selectedEntity
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 opacity-60'
                    : 'border-neutral-300 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50'
                )}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-amber-600" />
                    <span className="mt-1 text-sm text-neutral-600">
                      Uploading... {uploadProgress}%
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-neutral-400" />
                    <span className="mt-1 text-sm font-medium text-neutral-700">
                      {selectedEntity ? 'Drag photos here or click to upload' : 'Select an entity first'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {uploadError && (
            <p className="mt-2 text-sm text-red-600">{uploadError}</p>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Dog className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.dogs}</p>
                <p className="text-xs text-neutral-500">Dog Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <Baby className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.litters}</p>
                <p className="text-xs text-neutral-500">Litter Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <span className="text-lg">🐶</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.puppies}</p>
                <p className="text-xs text-neutral-500">Puppy Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <span className="text-lg">📷</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
                <p className="text-xs text-neutral-500">Total Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Type Filter */}
            <div className="flex-1">
              <label className="sr-only">Filter by type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Types</option>
                <option value="dog">Dogs Only</option>
                <option value="litter">Litters Only</option>
                <option value="puppy">Puppies Only</option>
              </select>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name or alt text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-4 text-sm placeholder:text-neutral-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-neutral-600">
        Showing {filteredImages.length} of {images.length} photos
      </p>

      {/* Gallery Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              {/* Image */}
              <div className="relative aspect-square bg-neutral-100">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                />

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <Link
                    href={getEntityLink(image)}
                    className="rounded-full bg-white p-2 text-neutral-700 shadow-lg transition-colors hover:bg-amber-50 hover:text-amber-600"
                    title="Go to entity gallery"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    disabled={deletingId === image.id}
                    className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600 disabled:opacity-50"
                    title="Delete image"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Type Badge */}
                <div className="absolute left-2 top-2">
                  <Badge
                    className={cn(
                      'text-xs capitalize',
                      entityTypeColors[image.entity_type]
                    )}
                  >
                    {image.entity_type}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="border-t border-neutral-100 p-2">
                <p className="truncate text-xs font-medium text-neutral-900">
                  {image.entity_name}
                </p>
                <input
                  type="text"
                  defaultValue={image.alt_text || ''}
                  placeholder="Alt text..."
                  onBlur={(e) => updateAltText(image, e.target.value)}
                  className="mt-1 w-full border-0 bg-transparent p-0 text-xs text-neutral-500 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-neutral-500">No photos found</p>
            {(typeFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setTypeFilter('all')
                  setSearchQuery('')
                }}
                className="mt-2 text-sm text-amber-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
