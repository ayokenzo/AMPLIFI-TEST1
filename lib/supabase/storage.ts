/**
 * Supabase Storage service
 *
 * Handles uploading audio (WAV / FLAC / MP3) and video files to a dedicated
 * Supabase Storage bucket and generating their public URLs for use in release
 * metadata.
 *
 * Bucket names:
 *   - "audio"   – for WAV, FLAC and MP3 files
 *   - "videos"  – for video files (MP4, MOV, WebM, etc.)
 *
 * Both buckets should be created in your Supabase project with public access
 * enabled so the returned URLs are directly accessible.
 */

import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AudioMimeType = 'audio/wav' | 'audio/x-wav' | 'audio/flac' | 'audio/mpeg' | 'audio/mp3'
export type VideoMimeType = 'video/mp4' | 'video/quicktime' | 'video/webm' | 'video/x-msvideo'

export type SupportedMimeType = AudioMimeType | VideoMimeType

export interface UploadResult {
  /** Public URL of the uploaded file */
  publicUrl: string
  /** Storage path inside the bucket, e.g. "releases/abc123/track.mp3" */
  path: string
  /** The bucket the file was stored in */
  bucket: 'audio' | 'videos'
}

export interface UploadOptions {
  /**
   * Optional folder prefix inside the bucket, e.g. a release ID.
   * Defaults to a timestamp-based prefix.
   */
  folder?: string
  /**
   * Override the file name stored in the bucket.
   * Defaults to the original file name.
   */
  fileName?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUDIO_MIME_TYPES: SupportedMimeType[] = [
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/mpeg',
  'audio/mp3',
]

const VIDEO_MIME_TYPES: SupportedMimeType[] = [
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-msvideo',
]

const AUDIO_BUCKET = 'audio'
const VIDEO_BUCKET = 'videos'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectBucket(file: File): 'audio' | 'videos' {
  if (AUDIO_MIME_TYPES.includes(file.type as SupportedMimeType)) return AUDIO_BUCKET
  if (VIDEO_MIME_TYPES.includes(file.type as SupportedMimeType)) return VIDEO_BUCKET
  // Fall back to extension-based detection
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (['wav', 'flac', 'mp3'].includes(ext)) return AUDIO_BUCKET
  if (['mp4', 'mov', 'webm', 'avi'].includes(ext)) return VIDEO_BUCKET
  throw new Error(
    `Unsupported file type "${file.type || ext}". ` +
      'Accepted audio formats: WAV, FLAC, MP3. Accepted video formats: MP4, MOV, WebM, AVI.',
  )
}

function buildPath(file: File, options: UploadOptions = {}): string {
  const folder = options.folder ?? `uploads/${Date.now()}`
  const fileName = options.fileName ?? file.name
  // Sanitise: replace spaces and special chars
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `${folder}/${safeName}`
}

// ---------------------------------------------------------------------------
// Core upload function (client-side)
// ---------------------------------------------------------------------------

/**
 * Upload a single audio or video file to the appropriate Supabase Storage
 * bucket and return its public URL plus metadata.
 *
 * Must be called from a browser context (uses the browser Supabase client).
 */
export async function uploadMediaFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const supabase = createClient()
  const bucket = detectBucket(file)
  const path = buildPath(file, options)

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) {
    throw new Error(`Failed to upload file to "${bucket}/${path}": ${error.message}`)
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path)

  return { publicUrl, path, bucket }
}

// ---------------------------------------------------------------------------
// Convenience wrappers
// ---------------------------------------------------------------------------

/**
 * Upload an audio file (WAV, FLAC or MP3).
 * Throws if the file is not a recognised audio type.
 */
export async function uploadAudioFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const bucket = detectBucket(file)
  if (bucket !== AUDIO_BUCKET) {
    throw new Error(
      `Expected an audio file but received "${file.type}". Accepted: WAV, FLAC, MP3.`,
    )
  }
  return uploadMediaFile(file, options)
}

/**
 * Upload a video file (MP4, MOV, WebM, AVI).
 * Throws if the file is not a recognised video type.
 */
export async function uploadVideoFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadResult> {
  const bucket = detectBucket(file)
  if (bucket !== VIDEO_BUCKET) {
    throw new Error(
      `Expected a video file but received "${file.type}". Accepted: MP4, MOV, WebM, AVI.`,
    )
  }
  return uploadMediaFile(file, options)
}

// ---------------------------------------------------------------------------
// Batch upload
// ---------------------------------------------------------------------------

export interface BatchUploadResult {
  succeeded: UploadResult[]
  failed: Array<{ file: File; error: string }>
}

/**
 * Upload multiple audio/video files concurrently.
 * Does not throw on individual failures — check the `failed` array.
 */
export async function uploadMediaFiles(
  files: File[],
  options: UploadOptions = {},
): Promise<BatchUploadResult> {
  const results = await Promise.allSettled(
    files.map((f) => uploadMediaFile(f, options)),
  )

  const succeeded: UploadResult[] = []
  const failed: Array<{ file: File; error: string }> = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      succeeded.push(result.value)
    } else {
      failed.push({
        file: files[i],
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      })
    }
  })

  return { succeeded, failed }
}

// ---------------------------------------------------------------------------
// Delete helper
// ---------------------------------------------------------------------------

/**
 * Remove a previously uploaded file from storage.
 */
export async function deleteMediaFile(bucket: 'audio' | 'videos', path: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    throw new Error(`Failed to delete "${bucket}/${path}": ${error.message}`)
  }
}
