/**
 * Supabase Storage for file uploads (profile photos, evidence uploads).
 *
 * Required env vars:
 *   SUPABASE_URL        — e.g. https://your-project.supabase.co
 *   SUPABASE_SERVICE_KEY — Service role key for server-side uploads
 *   SUPABASE_STORAGE_BUCKET — e.g. open-recruiter-uploads
 */

import { createClient } from "@supabase/supabase-js"
import { randomBytes } from "crypto"

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
  }

  return createClient(url, serviceKey)
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Uploads a File object to Supabase Storage and returns the public URL.
 * Throws if storage env vars are missing, file is too large, or type is disallowed.
 */
export async function uploadEvidence(file: File, candidateId: string): Promise<string> {
  const bucket = process.env.SUPABASE_STORAGE_BUCKET
  if (!bucket) throw new Error("SUPABASE_STORAGE_BUCKET is not set")

  if (file.size > MAX_BYTES) {
    throw new Error(`Evidence file is too large (max 5 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB).`)
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Use JPEG, PNG, WebP, GIF, or PDF.`)
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
  const key = `evidence/${candidateId}/${randomBytes(16).toString("hex")}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const supabase = getSupabaseClient()

  // Upload file to Supabase Storage
  const { error } = await supabase.storage.from(bucket).upload(key, buffer, {
    contentType: file.type,
    upsert: false, // Don't overwrite existing files
  })

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`)
  }

  // Get public URL for the uploaded file
  const { data } = supabase.storage.from(bucket).getPublicUrl(key)
  
  if (!data?.publicUrl) {
    throw new Error("Failed to get public URL for uploaded file")
  }

  return data.publicUrl
}