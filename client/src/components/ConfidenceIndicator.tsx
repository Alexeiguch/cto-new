import React from 'react';
import { Box, LinearProgress, Chip } from '@mui/material';

interface ConfidenceIndicatorProps {
  confidence: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.8) return '#4caf50'; // Green
  if (confidence >= 0.6) return '#ff9800'; // Orange
  return '#f44336'; // Red
};

const getConfidenceLabel = (confidence: number): string => {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
};

const getConfidenceVariant = (confidence: number): 'filled' | 'outlined' => {
  return confidence >= 0.6 ? 'filled' : 'outlined';
};

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  showLabel = true,
  size = 'small'
}) => {
  const confidencePercent = Math.round(confidence * 100);
  const color = getConfidenceColor(confidence);
  const label = getConfidenceLabel(confidence);
  const variant = getConfidenceVariant(confidence);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {showLabel && (
        <Chip
          label={`${label} (${confidencePercent}%)`}
          size={size as 'small' | 'medium'}
          variant={variant as 'outlined' | 'filled'}
          sx={{
            backgroundColor: variant === 'filled' ? color : 'transparent',
            color: variant === 'filled' ? 'white' : color,
            borderColor: color,
            fontWeight: 'bold',
            fontSize: size === 'small' ? '0.75rem' : '0.875rem'
          }}
        />
      )}
      <Box flex={1} minWidth={100}>
        <LinearProgress
          variant="determinate"
          value={confidencePercent}
          sx={{
            height: size === 'small' ? 4 : 6,
            borderRadius: 3,
            backgroundColor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              backgroundColor: color,
              borderRadius: 3,
            },
          }}
        />
      </Box>
    </Box>
  );
};