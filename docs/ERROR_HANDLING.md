# Error Handling Strategy

## Overview

The PDF ingestion system implements comprehensive error handling at multiple levels to ensure reliability and provide clear feedback to users.

## Error Categories

### 1. Client-Side Errors
- File validation failures
- Network connectivity issues
- User input errors

### 2. Server-Side Errors
- File processing failures
- Database connection issues
- Storage service errors

### 3. System-Level Errors
- Memory exhaustion
- Disk space issues
- Service timeouts

## Error Handling Implementation

### File Upload Errors

#### Validation Errors
```typescript
// File type validation
if (file.type !== 'application/pdf') {
  return { success: false, error: 'Only PDF files are allowed' }
}

// File size validation (example: 50MB limit)
if (file.size > 50 * 1024 * 1024) {
  return { success: false, error: 'File size exceeds 50MB limit' }
}
```

#### Network Errors
```typescript
try {
  const result = await uploadDocument(formData)
} catch (error) {
  if (error instanceof TypeError) {
    // Network error
    setMessage('Network error. Please check your connection.')
  } else {
    // Other unexpected errors
    setMessage('Upload failed. Please try again.')
  }
}
```

### PDF Processing Errors

#### Corrupted PDF Files
```typescript
try {
  const pdfDoc = await pdfjsLib.getDocument({ data: pdfBuffer }).promise
} catch (error) {
  console.error(`Invalid PDF for document ${documentId}:`, error)
  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'FAILED' },
  })
  throw new Error('Invalid or corrupted PDF file')
}
```

#### Page-Level Errors
```typescript
for (let pageNum = 1; pageNum <= numPages; pageNum++) {
  try {
    // Process individual page
    await processPage(pageNum)
  } catch (pageError) {
    console.error(`Error processing page ${pageNum}:`, pageError)
    // Continue with next page - don't fail entire document
    await prisma.pageAsset.create({
      data: {
        documentId,
        pageNumber: pageNum,
        text: undefined, // Mark as failed
        imageUrl: undefined,
      },
    })
  }
}
```

### Storage Errors

#### S3 Connection Issues
```typescript
export async function storeFile(buffer: Buffer, key: string): Promise<string> {
  try {
    const result = await s3.upload(params).promise()
    return result.Location
  } catch (error) {
    console.error('Storage error:', error)
    
    // Fallback to local storage
    if (process.env.NODE_ENV === 'development') {
      return await storeFileLocal(buffer, key)
    }
    
    throw new Error('Failed to store file')
  }
}
```

#### Storage Quota Exceeded
```typescript
try {
  await storeFile(buffer, key)
} catch (error) {
  if (error.code === 'QuotaExceeded') {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'FAILED' },
    })
    throw new Error('Storage quota exceeded. Please contact administrator.')
  }
  throw error
}
```

### Database Errors

#### Connection Failures
```typescript
let retries = 3
while (retries > 0) {
  try {
    await prisma.document.create({ data: documentData })
    break
  } catch (error) {
    retries--
    if (retries === 0) {
      console.error('Database connection failed after retries:', error)
      throw new Error('Database temporarily unavailable')
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}
```

## Error Response Format

### API Response Structure
```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  details?: any
}
```

### Client-Side Error Display
```typescript
const getErrorMessage = (error: string, code?: string) => {
  switch (code) {
    case 'FILE_TOO_LARGE':
      return 'File size exceeds the 50MB limit'
    case 'INVALID_FILE_TYPE':
      return 'Please upload a PDF file'
    case 'STORAGE_FULL':
      return 'Storage temporarily unavailable. Please try again later'
    default:
      return error || 'An unexpected error occurred'
  }
}
```

## Logging Strategy

### Structured Logging
```typescript
import { logger } from '@/lib/logger'

logger.error('PDF processing failed', {
  documentId,
  error: error.message,
  stack: error.stack,
  pageNumber,
  timestamp: new Date().toISOString(),
})
```

### Error Categories for Monitoring
1. **Critical**: Database failures, storage service outages
2. **Warning**: Individual page failures, slow processing
3. **Info**: Successful completions, performance metrics

## User Communication

### Status Updates
- **PENDING**: Document uploaded, waiting to process
- **PROCESSING**: Currently extracting content
- **COMPLETED**: Successfully processed
- **FAILED**: Error during processing

### Error Messages
```typescript
const errorMessages = {
  'INVALID_PDF': 'The uploaded file is not a valid PDF',
  'CORRUPTED_PDF': 'The PDF file appears to be corrupted',
  'TOO_LARGE': 'File size exceeds the 50MB limit',
  'STORAGE_ERROR': 'Unable to store file. Please try again',
  'PROCESSING_ERROR': 'Error processing document. Please check the file and try again',
  'NETWORK_ERROR': 'Network connection error. Please check your internet connection',
}
```

## Recovery Mechanisms

### Automatic Retry
```typescript
const retryableOperations = ['s3_upload', 'database_write']

const shouldRetry = (error: Error, operation: string) => {
  return retryableOperations.includes(operation) && 
         (error.code === 'Timeout' || error.code === 'ConnectionError')
}
```

### Manual Recovery
- Admin interface to retry failed documents
- Bulk reprocessing capabilities
- Document deletion and re-upload options

## Monitoring and Alerting

### Metrics to Track
- Upload success rate
- Processing success rate
- Average processing time
- Error frequency by type
- Storage utilization

### Alert Conditions
- Error rate > 5% over 1 hour
- Processing time > 5 minutes per document
- Storage utilization > 80%
- Database connection failures

## Testing Error Scenarios

### Unit Tests
```typescript
describe('Error Handling', () => {
  it('should handle corrupted PDF files', async () => {
    mockPdfjsLib.getDocument.mockRejectedValue(new Error('Invalid PDF'))
    
    await expect(processPdfDocument('doc-123', corruptedBuffer))
      .rejects.toThrow('Invalid or corrupted PDF file')
  })

  it('should continue processing when individual pages fail', async () => {
    // Mock page failure
    mockPage.render.mockRejectedValueOnce(new Error('Render failed'))
    
    await processPdfDocument('doc-123', validBuffer)
    
    // Should still complete successfully
    expect(mockDocument.update).toHaveBeenCalledWith({
      where: { id: 'doc-123' },
      data: { status: 'COMPLETED' },
    })
  })
})
```

### Integration Tests
- Network failure simulation
- Storage service unavailable
- Database connection issues
- Invalid file formats

## Best Practices

1. **Fail Fast**: Validate inputs early
2. **Graceful Degradation**: Continue processing when possible
3. **Clear Communication**: Provide actionable error messages
4. **Comprehensive Logging**: Log all errors with context
5. **Monitoring**: Track error rates and patterns
6. **Testing**: Cover all error scenarios
7. **Documentation**: Maintain error handling documentation

## Future Enhancements

1. **Circuit Breaker Pattern**: Prevent cascade failures
2. **Dead Letter Queue**: Handle failed processing asynchronously
3. **Health Checks**: Monitor service dependencies
4. **Automated Recovery**: Self-healing mechanisms
5. **Error Analytics**: ML-based error prediction and prevention