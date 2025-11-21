import axios from 'axios';
import { 
  ContractDraft, 
  Document, 
  Property, 
  AnalyzeContractRequest, 
  AnalyzeContractResponse 
} from '../types';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const documentService = {
  uploadDocument: async (file: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('document', file);
    
    const response = await api.post('/api/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getDocument: async (documentId: string): Promise<Document> => {
    const response = await api.get(`/api/documents/${documentId}`);
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/api/documents/${documentId}`);
  },
};

export const propertyService = {
  createProperty: async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
    const response = await api.post('/api/documents/properties', property);
    return response.data;
  },

  getProperty: async (propertyId: string): Promise<Property> => {
    const response = await api.get(`/api/documents/properties/${propertyId}`);
    return response.data;
  },

  updateProperty: async (propertyId: string, updates: Partial<Property>): Promise<Property> => {
    const response = await api.put(`/api/documents/properties/${propertyId}`, updates);
    return response.data;
  },
};

export const contractService = {
  analyzeContract: async (request: AnalyzeContractRequest): Promise<AnalyzeContractResponse> => {
    const response = await api.post('/api/contracts/analyze', request);
    return response.data;
  },

  getContractDraft: async (draftId: string): Promise<ContractDraft> => {
    const response = await api.get(`/api/contracts/drafts/${draftId}`);
    return response.data;
  },

  updateContractField: async (
    draftId: string, 
    fieldName: string, 
    value: any, 
    source: 'manual' = 'manual'
  ): Promise<ContractDraft> => {
    const response = await api.put(`/api/contracts/drafts/${draftId}/fields/${fieldName}`, {
      value,
      source,
    });
    return response.data;
  },

  completeContractDraft: async (draftId: string): Promise<ContractDraft> => {
    const response = await api.post(`/api/contracts/drafts/${draftId}/complete`);
    return response.data;
  },

  getContractDraftsByDocument: async (documentId: string): Promise<ContractDraft[]> => {
    const response = await api.get(`/api/contracts/documents/${documentId}/drafts`);
    return response.data;
  },
};

export const healthService = {
  checkHealth: async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
    const response = await api.get('/health');
    return response.data;
  },
};