# PDF Ingestion System

A Next.js application for uploading, processing, and extracting content from real estate PDF documents.

## Features

- **PDF Upload**: Drag-and-drop interface for uploading PDF documents
- **Cloud Storage**: Automatic storage to AWS S3 with local fallback
- **Content Extraction**: Text extraction and page image rasterization
- **Status Tracking**: Real-time processing status (pending/processing/complete/failed)
- **Document Management**: View and verify extraction results
- **Error Handling**: Comprehensive error handling and recovery mechanisms

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **PDF Processing**: pdf-parse, pdfjs-dist, sharp, canvas
- **Storage**: AWS S3 (with local fallback)
- **Testing**: Jest, React Testing Library

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- AWS S3 bucket (optional, local storage available for development)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pdf_ingestion"

# AWS S3 (optional for development)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## API Endpoints

### Document Management
- `POST /api/documents` - Upload a new document
- `GET /api/documents` - List recent documents

### Server Actions
- `uploadDocument(formData)` - Handle file upload
- `getDocuments()` - Retrieve documents with pages

## Database Schema

### Document Model
- `id`: Unique identifier
- `filename`: Original filename
- `originalUrl`: Cloud storage URL
- `fileSize`: File size in bytes
- `mimeType`: MIME type
- `status`: Processing status (PENDING/PROCESSING/COMPLETED/FAILED)
- `createdAt/updatedAt`: Timestamps

### PageAsset Model
- `id`: Unique identifier
- `documentId`: Reference to document
- `pageNumber`: Page number
- `text`: Extracted text content
- `imageUrl`: Extracted image URL
- `imageWidth/imageHeight`: Image dimensions
- `createdAt/updatedAt`: Timestamps

## Processing Pipeline

1. **Upload**: Client uploads PDF via form
2. **Storage**: Original file stored in S3/local storage
3. **Processing**: Async extraction begins
   - Text extraction using pdf-parse
   - Image rasterization using pdfjs-dist + canvas
   - Storage of extracted assets
4. **Completion**: Status updated to COMPLETED

## Error Handling

The system implements comprehensive error handling:

- **Validation**: File type and size validation
- **Processing**: Graceful handling of corrupted PDFs and page failures
- **Storage**: Fallback to local storage if S3 fails
- **Database**: Connection retry logic
- **User Feedback**: Clear error messages and status updates

See [docs/ERROR_HANDLING.md](docs/ERROR_HANDLING.md) for detailed error handling strategy.

## Storage Strategy

Documents are stored using a hybrid approach:

- **Primary**: AWS S3 for production
- **Fallback**: Local storage for development
- **Organization**: Structured folder hierarchy by document ID
- **Access**: Private storage with signed URLs

See [docs/STORAGE_STRATEGY.md](docs/STORAGE_STRATEGY.md) for complete storage documentation.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run coverage
npm test -- --coverage
```

### Test Structure

- **Unit Tests**: Individual component and utility testing
- **Integration Tests**: End-to-end workflow testing
- **Mocking**: Comprehensive mocking of external dependencies

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Setup

1. Configure production database
2. Set up AWS S3 bucket and IAM permissions
3. Configure environment variables
4. Run database migrations
5. Deploy application

## Performance Considerations

- **File Size Limit**: 50MB default (configurable)
- **Processing**: Async processing prevents blocking
- **Storage**: Efficient image compression and organization
- **Caching**: Client-side caching for document lists

## Security

- **File Validation**: Strict PDF-only uploads
- **Storage Security**: Private S3 buckets with signed URLs
- **Input Sanitization**: Protection against malicious uploads
- **Access Control**: IAM roles for AWS resources

## Monitoring

- **Logging**: Structured logging for all operations
- **Error Tracking**: Comprehensive error capture and reporting
- **Metrics**: Processing success rates and performance metrics
- **Alerts**: Configurable alerts for critical failures

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.