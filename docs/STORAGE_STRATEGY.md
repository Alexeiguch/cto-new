# Storage Strategy for PDF Ingestion System

## Overview

The PDF ingestion system uses a hybrid storage approach to handle document files efficiently and cost-effectively.

## Storage Architecture

### 1. Cloud Storage (Primary)
- **Provider**: AWS S3 (configurable)
- **Purpose**: Long-term storage of original PDFs and extracted page images
- **Benefits**: 
  - Scalability
  - Durability (99.999999999%)
  - Cost-effective for large files
  - Built-in access control

### 2. Local Storage (Development/Fallback)
- **Purpose**: Development environment and backup storage
- **Location**: `/uploads/` directory in project root
- **Usage**: Automatically used when AWS credentials are not configured

## File Organization

### Original Documents
```
s3://bucket-name/documents/{documentId}/original.pdf
```

### Extracted Page Images
```
s3://bucket-name/documents/{documentId}/pages/{pageNumber}.png
```

### Local Storage Structure
```
/uploads/
├── documents/
│   ├── {documentId}/
│   │   ├── original.pdf
│   │   └── pages/
│   │       ├── 1.png
│   │       ├── 2.png
│   │       └── ...
```

## Storage Configuration

### Environment Variables
```bash
# AWS Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

### IAM Policy Requirements
Minimum required permissions for the S3 bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name"
    }
  ]
}
```

## Access Control

### Private Storage (Default)
- Files are stored with `private` ACL
- Access requires signed URLs with 1-hour expiration
- Recommended for production environments

### Public Storage (Optional)
- Set ACL to `public-read` for direct access
- Useful for development or public document repositories
- Configure in `lib/storage.ts`

## Cost Optimization

### S3 Storage Classes
- **Standard**: Default for active documents
- **Infrequent Access (IA)**: For documents older than 30 days
- **Glacier**: For archival of old documents (future enhancement)

### Image Optimization
- PNG format for lossless quality
- 2x scale (200% resolution) for OCR quality
- Consider WebP for better compression (future enhancement)

## Backup and Recovery

### Automated Backups
- S3 provides versioning and cross-region replication
- Configure lifecycle policies for automatic archiving

### Disaster Recovery
- Multi-AZ S3 buckets
- Cross-region replication for critical data
- Local storage as emergency fallback

## Monitoring and Metrics

### Storage Metrics to Track
- Total storage consumption
- Upload/download success rates
- Average file size and processing time
- Storage cost per document

### CloudWatch Alerts
- High storage usage (>80% capacity)
- Failed upload attempts
- Unusual access patterns

## Security Considerations

### Encryption
- S3 server-side encryption (SSE-S3) enabled by default
- Consider client-side encryption for sensitive documents

### Access Control
- IAM roles for application access
- Bucket policies for external access
- VPC endpoints for private connectivity

### Data Retention
- Implement retention policies for compliance
- Secure deletion for sensitive documents
- Audit logging for access tracking

## Future Enhancements

### Planned Improvements
1. **CDN Integration**: CloudFront for faster image delivery
2. **Smart Compression**: Adaptive image quality based on content
3. **Distributed Storage**: Multi-cloud support for redundancy
4. **Edge Processing**: Lambda@Edge for image optimization
5. **Cost Analytics**: Detailed storage cost breakdown per document

### Scalability Considerations
- Horizontal scaling of storage nodes
- Auto-scaling based on upload volume
- Geographic distribution for global users
- Caching strategies for frequently accessed documents