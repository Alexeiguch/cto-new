import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as AnalyzeIcon,
} from '@mui/icons-material';
import { Document, Property, ContractDraft } from '../types';
import { DocumentUpload } from '../components/DocumentUpload';
import { PropertyForm } from '../components/PropertyForm';
import { ContractFieldEditor } from '../components/ContractFieldEditor';
import { contractService } from '../services/api';

const steps = ['Upload Document', 'Property Information', 'Analyze Contract', 'Review & Edit'];

export const ContractAnalysisPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [document, setDocument] = useState<Document | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [contractDraft, setContractDraft] = useState<ContractDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmProvider, setLlmProvider] = useState<'openai' | 'anthropic'>('openai');

  const handleDocumentUploaded = (uploadedDocument: Document) => {
    setDocument(uploadedDocument);
    setActiveStep(1);
    setError(null);
  };

  const handlePropertyCreated = (createdProperty: Property) => {
    setProperty(createdProperty);
    setActiveStep(2);
    setError(null);
  };

  const handleAnalyzeContract = async () => {
    if (!document || !property) {
      setError('Document and property are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await contractService.analyzeContract({
        documentId: document.id,
        propertyId: property.id,
        llmProvider,
      });

      // Get the full contract draft
      const draft = await contractService.getContractDraft(response.draftId);
      setContractDraft(draft);
      setActiveStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze contract');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldUpdate = async (fieldName: string, value: any) => {
    if (!contractDraft) return;

    try {
      const updatedDraft = await contractService.updateContractField(
        contractDraft.id,
        fieldName,
        value
      );
      setContractDraft(updatedDraft);
    } catch (err: any) {
      setError(err.message || 'Failed to update field');
    }
  };

  const handleCompleteContract = async () => {
    if (!contractDraft) return;

    setLoading(true);
    setError(null);

    try {
      const completedDraft = await contractService.completeContractDraft(contractDraft.id);
      setContractDraft(completedDraft);
    } catch (err: any) {
      setError(err.message || 'Failed to complete contract');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
        );

      case 1:
        return (
          <PropertyForm onPropertyCreated={handlePropertyCreated} />
        );

      case 2:
        return (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Ready to Analyze Contract
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" gutterBottom>
                Document: {document?.originalName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                Property: {property?.address}
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                LLM Provider:
              </Typography>
              <Chip
                label={llmProvider.toUpperCase()}
                color={llmProvider === 'openai' ? 'primary' : 'secondary'}
                onClick={() => setLlmProvider(llmProvider === 'openai' ? 'anthropic' : 'openai')}
                clickable
              />
            </Box>

            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <AnalyzeIcon />}
              onClick={handleAnalyzeContract}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Contract'}
            </Button>
          </Paper>
        );

      case 3:
        return (
          <Box>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Contract Analysis Results
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Chip
                  label={`Status: ${contractDraft?.status}`}
                  color={contractDraft?.status === 'completed' ? 'success' : 'warning'}
                />
                {contractDraft?.status === 'review' && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={handleCompleteContract}
                    disabled={loading}
                  >
                    {loading ? 'Completing...' : 'Mark Complete'}
                  </Button>
                )}
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {contractDraft?.fields.map((field) => (
              <Box key={field.name} sx={{ mb: 2 }}>
                <ContractFieldEditor
                  field={field}
                  onUpdate={handleFieldUpdate}
                  disabled={contractDraft.status === 'completed'}
                />
              </Box>
            ))}

            {contractDraft?.fields.length === 0 && (
              <Alert severity="info">
                No fields were extracted from the contract. Please try analyzing again.
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Contract Autofill Service
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          {renderStepContent()}
        </Grid>
      </Grid>

      {activeStep > 0 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={loading}
          >
            Back
          </Button>
        </Box>
      )}
    </Box>
  );
};