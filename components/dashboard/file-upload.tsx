'use client'

import * as React from 'react'
import { useRef, useState, useCallback } from 'react'
import {
  UploadCloud,
  File,
  Music,
  Film,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { uploadMediaFile, type UploadResult } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UploadedFile = {
  file: File
  result?: UploadResult
  error?: string
  status: 'idle' | 'uploading' | 'done' | 'error'
  /** Simulated progress 0–100 */
  progress: number
}

export interface FileUploadProps {
  /** Folder prefix inside the storage bucket, e.g. a release ID */
  folder?: string
  /** Called after every individual file finishes (success or fail) */
  onUpload?: (result: UploadResult, file: File) => void
  /** Called after all queued files have been processed */
  onAllDone?: (results: UploadResult[]) => void
  /** Accept only audio, only video, or both (default: both) */
  accept?: 'audio' | 'video' | 'both'
  /** Max file size in bytes (default 500 MB) */
  maxSize?: number
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUDIO_EXTS = ['.mp3', '.wav', '.flac']
const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.avi']

const AUDIO_MIME = 'audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/mp3'
const VIDEO_MIME = 'video/mp4,video/quicktime,video/webm,video/x-msvideo'

const MAX_SIZE_DEFAULT = 500 * 1024 * 1024 // 500 MB

function getAcceptString(accept: FileUploadProps['accept']) {
  if (accept === 'audio') return AUDIO_MIME
  if (accept === 'video') return VIDEO_MIME
  return `${AUDIO_MIME},${VIDEO_MIME}`
}

function getAcceptedExts(accept: FileUploadProps['accept']) {
  if (accept === 'audio') return AUDIO_EXTS
  if (accept === 'video') return VIDEO_EXTS
  return [...AUDIO_EXTS, ...VIDEO_EXTS]
}

function isAudioFile(file: File) {
  return (
    file.type.startsWith('audio/') ||
    AUDIO_EXTS.some((e) => file.name.toLowerCase().endsWith(e))
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ---------------------------------------------------------------------------
// File row
// ---------------------------------------------------------------------------

function FileRow({ item, onRemove }: { item: UploadedFile; onRemove: () => void }) {
  const audio = isAudioFile(item.file)
  const Icon = audio ? Music : Film

  return (
    <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.file.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>

        {item.status === 'uploading' && (
          <Progress value={item.progress} className="mt-2 h-1" />
        )}

        {item.status === 'done' && item.result && (
          <p className="mt-1 flex items-center gap-1 text-xs text-primary">
            <CheckCircle2 className="size-3" />
            Uploaded to {item.result.bucket}
          </p>
        )}

        {item.status === 'error' && (
          <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3" />
            {item.error}
          </p>
        )}
      </div>

      {item.status !== 'uploading' && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove file"
          className="mt-0.5 shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}

      {item.status === 'uploading' && (
        <Loader2 className="mt-1 size-4 shrink-0 animate-spin text-muted-foreground" />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function FileUpload({
  folder,
  onUpload,
  onAllDone,
  accept = 'both',
  maxSize = MAX_SIZE_DEFAULT,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const isUploading = items.some((i) => i.status === 'uploading')

  // ---- helpers ----

  function updateItem(index: number, patch: Partial<UploadedFile>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)))
  }

  function validateFile(file: File): string | null {
    const exts = getAcceptedExts(accept)
    const name = file.name.toLowerCase()
    if (!exts.some((e) => name.endsWith(e))) {
      return `Invalid format. Accepted: ${exts.join(', ')}`
    }
    if (file.size > maxSize) {
      return `File too large (max ${formatBytes(maxSize)})`
    }
    return null
  }

  async function uploadOne(file: File, index: number) {
    updateItem(index, { status: 'uploading', progress: 10 })

    // Simulate incremental progress while real upload runs
    const ticker = setInterval(() => {
      setItems((prev) =>
        prev.map((it, i) =>
          i === index && it.status === 'uploading' && it.progress < 85
            ? { ...it, progress: it.progress + 8 }
            : it,
        ),
      )
    }, 400)

    try {
      const result = await uploadMediaFile(file, { folder })
      clearInterval(ticker)
      updateItem(index, { status: 'done', progress: 100, result })
      onUpload?.(result, file)
      return result
    } catch (err) {
      clearInterval(ticker)
      const msg = err instanceof Error ? err.message : 'Upload failed'
      updateItem(index, { status: 'error', error: msg })
      return null
    }
  }

  const addFiles = useCallback(
    async (rawFiles: FileList | File[]) => {
      const files = Array.from(rawFiles)
      const startIndex = items.length

      const newItems: UploadedFile[] = files.map((file) => {
        const validationError = validateFile(file)
        return {
          file,
          status: validationError ? 'error' : 'idle',
          error: validationError ?? undefined,
          progress: 0,
        }
      })

      setItems((prev) => [...prev, ...newItems])

      // Upload valid files sequentially to avoid hammering the API
      const results: UploadResult[] = []
      for (let i = 0; i < newItems.length; i++) {
        if (newItems[i].status === 'error') continue
        const result = await uploadOne(files[i], startIndex + i)
        if (result) results.push(result)
      }

      onAllDone?.(results)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items.length, folder, accept, maxSize],
  )

  // ---- drag & drop ----

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }
  function handleDragLeave() {
    setDragging(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }

  // ---- render ----

  const acceptedLabel =
    accept === 'audio'
      ? 'MP3, WAV, FLAC'
      : accept === 'video'
        ? 'MP4, MOV, WebM, AVI'
        : 'MP3, WAV, FLAC, MP4, MOV, WebM'

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload audio or video files"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50',
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </span>
        <div className="text-center">
          <p className="text-sm font-medium">
            Drag &amp; drop files, or{' '}
            <span className="text-primary underline-offset-2 hover:underline">browse</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Accepted formats: {acceptedLabel} &middot; Max {formatBytes(maxSize)}
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={getAcceptString(accept)}
          multiple
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <FileRow
              key={`${item.file.name}-${i}`}
              item={item}
              onRemove={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
            />
          ))}
        </div>
      )}

      {/* Upload all idle files button (shown when user dropped files without auto-upload) */}
      {items.some((it) => it.status === 'idle') && !isUploading && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isUploading}
          onClick={() => {
            items.forEach((it, i) => {
              if (it.status === 'idle') uploadOne(it.file, i)
            })
          }}
        >
          <File className="size-4" />
          Upload {items.filter((it) => it.status === 'idle').length} file
          {items.filter((it) => it.status === 'idle').length !== 1 ? 's' : ''}
        </Button>
      )}
    </div>
  )
}
