import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import pdf from 'pdf-parse'
import * as pdfjsLib from 'pdfjs-dist'
import sharp from 'sharp'
import { storeFile } from './storage'
import { createCanvas } from 'canvas'

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'

export async function processPdfDocument(documentId: string, pdfBuffer: Buffer) {
  logger.info('Starting PDF processing', { documentId, fileSize: pdfBuffer.length })

  try {
    // Update status to processing
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'PROCESSING' },
    })

    // Load PDF document
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise
    const numPages = pdfDoc.numPages

    logger.info('PDF loaded successfully', { documentId, numPages })

    // Extract text from entire document
    const textData = await pdf(pdfBuffer)
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        logger.debug('Processing page', { documentId, pageNumber: pageNum })

        // Get page
        const page = await pdfDoc.getPage(pageNum)
        
        // Extract text for this page
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .trim()

        // Rasterize page to image
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = createCanvas(viewport.width, viewport.height)
        const context = canvas.getContext('2d')

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise

        // Convert canvas to buffer
        const imageBuffer = canvas.toBuffer('image/png')
        
        // Store image in cloud storage
        const imageUrl = await storeFile(
          imageBuffer, 
          `documents/${documentId}/pages/${pageNum}.png`,
          'image/png'
        )

        // Create page asset record
        await prisma.pageAsset.create({
          data: {
            documentId,
            pageNumber: pageNum,
            text: pageText || undefined,
            imageUrl,
            imageWidth: viewport.width,
            imageHeight: viewport.height,
          },
        })

        logger.debug('Page processed successfully', { documentId, pageNumber: pageNum })

      } catch (pageError) {
        logger.error('Error processing page', { 
          documentId, 
          pageNumber: pageNum, 
          error: pageError as Error 
        })
        // Continue with next page even if one fails
      }
    }

    // Update status to completed
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'COMPLETED' },
    })

    logger.info('PDF processing completed successfully', { documentId, numPages })

  } catch (error) {
    logger.error('PDF processing failed', { 
      documentId, 
      error: error as Error 
    })
    
    // Update status to failed
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    })
    
    throw error
  }
}