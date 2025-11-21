'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { processPdfDocument } from '@/lib/pdfProcessor'
import { storeFile } from '@/lib/storage'

export async function uploadDocument(formData: FormData) {
  try {
    const file = formData.get('file') as File
    
    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    if (file.type !== 'application/pdf') {
      return { success: false, error: 'Only PDF files are allowed' }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: 'PENDING',
      },
    })

    // Store original file in cloud storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const originalUrl = await storeFile(buffer, `documents/${document.id}/original.pdf`)
    
    // Update document with storage URL
    await prisma.document.update({
      where: { id: document.id },
      data: { originalUrl },
    })

    // Start async processing
    processPdfDocument(document.id, buffer).catch(console.error)

    revalidatePath('/')
    
    return { success: true, documentId: document.id }
  } catch (error) {
    console.error('Upload error:', error)
    return { success: false, error: 'Upload failed' }
  }
}

export async function getDocuments() {
  try {
    const documents = await prisma.document.findMany({
      include: {
        pages: {
          orderBy: { pageNumber: 'asc' },
          take: 5, // Limit preview pages
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10, // Limit recent documents
    })

    return { success: true, documents }
  } catch (error) {
    console.error('Fetch error:', error)
    return { success: false, error: 'Failed to fetch documents' }
  }
}