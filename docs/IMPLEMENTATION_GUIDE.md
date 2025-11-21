# PDF Ingestion System - Implementation Guide

## Overview

This document provides a comprehensive guide to the PDF ingestion system implementation, covering architecture, components, deployment, and maintenance.

## System Architecture

### High-Level Flow

```
User Upload → Validation → Storage → Processing → Database → UI Display
```

### Components

1. **Frontend (Next.js App Router)**
   - Document upload interface
   - Status tracking dashboard
   - Results verification UI

2. **Backend (Next.js API/Server Actions)**
   - File upload handling
   - PDF processing orchestration
   - Database operations

3. **Processing Engine**
   - Text extraction (pdf-parse)
   - Image rasterization (pdfjs-dist + canvas)
   - Storage coordination

4. **Storage Layer**
   - AWS S3 (production)
   - MinIO (development)
   - Local filesystem (fallback)

5. **Database (PostgreSQL + Prisma)**
   - Document metadata
   - Page assets tracking
   - Processing status

## File Structure

```
pdf-ingestion-system/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions
│   │   └── documents.ts          # Document operations
│   ├── api/                      # API Routes
│   │   ├── documents/            # Document endpoints
│   │   │   └── route.ts
│   │   └── health/               # Health check
│   │       └── route.ts
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── DocumentUpload.tsx        # Upload interface
│   └── DocumentList.tsx          # Document listing
├── lib/                          # Utility libraries
│   ├── logger.ts                 # Logging utility
│   ├── pdfProcessor.ts           # PDF processing logic
│   ├── prisma.ts                 # Database client
│   └── storage.ts                # Storage abstraction
├── prisma/                       # Database schema
│   ├── migrations/               # Database migrations
│   └── schema.prisma             # Prisma schema
├── __tests__/                    # Test files
│   ├── integration/              # Integration tests
│   ├── pdfProcessor.test.ts      # PDF processor tests
│   └── storage.test.ts           # Storage tests
├── docs/                         # Documentation
│   ├── ERROR_HANDLING.md         # Error handling strategy
│   ├── STORAGE_STRATEGY.md       # Storage architecture
│   └── IMPLEMENTATION_GUIDE.md    # This file
├── scripts/                      # Utility scripts
│   ├── dev-setup.sh              # Development setup
│   └── init-db.ts                # Database initialization
└── docker-compose.yml            # Development services
```

## Core Components

### 1. Document Upload Flow

**File**: `app/actions/documents.ts`

```typescript
export async function uploadDocument(formData: FormData) {
  // 1. Validate file (PDF only, size limits)
  // 2. Create database record (PENDING status)
  // 3. Store original file in cloud storage
  // 4. Update record with storage URL
  // 5. Trigger async processing
}
```

### 2. PDF Processing Pipeline

**File**: `lib/pdfProcessor.ts`

```typescript
export async function processPdfDocument(documentId: string, pdfBuffer: Buffer) {
  // 1. Update status to PROCESSING
  // 2. Load PDF with pdfjs-dist
  // 3. Extract text with pdf-parse
  // 4. For each page:
  //    - Extract page text
  //    - Rasterize to image (2x scale)
  //    - Store image in cloud storage
  //    - Create PageAsset record
  // 5. Update status to COMPLETED/FAILED
}
```

### 3. Storage Abstraction

**File**: `lib/storage.ts`

```typescript
export async function storeFile(buffer: Buffer, key: string): Promise<string> {
  // 1. Configure S3/MinIO client
  // 2. Upload file with metadata
  // 3. Return public/signed URL
  // 4. Handle errors with fallback
}
```

### 4. Database Schema

**File**: `prisma/schema.prisma`

```prisma
model Document {
  id          String      @id @default(cuid())
  filename    String
  originalUrl String?
  fileSize    Int
  mimeType    String
  status      DocumentStatus @default(PENDING)
  pages       PageAsset[]
}

model PageAsset {
  id         String @id @default(cuid())
  documentId String
  pageNumber Int
  text       String?
  imageUrl   String?
  imageWidth Int?
  imageHeight Int?
}
```

## Processing Details

### Text Extraction

- **Library**: `pdf-parse`
- **Method**: Full document parsing for comprehensive text extraction
- **Fallback**: Page-level extraction if full parsing fails

### Image Rasterization

- **Library**: `pdfjs-dist` + `canvas`
- **Scale**: 2.0 (200% resolution for OCR quality)
- **Format**: PNG (lossless quality)
- **Dimensions**: Preserved from original PDF

### Error Handling Strategy

