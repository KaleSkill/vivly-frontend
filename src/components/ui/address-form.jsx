import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { toast } from 'sonner';

export const AddressForm = ({ onSave, initialData = null, onCancel }) => {
  const [formData, setFormData] = useState({
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || 'India',
    postalCode: initialData?.postalCode || '',
    phone: initialData?.phone || '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.address.trim()) {
      toast.error('Address is required');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('City is required');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('State is required');
      return;
    }
    if (!formData.postalCode.trim()) {
      toast.error('Postal code is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      toast.success('Address saved successfully');
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Address' : 'Add New Address'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              placeholder="Enter your full address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Enter city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Enter state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="India">India</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="UK">UK</SelectItem>
                  <SelectItem value="Canada">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                placeholder="Enter postal code"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save Address'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
