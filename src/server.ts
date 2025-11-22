import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import contractRoutes from './routes/contracts';
import documentRoutes from './routes/documents';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/contracts', contractRoutes);
app.use('/api/documents', documentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Contract Autofill Service API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      contracts: '/api/contracts',
      documents: '/api/documents'
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Contract Autofill Service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
});

export default app;