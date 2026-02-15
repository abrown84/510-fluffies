'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, GripVertical, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  image_url: string
  alt_text: string | null
  display_order: number
}

interface GalleryManagerProps {
  images: GalleryImage[]
  entityId: string
  entityType: 'dog' | 'litter' | 'puppy'
  bucket: string
  onImagesChange: () => void
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

const tableMap = {
  dog: 'dog_images',
  litter: 'litter_images',
  puppy: 'puppy_images',
} as const

const idColumnMap = {
  dog: 'dog_id',
  litter: 'litter_id',
  puppy: 'puppy_id',
} as const

export function GalleryManager({
  images,
  entityId,
  entityType,
  bucket,
  onImagesChange,
}: GalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const tableName = tableMap[entityType]
  const idColumn = idColumnMap[entityType]

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const imageFiles = files.filter(f => f.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      setError('Please select image files')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    const supabase = createClient()
    let completed = 0

    try {
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

        // Insert into the appropriate table
        const maxOrder = images.length > 0
          ? Math.max(...images.map(img => img.display_order))
          : -1

        await supabase
          .from(tableName)
          .insert({
            [idColumn]: entityId,
            image_url: urlData.publicUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ''),
            display_order: maxOrder + 1 + completed,
          } as never)

        completed++
        setUploadProgress(Math.round((completed / imageFiles.length) * 100))
      }

      onImagesChange()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload some images')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId)

    try {
      const supabase = createClient()
      await supabase.from(tableName).delete().eq('id', imageId)
      onImagesChange()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete image')
    } finally {
      setDeletingId(null)
    }
  }

  const updateAltText = async (imageId: string, altText: string) => {
    const supabase = createClient()
    await supabase
      .from(tableName)
      .update({ alt_text: altText } as never)
      .eq('id', imageId)
  }

  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className={cn(
          'flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isUploading
            ? 'cursor-not-allowed border-neutral-200 bg-neutral-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-amber-400 hover:bg-amber-50'
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            <span className="mt-2 text-sm text-neutral-600">
              Uploading... {uploadProgress}%
            </span>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-neutral-400" />
            <span className="mt-2 text-sm font-medium text-neutral-700">
              Click to upload images
            </span>
            <span className="mt-1 text-xs text-neutral-500">
              Select multiple images at once
            </span>
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Image Grid */}
      {sortedImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sortedImages.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white"
            >
              <div className="relative aspect-square">
                <Image
                  src={image.image_url}
                  alt={image.alt_text || 'Gallery image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleDelete(image.id)}
                  disabled={deletingId === image.id}
                  className="rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors hover:bg-red-600 disabled:opacity-50"
                >
                  {deletingId === image.id ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Order Badge */}
              <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs font-medium text-white">
                {image.display_order + 1}
              </div>

              {/* Alt Text Input */}
              <div className="border-t border-neutral-100 p-2">
                <input
                  type="text"
                  defaultValue={image.alt_text || ''}
                  placeholder="Alt text"
                  onBlur={(e) => updateAltText(image.id, e.target.value)}
                  className="w-full border-0 bg-transparent p-0 text-xs text-neutral-600 placeholder:text-neutral-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {sortedImages.length === 0 && !isUploading && (
        <p className="text-center text-sm text-neutral-500">
          No gallery images yet. Upload some photos to get started.
        </p>
      )}
    </div>
  )
}
