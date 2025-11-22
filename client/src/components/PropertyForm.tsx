import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Property } from '../types';
import { propertyService } from '../services/api';

interface PropertyFormProps {
  onPropertyCreated: (property: Property) => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  onPropertyCreated,
}) => {
  const [property, setProperty] = useState({
    address: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    parcelId: '',
    owner: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setProperty(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!property.address.trim()) {
      setError('Address is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        address: property.address.trim(),
        ...(property.price && { price: Number(property.price) }),
        ...(property.bedrooms && { bedrooms: Number(property.bedrooms) }),
        ...(property.bathrooms && { bathrooms: Number(property.bathrooms) }),
        ...(property.squareFootage && { squareFootage: Number(property.squareFootage) }),
        ...(property.parcelId.trim() && { parcelId: property.parcelId.trim() }),
        ...(property.owner.trim() && { owner: property.owner.trim() }),
      };

      const createdProperty = await propertyService.createProperty(propertyData);
      onPropertyCreated(createdProperty);
      
      // Reset form
      setProperty({
        address: '',
        price: '',
        bedrooms: '',
        bathrooms: '',
        squareFootage: '',
        parcelId: '',
        owner: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Property Information
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address *"
                value={property.address}
                onChange={handleChange('address')}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Purchase Price ($)"
                type="number"
                value={property.price}
                onChange={handleChange('price')}
                disabled={loading}
                InputProps={{
                  startAdornment: '$',
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Square Footage"
                type="number"
                value={property.squareFootage}
                onChange={handleChange('squareFootage')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={property.bedrooms}
                onChange={handleChange('bedrooms')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Bathrooms"
                type="number"
                value={property.bathrooms}
                onChange={handleChange('bathrooms')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Parcel ID / APN"
                value={property.parcelId}
                onChange={handleChange('parcelId')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Owner"
                value={property.owner}
                onChange={handleChange('owner')}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Creating...' : 'Create Property'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};