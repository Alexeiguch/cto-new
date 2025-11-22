import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as DocumentIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Document } from '../types';
import { documentService } from '../services/api';

interface DocumentUploadProps {
  onDocumentUploaded: (document: Document) => void;
  maxFileSize?: number;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onDocumentUploaded,
  maxFileSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocuments, setUploadedDocuments] = useState<Document[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize) {
      setError(`File size must be less than ${maxFileSize / 1024 / 1024}MB`);
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const document = await documentService.uploadDocument(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setUploadedDocuments(prev => [...prev, document]);
      onDocumentUploaded(document);
      
      // Reset after a short delay
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document');
      setUploading(false);
      setUploadProgress(0);
    }
  }, [maxFileSize, onDocumentUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: uploading,
  });

  const handleRemoveDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err: any) {
      setError(err.message || 'Failed to remove document');
    }
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the PDF here' : 'Upload Contract Document'}
        </Typography>
        
        <Typography variant="body2" color="textSecondary">
          Drag and drop a PDF file here, or click to select a file
        </Typography>
        
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          Maximum file size: {maxFileSize / 1024 / 1024}MB
        </Typography>

        {!isDragActive && (
          <Button variant="outlined" sx={{ mt: 2 }}>
            Choose File
          </Button>
        )}
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Uploading document...
          </Typography>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {uploadedDocuments.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Documents
          </Typography>
          <List>
            {uploadedDocuments.map((doc) => (
              <ListItem
                key={doc.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 1,
                  mb: 1,
                }}
              >
                <ListItemIcon>
                  <DocumentIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={doc.originalName}
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        Size: {(doc.size / 1024).toFixed(1)} KB
                      </Typography>
                      {doc.extractedText && (
                        <Typography variant="caption" display="block" color="success.main">
                          Text extracted successfully
                        </Typography>
                      )}
                    </>
                  }
                />
                <IconButton
                  edge="end"
                  onClick={() => handleRemoveDocument(doc.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};