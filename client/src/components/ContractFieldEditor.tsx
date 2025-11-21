import React, { useState } from 'react';
import {
  Box,
  TextField,
  Typography,
  IconButton,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { ContractField } from '../types';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface ContractFieldEditorProps {
  field: ContractField;
  onUpdate: (fieldName: string, value: any) => Promise<void>;
  disabled?: boolean;
}

const fieldConfigs: Record<string, { type: string; label: string; options?: string[]; multiline?: boolean }> = {
  propertyAddress: { type: 'text', label: 'Property Address' },
  purchasePrice: { type: 'number', label: 'Purchase Price ($)' },
  buyerName: { type: 'text', label: 'Buyer Name' },
  sellerName: { type: 'text', label: 'Seller Name' },
  closingDate: { type: 'date', label: 'Closing Date' },
  possessionDate: { type: 'date', label: 'Possession Date' },
  earnestMoney: { type: 'number', label: 'Earnest Money ($)' },
  financingType: { 
    type: 'select', 
    label: 'Financing Type',
    options: ['cash', 'conventional', 'FHA', 'VA', 'USDA', 'other']
  },
  contingencyPeriod: { type: 'number', label: 'Contingency Period (days)' },
  inspectionPeriod: { type: 'number', label: 'Inspection Period (days)' },
  appraisalContingency: { type: 'boolean', label: 'Appraisal Contingency' },
  loanContingency: { type: 'boolean', label: 'Loan Contingency' },
  propertyType: {
    type: 'select',
    label: 'Property Type',
    options: ['single family', 'condo', 'townhouse', 'multi-family', 'land', 'other']
  },
  squareFootage: { type: 'number', label: 'Square Footage' },
  bedrooms: { type: 'number', label: 'Bedrooms' },
  bathrooms: { type: 'number', label: 'Bathrooms' },
  parcelId: { type: 'text', label: 'Parcel ID/APN' },
  legalDescription: { type: 'text', label: 'Legal Description', multiline: true },
  hoaName: { type: 'text', label: 'HOA Name' },
  hoaFee: { type: 'number', label: 'Monthly HOA Fee ($)' },
  propertyTaxes: { type: 'number', label: 'Annual Property Taxes ($)' },
  sellerCredits: { type: 'number', label: 'Seller Credits ($)' },
  closingCosts: { type: 'text', label: 'Closing Costs Responsibility' },
  titleCompany: { type: 'text', label: 'Title Company' },
  escrowOfficer: { type: 'text', label: 'Escrow Officer' },
  brokerName: { type: 'text', label: 'Broker/Realty Company' },
  specialConditions: { type: 'text', label: 'Special Conditions', multiline: true },
};

export const ContractFieldEditor: React.FC<ContractFieldEditorProps> = ({
  field,
  onUpdate,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(field.value);
  const [isSaving, setIsSaving] = useState(false);

  const config = fieldConfigs[field.name] || { type: 'text', label: field.name };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(field.name, editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update field:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(field.value);
    setIsEditing(false);
  };

  const renderValue = () => {
    if (isEditing) {
      if (config.type === 'boolean') {
        return (
          <FormControl fullWidth size="small">
            <Select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              disabled={isSaving}
            >
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        );
      }

      if (config.type === 'select') {
        return (
          <FormControl fullWidth size="small">
            <Select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              disabled={isSaving}
            >
              {config.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          type={config.type}
          value={editValue}
          onChange={(e) => {
            let value: any = e.target.value;
            if (config.type === 'number') {
              value = Number(e.target.value);
            } else if (config.type === 'boolean') {
              value = e.target.value === 'true';
            }
            setEditValue(value);
          }}
          fullWidth
          size="small"
          multiline={config.multiline}
          rows={config.multiline ? 3 : 1}
          disabled={isSaving}
        />
      );
    }

    // Display value
    let displayValue = field.value;
    if (config.type === 'boolean') {
      displayValue = field.value === true || field.value === 'true' ? 'Yes' : 'No';
    } else if (config.type === 'number' && field.value) {
      displayValue = Number(field.value).toLocaleString();
    }

    return (
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {displayValue || 'Not specified'}
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: field.required ? 'primary.main' : 'grey.300',
        borderRadius: 1,
        backgroundColor: field.validated ? 'success.light' : 'background.paper',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="subtitle2" fontWeight="bold">
              {config.label}
            </Typography>
            {field.required && (
              <Tooltip title="Required field">
                <ErrorIcon color="error" fontSize="small" />
              </Tooltip>
            )}
            {field.validated && (
              <Tooltip title="Validated">
                <CheckCircleIcon color="success" fontSize="small" />
              </Tooltip>
            )}
          </Box>
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Chip
              label={field.source}
              size="small"
              color={field.source === 'manual' ? 'primary' : 'default'}
              variant="outlined"
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {renderValue()}
        </Grid>

        <Grid item xs={12} md={3}>
          <Box display="flex" flexDirection="column" gap={1}>
            <ConfidenceIndicator confidence={field.confidence} size="small" />
            
            {!disabled && (
              <Box display="flex" gap={1}>
                {!isEditing ? (
                  <IconButton
                    size="small"
                    onClick={() => setIsEditing(true)}
                    color="primary"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <>
                    <IconButton
                      size="small"
                      onClick={handleSave}
                      disabled={isSaving}
                      color="success"
                    >
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={handleCancel}
                      disabled={isSaving}
                      color="error"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};