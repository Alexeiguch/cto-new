import { Request, Response } from 'express';
import { DocumentService } from '../services/DocumentService';
import { DatabaseService } from '../models/Database';
import { Property } from '../types';
import Joi from 'joi';
import { v4 as uuidv4 } from 'uuid';

const propertySchema = Joi.object({
  address: Joi.string().required(),
  price: Joi.number().optional(),
  bedrooms: Joi.number().integer().optional(),
  bathrooms: Joi.number().optional(),
  squareFootage: Joi.number().optional(),
  parcelId: Joi.string().optional(),
  owner: Joi.string().optional()
});

export class DocumentController {
  constructor(
    private documentService: DocumentService,
    private db: DatabaseService
  ) {}

  async uploadDocument(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const document = await this.documentService.uploadDocument(req.file);
      res.status(201).json(document);
    } catch (error: any) {
      console.error('Document upload failed:', error);
      res.status(500).json({ 
        error: 'Document upload failed',
        message: error.message 
      });
    }
  }

  async getDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      
      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      const document = await this.documentService.getDocument(documentId);
      
      if (!document) {
        res.status(404).json({ error: 'Document not found' });
        return;
      }

      res.status(200).json(document);
    } catch (error: any) {
      console.error('Failed to get document:', error);
      res.status(500).json({ 
        error: 'Failed to get document',
        message: error.message 
      });
    }
  }

  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = propertySchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const property: Property = {
        id: uuidv4(),
        ...value,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.db.createProperty(property);
      res.status(201).json(property);
    } catch (error: any) {
      console.error('Failed to create property:', error);
      res.status(500).json({ 
        error: 'Failed to create property',
        message: error.message 
      });
    }
  }

  async getProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      
      if (!propertyId) {
        res.status(400).json({ error: 'Property ID is required' });
        return;
      }

      const property = this.db.getProperty(propertyId);
      
      if (!property) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      res.status(200).json(property);
    } catch (error: any) {
      console.error('Failed to get property:', error);
      res.status(500).json({ 
        error: 'Failed to get property',
        message: error.message 
      });
    }
  }

  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;
      
      if (!propertyId) {
        res.status(400).json({ error: 'Property ID is required' });
        return;
      }

      const { error, value } = propertySchema.validate(req.body, { allowUnknown: true });
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      // Check if property exists
      const existingProperty = this.db.getProperty(propertyId);
      if (!existingProperty) {
        res.status(404).json({ error: 'Property not found' });
        return;
      }

      this.db.updateProperty(propertyId, value);
      const updatedProperty = this.db.getProperty(propertyId);
      
      res.status(200).json(updatedProperty);
    } catch (error: any) {
      console.error('Failed to update property:', error);
      res.status(500).json({ 
        error: 'Failed to update property',
        message: error.message 
      });
    }
  }

  async deleteDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      
      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      await this.documentService.deleteDocument(documentId);
      res.status(204).send();
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      res.status(500).json({ 
        error: 'Failed to delete document',
        message: error.message 
      });
    }
  }
}