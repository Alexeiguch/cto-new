import { Router } from 'express';
import { DocumentController } from '../controllers/DocumentController';
import { DatabaseService } from '../models/Database';
import { DocumentService } from '../services/DocumentService';
import multer from 'multer';

const router = Router();

// Initialize services
const db = new DatabaseService();
const documentService = new DocumentService(db);
const documentController = new DocumentController(documentService, db);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Document endpoints
router.post('/upload', upload.single('document'), documentController.uploadDocument.bind(documentController));
router.get('/:documentId', documentController.getDocument.bind(documentController));
router.delete('/:documentId', documentController.deleteDocument.bind(documentController));

// Property endpoints
router.post('/properties', documentController.createProperty.bind(documentController));
router.get('/properties/:propertyId', documentController.getProperty.bind(documentController));
router.put('/properties/:propertyId', documentController.updateProperty.bind(documentController));

export default router;