import AWS from 'aws-sdk'
import { logger } from './logger'

// Configure AWS SDK
const s3Config: AWS.S3.ClientConfiguration = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
}

// Add custom endpoint for MinIO (local development)
if (process.env.AWS_S3_ENDPOINT) {
  s3Config.endpoint = process.env.AWS_S3_ENDPOINT
  s3Config.s3ForcePathStyle = true
}

const s3 = new AWS.S3(s3Config)

const bucketName = process.env.AWS_S3_BUCKET_NAME

export async function storeFile(
  buffer: Buffer, 
  key: string, 
  contentType: string = 'application/octet-stream'
): Promise<string> {
  logger.debug('Storing file', { key, size: buffer.length, contentType })

  try {
    const params = {
      Bucket: bucketName!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private', // or 'public-read' if you want direct access
    }

    const result = await s3.upload(params).promise()
    logger.info('File stored successfully', { key, location: result.Location })
    return result.Location // URL to the stored file
  } catch (error) {
    logger.error('Storage error', { key, error: error as Error })
    throw new Error('Failed to store file')
  }
}

export async function getFileUrl(key: string): Promise<string> {
  logger.debug('Generating file URL', { key })

  try {
    const params = {
      Bucket: bucketName!,
      Key: key,
      Expires: 3600, // URL expires in 1 hour
    }

    const url = s3.getSignedUrl('getObject', params)
    logger.debug('File URL generated', { key })
    return url
  } catch (error) {
    logger.error('Get URL error', { key, error: error as Error })
    throw new Error('Failed to get file URL')
  }
}

// Fallback to local storage for development
export async function storeFileLocal(
  buffer: Buffer, 
  key: string, 
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const fs = require('fs')
  const path = require('path')
  
  const uploadsDir = path.join(process.cwd(), 'uploads')
  const filePath = path.join(uploadsDir, key)
  
  // Ensure directory exists
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  
  // Write file
  fs.writeFileSync(filePath, buffer)
  
  // Return relative URL
  return `/uploads/${key}`
}