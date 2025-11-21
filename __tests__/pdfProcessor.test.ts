import { processPdfDocument } from '@/lib/pdfProcessor'
import { PrismaClient } from '@prisma/client'
import { storeFile } from '@/lib/storage'

// Mock dependencies
jest.mock('@prisma/client')
jest.mock('pdf-parse')
jest.mock('pdfjs-dist')
jest.mock('canvas')
jest.mock('@/lib/storage')

const mockPrisma = PrismaClient as jest.MockedClass<typeof PrismaClient>
const mockPdfParse = require('pdf-parse')
const mockPdfjsLib = require('pdfjs-dist')
const mockCanvas = require('canvas')

describe('PDF Processor', () => {
  let mockDocument: any
  let mockPage: any
  let mockCanvas: any
  let mockContext: any

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup Prisma mocks
    mockDocument = {
      update: jest.fn(),
      create: jest.fn(),
    }
    
    mockPage = {
      getViewport: jest.fn(),
      getTextContent: jest.fn(),
      render: jest.fn(),
    }

    mockCanvas = {
      getContext: jest.fn(),
      toBuffer: jest.fn(),
    }

    mockContext = {}

    mockPrisma.mockImplementation(() => ({
      document: mockDocument,
      pageAsset: {
        create: jest.fn(),
      },
    }))

    mockDocument.update.mockResolvedValue({})

    // Setup PDF.js mocks
    mockPdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: jest.fn().mockResolvedValue(mockPage),
      }),
    })

    mockPage.getViewport.mockReturnValue({ width: 600, height: 800 })
    mockPage.getTextContent.mockResolvedValue({
      items: [
        { str: 'Sample' },
        { str: 'text' },
        { str: 'content' },
      ],
    })
    mockPage.render.mockReturnValue({
      promise: Promise.resolve(),
    })

    // Setup canvas mocks
    mockCanvas.createCanvas = jest.fn().mockReturnValue(mockCanvas)
    mockCanvas.getContext.mockReturnValue(mockContext)
    mockCanvas.toBuffer.mockReturnValue(Buffer.from('fake-image-data'))

    // Setup storage mocks
    ;(storeFile as jest.Mock).mockResolvedValue('https://example.com/image.png')

    // Setup pdf-parse mock
    mockPdfParse.mockResolvedValue({
      text: 'Sample PDF content',
      numpages: 2,
    })
  })

  it('should process a PDF document successfully', async () => {
    const documentId = 'test-doc-id'
    const pdfBuffer = Buffer.from('fake-pdf-data')

    await processPdfDocument(documentId, pdfBuffer)

    // Verify document status updates
    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    })

    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    })

    // Verify PDF processing
    expect(mockPdfjsLib.getDocument).toHaveBeenCalledWith({ data: pdfBuffer })
    expect(mockPdfParse).toHaveBeenCalledWith(pdfBuffer)

    // Verify page processing
    expect(mockPage.getViewport).toHaveBeenCalledWith({ scale: 2.0 })
    expect(mockPage.getTextContent).toHaveBeenCalled()
    expect(mockPage.render).toHaveBeenCalled()

    // Verify storage calls
    expect(storeFile).toHaveBeenCalledTimes(2) // One for each page
    expect(storeFile).toHaveBeenCalledWith(
      Buffer.from('fake-image-data'),
      `documents/${documentId}/pages/1.png`,
      'image/png'
    )
  })

  it('should handle processing errors gracefully', async () => {
    const documentId = 'test-doc-id'
    const pdfBuffer = Buffer.from('fake-pdf-data')

    // Mock an error during processing
    mockPdfjsLib.getDocument.mockReturnValue({
      promise: Promise.reject(new Error('PDF parsing error')),
    })

    await expect(processPdfDocument(documentId, pdfBuffer)).rejects.toThrow('PDF parsing error')

    // Verify status is set to FAILED
    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: documentId },
      data: { status: 'FAILED' },
    })
  })

  it('should continue processing even if individual pages fail', async () => {
    const documentId = 'test-doc-id'
    const pdfBuffer = Buffer.from('fake-pdf-data')

    // Mock first page to succeed, second to fail
    mockPdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: jest.fn()
          .mockResolvedValueOnce(mockPage)
          .mockRejectedValueOnce(new Error('Page processing error')),
      }),
    })

    await processPdfDocument(documentId, pdfBuffer)

    // Should still mark as completed despite page 2 failure
    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    })

    // Should still have processed the first page
    expect(storeFile).toHaveBeenCalledTimes(1)
  })

  it('should extract text content correctly', async () => {
    const documentId = 'test-doc-id'
    const pdfBuffer = Buffer.from('fake-pdf-data')

    await processPdfDocument(documentId, pdfBuffer)

    // Verify text extraction
    expect(mockPage.getTextContent).toHaveBeenCalled()
    
    // Verify page asset creation with text
    const mockPrismaInstance = mockPrisma.mock.results[0].value
    expect(mockPrismaInstance.pageAsset.create).toHaveBeenCalledWith({
      data: {
        documentId,
        pageNumber: 1,
        text: 'Sample text content',
        imageUrl: 'https://example.com/image.png',
        imageWidth: 600,
        imageHeight: 800,
      },
    })
  })
})