import { ContractDraft, ContractField, AnalyzeContractRequest, LLMRequest, Property } from '../types';
import { DatabaseService } from '../models/Database';
import { LLMService } from './LLMService';
import { DocumentService } from './DocumentService';
import { v4 as uuidv4 } from 'uuid';

export class ContractAnalysisService {
  constructor(
    private db: DatabaseService,
    private llmService: LLMService,
    private documentService: DocumentService
  ) {}

  async analyzeContract(request: AnalyzeContractRequest): Promise<ContractDraft> {
    // Get document and property data
    const document = this.db.getDocument(request.documentId);
    const property = this.db.getProperty(request.propertyId);

    if (!document) {
      throw new Error('Document not found');
    }

    if (!property) {
      throw new Error('Property not found');
    }

    // Check if there's already a draft for this document-property pair
    const existingDrafts = this.db.getContractDraftsByDocument(request.documentId);
    const existingDraft = existingDrafts.find(d => d.property_id === request.propertyId);

    if (existingDraft && existingDraft.status !== 'draft') {
      throw new Error('Contract analysis already completed for this document-property pair');
    }

    // Prepare context for LLM
    const keyImages = await this.documentService.extractKeyImages(request.documentId);
    
    const llmRequest: LLMRequest = {
      prompt: 'Analyze this real estate contract',
      schema: this.llmService.getContractSchema(),
      context: {
        documentText: document.extracted_text || '',
        propertyData: property,
        keyImages
      }
    };

    // Call LLM
    const llmResponse = await this.llmService.analyzeContract(
      llmRequest, 
      request.llmProvider || 'openai'
    );

    // Convert LLM response to ContractField format
    const fields = this.convertToContractFields(llmResponse, property);

    // Create or update contract draft
    const draftId = existingDraft?.id || uuidv4();
    const contractDraft: ContractDraft = {
      id: draftId,
      documentId: request.documentId,
      propertyId: request.propertyId,
      status: 'review',
      fields,
      extractedText: document.extracted_text,
      llmResponse,
      createdAt: existingDraft ? new Date(existingDraft.created_at) : new Date(),
      updatedAt: new Date()
    };

    if (existingDraft) {
      this.db.updateContractDraft(draftId, contractDraft);
    } else {
      this.db.createContractDraft(contractDraft);
    }

    return contractDraft;
  }

  private convertToContractFields(llmResponse: any, property: Property): ContractField[] {
    const fields: ContractField[] = [];
    const extractedFields = llmResponse.fields || {};
    const confidence = llmResponse.confidence || {};

    // Define all possible contract fields with their requirements
    const fieldDefinitions = {
      propertyAddress: { required: true, type: 'string' },
      purchasePrice: { required: true, type: 'number' },
      buyerName: { required: true, type: 'string' },
      sellerName: { required: true, type: 'string' },
      closingDate: { required: true, type: 'string' },
      possessionDate: { required: false, type: 'string' },
      earnestMoney: { required: false, type: 'number' },
      financingType: { required: false, type: 'string' },
      contingencyPeriod: { required: false, type: 'number' },
      inspectionPeriod: { required: false, type: 'number' },
      appraisalContingency: { required: false, type: 'boolean' },
      loanContingency: { required: false, type: 'boolean' },
      propertyType: { required: false, type: 'string' },
      squareFootage: { required: false, type: 'number' },
      bedrooms: { required: false, type: 'number' },
      bathrooms: { required: false, type: 'number' },
      parcelId: { required: false, type: 'string' },
      legalDescription: { required: false, type: 'string' },
      hoaName: { required: false, type: 'string' },
      hoaFee: { required: false, type: 'number' },
      propertyTaxes: { required: false, type: 'number' },
      sellerCredits: { required: false, type: 'number' },
      closingCosts: { required: false, type: 'string' },
      titleCompany: { required: false, type: 'string' },
      escrowOfficer: { required: false, type: 'string' },
      brokerName: { required: false, type: 'string' },
      specialConditions: { required: false, type: 'string' }
    };

    // Process each field
    Object.entries(fieldDefinitions).forEach(([fieldName, definition]) => {
      let value = extractedFields[fieldName];
      let source: 'extraction' | 'llm' | 'manual' = 'llm';
      let fieldConfidence = confidence[fieldName] || 0.5;

      // Auto-fill known fields from property data
      if (!value && property) {
        switch (fieldName) {
          case 'propertyAddress':
            value = property.address;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
          case 'purchasePrice':
            value = property.price;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
          case 'squareFootage':
            value = property.squareFootage;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
          case 'bedrooms':
            value = property.bedrooms;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
          case 'bathrooms':
            value = property.bathrooms;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
          case 'parcelId':
            value = property.parcelId;
            source = 'extraction';
            fieldConfidence = 1.0;
            break;
        }
      }

      // Only add field if it has a value or is required
      if (value !== undefined && value !== null && value !== '' || definition.required) {
        fields.push({
          name: fieldName,
          value,
          confidence: fieldConfidence,
          source,
          validated: fieldConfidence >= 0.8,
          required: definition.required
        });
      }
    });

    return fields;
  }

  async getContractDraft(draftId: string): Promise<ContractDraft | null> {
    const draft = this.db.getContractDraft(draftId);
    return draft || null;
  }

  async updateContractDraft(draftId: string, updates: Partial<ContractDraft>): Promise<ContractDraft> {
    const existingDraft = await this.getContractDraft(draftId);
    if (!existingDraft) {
      throw new Error('Contract draft not found');
    }

    const updatedDraft = {
      ...existingDraft,
      ...updates,
      updatedAt: new Date()
    };

    this.db.updateContractDraft(draftId, updatedDraft);
    return updatedDraft;
  }

  async updateContractField(draftId: string, fieldName: string, value: any, source: 'manual' = 'manual'): Promise<ContractDraft> {
    const draft = await this.getContractDraft(draftId);
    if (!draft) {
      throw new Error('Contract draft not found');
    }

    // Update or add the field
    const fieldIndex = draft.fields.findIndex(f => f.name === fieldName);
    const updatedField: ContractField = {
      name: fieldName,
      value,
      confidence: source === 'manual' ? 1.0 : 0.9,
      source,
      validated: true,
      required: draft.fields.find(f => f.name === fieldName)?.required || false
    };

    if (fieldIndex >= 0) {
      draft.fields[fieldIndex] = updatedField;
    } else {
      draft.fields.push(updatedField);
    }

    return await this.updateContractDraft(draftId, { fields: draft.fields });
  }

  async completeContractDraft(draftId: string): Promise<ContractDraft> {
    const draft = await this.getContractDraft(draftId);
    if (!draft) {
      throw new Error('Contract draft not found');
    }

    // Validate all required fields
    const requiredFields = draft.fields.filter(f => f.required);
    const missingRequiredFields = requiredFields.filter(f => !f.value || f.value === '');

    if (missingRequiredFields.length > 0) {
      throw new Error(`Missing required fields: ${missingRequiredFields.map(f => f.name).join(', ')}`);
    }

    return await this.updateContractDraft(draftId, { status: 'completed' });
  }

  async getContractDraftsByDocument(documentId: string): Promise<ContractDraft[]> {
    const drafts = this.db.getContractDraftsByDocument(documentId);
    return drafts.map(draft => ({
      id: draft.id,
      documentId: draft.document_id,
      propertyId: draft.property_id,
      status: draft.status,
      fields: draft.fields,
      extractedText: draft.extracted_text,
      llmResponse: draft.llm_response,
      createdAt: new Date(draft.created_at),
      updatedAt: new Date(draft.updated_at)
    }));
  }
}