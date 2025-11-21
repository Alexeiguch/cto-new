export interface ContractField {
  name: string;
  value: any;
  confidence: number;
  source: 'extraction' | 'llm' | 'manual';
  validated: boolean;
  required: boolean;
}

export interface ContractDraft {
  id: string;
  documentId: string;
  propertyId: string;
  status: 'draft' | 'review' | 'completed';
  fields: ContractField[];
  extractedText?: string;
  llmResponse?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  keyImages?: string[];
  uploadedAt: Date;
}

export interface Property {
  id: string;
  address: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  parcelId?: string;
  owner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LLMRequest {
  prompt: string;
  schema: any;
  context: {
    documentText: string;
    propertyData?: Property;
    keyImages?: string[];
  };
}

export interface LLMResponse {
  fields: Record<string, any>;
  confidence: Record<string, number>;
  reasoning?: string;
}

export interface AnalyzeContractRequest {
  documentId: string;
  propertyId: string;
  llmProvider?: 'openai' | 'anthropic';
}

export interface AnalyzeContractResponse {
  draftId: string;
  fields: ContractField[];
  confidence: number;
  status: string;
}