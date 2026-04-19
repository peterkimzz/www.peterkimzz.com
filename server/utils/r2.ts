import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createError } from 'h3'
import { useRuntimeConfig } from '#imports'

function getR2Config() {
  const config = useRuntimeConfig()

  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey || !config.r2BucketName || !config.r2PublicBaseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'R2 configuration is missing',
    })
  }

  return config
}

export async function uploadToR2(file: File) {
  const config = getR2Config()
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'png'
  const key = `blog/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.r2AccountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
    },
  })

  await client.send(new PutObjectCommand({
    Bucket: config.r2BucketName,
    Key: key,
    Body: new Uint8Array(await file.arrayBuffer()),
    ContentType: file.type || 'application/octet-stream',
  }))

  return {
    key,
    url: `${String(config.r2PublicBaseUrl).replace(/\/$/, '')}/${key}`,
  }
}
