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
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  extractedText?: string;
  keyImages?: string[];
  uploadedAt: string;
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
  createdAt: string;
  updatedAt: string;
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