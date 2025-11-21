import { storeFile, getFileUrl } from '@/lib/storage'
import AWS from 'aws-sdk'

// Mock AWS SDK
jest.mock('aws-sdk')

const mockS3 = AWS.S3 as jest.MockedClass<typeof AWS.S3>

describe('Storage Utilities', () => {
  let mockUpload: jest.Mock
  let mockGetSignedUrl: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()

    mockUpload = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://example-bucket.s3.amazonaws.com/test-file.pdf',
      }),
    })

    mockGetSignedUrl = jest.fn().mockReturnValue('https://signed-url.example.com/file.pdf')

    mockS3.mockImplementation(() => ({
      upload: mockUpload,
      getSignedUrl: mockGetSignedUrl,
    }))

    // Set environment variables
    process.env.AWS_ACCESS_KEY_ID = 'test-key'
    process.env.AWS_SECRET_ACCESS_KEY = 'test-secret'
    process.env.AWS_REGION = 'us-east-1'
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket'
  })

  it('should store file successfully', async () => {
    const buffer = Buffer.from('test file content')
    const key = 'test-file.pdf'
    const contentType = 'application/pdf'

    const result = await storeFile(buffer, key, contentType)

    expect(mockUpload).toHaveBeenCalledWith({
      Bucket: 'test-bucket',
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private',
    })

    expect(result).toBe('https://example-bucket.s3.amazonaws.com/test-file.pdf')
  })

  it('should handle storage errors', async () => {
    const buffer = Buffer.from('test file content')
    const key = 'test-file.pdf'

    mockUpload.mockReturnValue({
      promise: jest.fn().mockRejectedValue(new Error('S3 upload failed')),
    })

    await expect(storeFile(buffer, key)).rejects.toThrow('Failed to store file')
  })

  it('should generate signed URL for file access', async () => {
    const key = 'test-file.pdf'

    const result = await getFileUrl(key)

    expect(mockGetSignedUrl).toHaveBeenCalledWith('getObject', {
      Bucket: 'test-bucket',
      Key: key,
      Expires: 3600,
    })

    expect(result).toBe('https://signed-url.example.com/file.pdf')
  })

  it('should handle URL generation errors', async () => {
    const key = 'test-file.pdf'

    mockGetSignedUrl.mockImplementation(() => {
      throw new Error('Failed to generate signed URL')
    })

    await expect(getFileUrl(key)).rejects.toThrow('Failed to get file URL')
  })
})