1. **Validation Layer**: File type, size, format checks
2. **Processing Layer**: Graceful degradation on page failures
3. **Storage Layer**: Automatic fallback to local storage
4. **Database Layer**: Connection retry, transaction safety
5. **User Interface**: Clear status indicators and error messages

## Development Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client tools (optional)

### Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository>
   cd pdf-ingestion-system
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start Services**
   ```bash
   ./scripts/dev-setup.sh
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Access Applications**
   - Main App: http://localhost:3000
   - MinIO Console: http://localhost:9001 (minioadmin/minioadmin)

### Local Services

- **PostgreSQL**: Port 5432
- **MinIO**: Ports 9000 (API) & 9001 (Console)

## Production Deployment

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@host:5432/db"
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket"

# Optional
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret"
```

### Deployment Steps

1. **Database Setup**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

### Infrastructure Requirements

- **Database**: PostgreSQL 12+
- **Storage**: AWS S3 or compatible
- **Runtime**: Node.js 18+
- **Memory**: Minimum 2GB (for PDF processing)
- **Disk**: Temporary storage for processing

## Testing Strategy

### Test Categories

1. **Unit Tests**
   - PDF processing utilities
   - Storage operations
   - Database operations

2. **Integration Tests**
   - End-to-end upload flow
   - Processing pipeline
   - Error scenarios

3. **Manual Testing**
   - File upload interface
   - Status updates
   - Result verification

### Running Tests

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## Monitoring and Maintenance

### Logging

- **Structured Logging**: JSON format with context
- **Levels**: error, warn, info, debug
- **Destinations**: Console (dev), external service (prod)

### Health Checks

- **Endpoint**: `/api/health`
- **Checks**: Database connectivity, storage availability
- **Response**: Service status and configuration

### Performance Metrics

- **Upload Success Rate**: Target >95%
- **Processing Time**: Target <2 minutes per 10-page document
- **Storage Usage**: Monitor quota and costs
- **Error Rates**: Alert on >5% failure rate

### Maintenance Tasks

1. **Database**
   - Regular backups
   - Index optimization
   - Log cleanup

2. **Storage**
   - Lifecycle policies for old documents
   - Cost optimization
   - Access audit

3. **Application**
   - Dependency updates
   - Security patches
   - Performance monitoring

## Security Considerations

### File Upload Security

- **File Type Validation**: PDF only
- **Size Limits**: Configurable maximum file size
- **Virus Scanning**: Consider integration for production
- **Access Control**: User authentication and authorization

### Data Protection

- **Encryption**: S3 server-side encryption
- **Access Control**: IAM roles and bucket policies
- **Data Retention**: Configurable retention policies
- **Compliance**: GDPR/CCPA considerations

### Network Security

- **HTTPS**: Required for production
- **CORS**: Properly configured for API access
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all user inputs

## Scaling Considerations

### Horizontal Scaling

- **Application**: Multiple instances behind load balancer
- **Database**: Read replicas, connection pooling
- **Storage**: CDN integration for static assets

### Performance Optimization

- **Caching**: Redis for session and temporary data
- **Queue System**: Background job processing (future)
- **CDN**: Global content delivery
- **Image Optimization**: Adaptive quality and format

### Future Enhancements

1. **Queue-Based Processing**: Redis/RabbitMQ for async jobs
2. **Microservices**: Separate processing service
3. **Multi-Cloud Storage**: Provider abstraction
4. **Advanced OCR**: Integration with Tesseract/Cloud Vision
5. **Document Classification**: ML-based categorization
6. **Real-time Updates**: WebSocket for status notifications

## Troubleshooting

### Common Issues

1. **Upload Failures**
   - Check file size limits
   - Verify storage credentials
   - Check network connectivity

2. **Processing Errors**
   - Validate PDF format
   - Check memory availability
   - Review error logs

3. **Database Issues**
   - Verify connection string
   - Check migration status
   - Monitor connection pool

### Debug Commands

```bash
# Check database connection
npx prisma db pull

# Test storage access
aws s3 ls s3://your-bucket

# View application logs
docker-compose logs -f

# Check service health
curl http://localhost:3000/api/health
```

## Support and Contributing

### Getting Help

1. **Documentation**: Check this guide and related docs
2. **Issues**: Review existing GitHub issues
3. **Logs**: Check application and service logs
4. **Community**: Contact development team

### Contributing Guidelines

1. **Code Style**: Follow existing patterns
2. **Testing**: Include tests for new features
3. **Documentation**: Update relevant docs
4. **Review**: Submit pull requests for review

---

This implementation provides a solid foundation for PDF document ingestion with room for growth and customization based on specific business requirements.