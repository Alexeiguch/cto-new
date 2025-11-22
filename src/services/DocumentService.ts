import pdfParse from 'pdf-parse';
import { Document } from '../types';
import { DatabaseService } from '../models/Database';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

export class DocumentService {
  constructor(private db: DatabaseService) {}

  async uploadDocument(file: Express.Multer.File): Promise<Document> {
    const documentId = uuidv4();
    const filename = `${documentId}-${file.originalname}`;
    const uploadPath = path.join(process.env.UPLOAD_DIR || './uploads', filename);

    // Ensure upload directory exists
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save file
    fs.writeFileSync(uploadPath, file.buffer);

    // Extract text from PDF
    let extractedText = '';
    if (file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(file.buffer);
        extractedText = pdfData.text;
      } catch (error) {
        console.error('Failed to extract text from PDF:', error);
        extractedText = '';
      }
    }

    const document: Document = {
      id: documentId,
      filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      extractedText,
      uploadedAt: new Date()
    };

    this.db.createDocument(document);
    return document;
  }

  async getDocument(documentId: string): Promise<Document | null> {
    const doc = this.db.getDocument(documentId);
    return doc || null;
  }

  async extractTextFromPDF(filePath: string): Promise<string> {
    try {
      const buffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(buffer);
      return pdfData.text;
    } catch (error) {
      console.error('Failed to extract text from PDF:', error);
      throw new Error('PDF text extraction failed');
    }
  }

  async extractKeyImages(documentId: string): Promise<string[]> {
    // This is a placeholder for image extraction
    // In a real implementation, you would use libraries like pdf-poppler or similar
    // to extract images from specific pages/sections of the PDF
    const keyImages: string[] = [];

    // For now, we'll return empty array
    // Future implementation could:
    // 1. Extract signature pages
    // 2. Extract property images
    // 3. Extract legal description pages
    // 4. Extract addendum pages

    return keyImages;
  }

  async deleteDocument(documentId: string): Promise<void> {
    const document = await this.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Delete file from filesystem
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Database cleanup would be handled by foreign key constraints
    // or explicit deletion in the database service
  }

  getDocumentPath(documentId: string): string {
    const document = this.db.getDocument(documentId);
    if (!document) {
      throw new Error('Document not found');
    }
    return path.join(process.env.UPLOAD_DIR || './uploads', document.filename);
  }
}