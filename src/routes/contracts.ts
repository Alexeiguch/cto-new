import { Router } from 'express';
import { ContractController } from '../controllers/ContractController';
import { DatabaseService } from '../models/Database';
import { DocumentService } from '../services/DocumentService';
import multer from 'multer';

const router = Router();

// Initialize services
const db = new DatabaseService();
const documentService = new DocumentService(db);
const contractController = new ContractController(db, documentService);

// Contract analysis endpoints
router.post('/analyze', contractController.analyzeContract.bind(contractController));
router.get('/drafts/:draftId', contractController.getContractDraft.bind(contractController));
router.put('/drafts/:draftId/fields/:fieldName', contractController.updateContractField.bind(contractController));
router.post('/drafts/:draftId/complete', contractController.completeContractDraft.bind(contractController));
router.get('/documents/:documentId/drafts', contractController.getContractDraftsByDocument.bind(contractController));

export default router;