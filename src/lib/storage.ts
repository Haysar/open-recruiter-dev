/**
 * S3-compatible file storage (Infomaniak Object Storage or any S3-compatible provider).
 *
 * Required env vars:
 *   STORAGE_BUCKET_URL        — e.g. https://s3.pub1.infomaniak.cloud
 *   STORAGE_BUCKET_NAME       — e.g. open-recruiter-uploads
 *   STORAGE_ACCESS_KEY_ID     — S3 access key
 *   STORAGE_SECRET_ACCESS_KEY — S3 secret key
 */

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { randomBytes } from "crypto"

function getClient() {
  const endpoint = process.env.STORAGE_BUCKET_URL
  if (!endpoint) throw new Error("STORAGE_BUCKET_URL is not set")

  return new S3Client({
    endpoint,
    region: "us-east-1", // required by SDK, ignored by most S3-compatible providers
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true, // required for non-AWS S3-compatible endpoints
  })
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"])
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

/**
 * Uploads a File object to S3 and returns the public URL.
 * Throws if storage env vars are missing, file is too large, or type is disallowed.
 */
export async function uploadEvidence(file: File, candidateId: string): Promise<string> {
  const bucket = process.env.STORAGE_BUCKET_NAME
  if (!bucket) throw new Error("STORAGE_BUCKET_NAME is not set")

  if (file.size > MAX_BYTES) {
    throw new Error(`Evidence file is too large (max 5 MB, got ${(file.size / 1024 / 1024).toFixed(1)} MB).`)
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`File type "${file.type}" is not allowed. Use JPEG, PNG, WebP, GIF, or PDF.`)
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin"
  const key = `evidence/${candidateId}/${randomBytes(16).toString("hex")}.${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      // Evidence files are private by default — admin reviews them
      ACL: "private",
    })
  )

  // Return a path reference (not a public URL since ACL is private)
  return `${process.env.STORAGE_BUCKET_URL}/${bucket}/${key}`
}
