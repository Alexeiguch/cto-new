import { Request, Response } from 'express';
import { ContractAnalysisService } from '../services/ContractAnalysisService';
import { DocumentService } from '../services/DocumentService';
import { LLMService } from '../services/LLMService';
import { DatabaseService } from '../models/Database';
import { AnalyzeContractRequest, AnalyzeContractResponse } from '../types';
import Joi from 'joi';

const analyzeContractSchema = Joi.object({
  documentId: Joi.string().uuid().required(),
  propertyId: Joi.string().uuid().required(),
  llmProvider: Joi.string().valid('openai', 'anthropic').optional()
});

const updateFieldSchema = Joi.object({
  value: Joi.required(),
  source: Joi.string().valid('manual', 'extraction', 'llm').optional()
});

export class ContractController {
  private contractAnalysisService: ContractAnalysisService;

  constructor(
    private db: DatabaseService,
    private documentService: DocumentService
  ) {
    const llmService = new LLMService();
    this.contractAnalysisService = new ContractAnalysisService(
      db,
      llmService,
      documentService
    );
  }

  async analyzeContract(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = analyzeContractSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const request: AnalyzeContractRequest = value;
      const draft = await this.contractAnalysisService.analyzeContract(request);

      const response: AnalyzeContractResponse = {
        draftId: draft.id,
        fields: draft.fields,
        confidence: this.calculateOverallConfidence(draft.fields),
        status: draft.status
      };

      res.status(200).json(response);
    } catch (error: any) {
      console.error('Contract analysis failed:', error);
      res.status(500).json({ 
        error: 'Contract analysis failed',
        message: error.message 
      });
    }
  }

  async getContractDraft(req: Request, res: Response): Promise<void> {
    try {
      const { draftId } = req.params;
      
      if (!draftId) {
        res.status(400).json({ error: 'Draft ID is required' });
        return;
      }

      const draft = await this.contractAnalysisService.getContractDraft(draftId);
      
      if (!draft) {
        res.status(404).json({ error: 'Contract draft not found' });
        return;
      }

      res.status(200).json(draft);
    } catch (error: any) {
      console.error('Failed to get contract draft:', error);
      res.status(500).json({ 
        error: 'Failed to get contract draft',
        message: error.message 
      });
    }
  }

  async updateContractField(req: Request, res: Response): Promise<void> {
    try {
      const { draftId, fieldName } = req.params;
      
      if (!draftId || !fieldName) {
        res.status(400).json({ error: 'Draft ID and field name are required' });
        return;
      }

      const { error, value } = updateFieldSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const updatedDraft = await this.contractAnalysisService.updateContractField(
        draftId,
        fieldName,
        value.value,
        value.source
      );

      res.status(200).json(updatedDraft);
    } catch (error: any) {
      console.error('Failed to update contract field:', error);
      res.status(500).json({ 
        error: 'Failed to update contract field',
        message: error.message 
      });
    }
  }

  async completeContractDraft(req: Request, res: Response): Promise<void> {
    try {
      const { draftId } = req.params;
      
      if (!draftId) {
        res.status(400).json({ error: 'Draft ID is required' });
        return;
      }

      const completedDraft = await this.contractAnalysisService.completeContractDraft(draftId);
      res.status(200).json(completedDraft);
    } catch (error: any) {
      console.error('Failed to complete contract draft:', error);
      res.status(500).json({ 
        error: 'Failed to complete contract draft',
        message: error.message 
      });
    }
  }

  async getContractDraftsByDocument(req: Request, res: Response): Promise<void> {
    try {
      const { documentId } = req.params;
      
      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      const drafts = await this.contractAnalysisService.getContractDraftsByDocument(documentId);
      res.status(200).json(drafts);
    } catch (error: any) {
      console.error('Failed to get contract drafts:', error);
      res.status(500).json({ 
        error: 'Failed to get contract drafts',
        message: error.message 
      });
    }
  }

  private calculateOverallConfidence(fields: any[]): number {
    if (fields.length === 0) return 0;
    
    const totalConfidence = fields.reduce((sum, field) => sum + field.confidence, 0);
    return totalConfidence / fields.length;
  }
}