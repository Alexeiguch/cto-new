import { DatabaseService } from '../models/Database';
import { DocumentService } from '../services/DocumentService';
import { LLMService } from '../services/LLMService';
import { ContractAnalysisService } from '../services/ContractAnalysisService';

// Simple test to verify all services can be instantiated
export function testServices() {
  console.log('Testing service instantiation...');
  
  try {
    const db = new DatabaseService(':memory:');
    console.log('✓ Database service initialized');
    
    const documentService = new DocumentService(db);
    console.log('✓ Document service initialized');
    
    const llmService = new LLMService();
    console.log('✓ LLM service initialized');
    
    const contractAnalysisService = new ContractAnalysisService(db, llmService, documentService);
    console.log('✓ Contract analysis service initialized');
    
    console.log('All services initialized successfully!');
    
    db.close();
  } catch (error) {
    console.error('Service initialization failed:', error);
  }
}

if (require.main === module) {
  testServices();
}