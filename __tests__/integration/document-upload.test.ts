import { uploadDocument, getDocuments } from '@/app/actions/documents'
import { PrismaClient } from '@prisma/client'
import { processPdfDocument } from '@/lib/pdfProcessor'
import { storeFile } from '@/lib/storage'

// Mock dependencies
jest.mock('@prisma/client')
jest.mock('@/lib/pdfProcessor')
jest.mock('@/lib/storage')

const mockPrisma = PrismaClient as jest.MockedClass<typeof PrismaClient>
const mockProcessPdfDocument = processPdfDocument as jest.MockedFunction<typeof processPdfDocument>
const mockStoreFile = storeFile as jest.MockedFunction<typeof storeFile>

describe('Document Upload Integration', () => {
  let mockDocument: any
  let mockPageAsset: any

  beforeEach(() => {
    jest.clearAllMocks()

    // Setup Prisma mocks
    mockDocument = {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    }
    
    mockPageAsset = {
      create: jest.fn(),
    }

    mockPrisma.mockImplementation(() => ({
      document: mockDocument,
      pageAsset: mockPageAsset,
    }))

    // Mock storage
    mockStoreFile.mockResolvedValue('https://example.com/original.pdf')

    // Mock PDF processing (should be called asynchronously)
    mockProcessPdfDocument.mockResolvedValue(undefined)
  })

  it('should handle complete document upload flow', async () => {
    const fileContent = 'fake pdf content'
    const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('file', file)

    // Mock document creation
    const mockCreatedDocument = {
      id: 'doc-123',
      filename: 'test.pdf',
      fileSize: file.size,
      mimeType: 'application/pdf',
      status: 'PENDING',
    }
    mockDocument.create.mockResolvedValue(mockCreatedDocument)

    // Mock document update with storage URL
    mockDocument.update.mockResolvedValue({
      ...mockCreatedDocument,
      originalUrl: 'https://example.com/original.pdf',
    })

    const result = await uploadDocument(formData)

    // Verify successful upload
    expect(result.success).toBe(true)
    expect(result.documentId).toBe('doc-123')

    // Verify document was created
    expect(mockDocument.create).toHaveBeenCalledWith({
      data: {
        filename: 'test.pdf',
        fileSize: file.size,
        mimeType: 'application/pdf',
        status: 'PENDING',
      },
    })

    // Verify file was stored
    expect(mockStoreFile).toHaveBeenCalledWith(
      expect.any(Buffer),
      'documents/doc-123/original.pdf'
    )

    // Verify document was updated with storage URL
    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc-123' },
      data: { originalUrl: 'https://example.com/original.pdf' },
    })

    // Verify PDF processing was started
    expect(mockProcessPdfDocument).toHaveBeenCalledWith(
      'doc-123',
      expect.any(Buffer)
    )
  })

  it('should reject non-PDF files', async () => {
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadDocument(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Only PDF files are allowed')
  })

  it('should handle missing file', async () => {
    const formData = new FormData()

    const result = await uploadDocument(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('No file provided')
  })

  it('should retrieve documents with pages', async () => {
    const mockDocuments = [
      {
        id: 'doc-1',
        filename: 'document1.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        status: 'COMPLETED',
        createdAt: new Date(),
        updatedAt: new Date(),
        pages: [
          {
            id: 'page-1',
            pageNumber: 1,
            text: 'Page 1 content',
            imageUrl: 'https://example.com/page1.png',
          },
          {
            id: 'page-2',
            pageNumber: 2,
            text: 'Page 2 content',
            imageUrl: 'https://example.com/page2.png',
          },
        ],
      },
    ]

    mockDocument.findMany.mockResolvedValue(mockDocuments)

    const result = await getDocuments()

    expect(result.success).toBe(true)
    expect(result.documents).toEqual(mockDocuments)

    // Verify query parameters
    expect(mockDocument.findMany).toHaveBeenCalledWith({
      include: {
        pages: {
          orderBy: { pageNumber: 'asc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  })

  it('should handle database errors during upload', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('file', file)

    mockDocument.create.mockRejectedValue(new Error('Database connection failed'))

    const result = await uploadDocument(formData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Upload failed')
  })
})