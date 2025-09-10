import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Edit, Plus, MapPin, Trash2, Star } from 'lucide-react';
import { AddressForm } from '@/components/ui/address-form';
import { toast } from 'sonner';

export const AddressSelector = ({ addresses = [], onSelectAddress, onAddAddress, onEditAddress, onDeleteAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const handleAddressSelect = (addressId) => {
    const address = addresses.find(addr => addr._id === addressId);
    setSelectedAddress(addressId);
    onSelectAddress(address);
  };

  const handleAddAddress = async (addressData) => {
    try {
      await onAddAddress(addressData);
      setShowAddForm(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEditAddress = async (addressData) => {
    try {
      await onEditAddress(editingAddress._id, addressData);
      setEditingAddress(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await onDeleteAddress(addressId);
      toast.success('Address deleted successfully');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  if (showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add New Address</h3>
          <Button variant="ghost" onClick={() => setShowAddForm(false)}>
            Back
          </Button>
        </div>
        <AddressForm onSave={handleAddAddress} onCancel={() => setShowAddForm(false)} />
      </div>
    );
  }

  if (editingAddress) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Address</h3>
          <Button variant="ghost" onClick={() => setEditingAddress(null)}>
            Back
          </Button>
        </div>
        <AddressForm 
          initialData={editingAddress} 
          onSave={handleEditAddress} 
          onCancel={() => setEditingAddress(null)} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Delivery Address</h3>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/30 rounded-lg">
          <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
          <h4 className="text-lg font-medium mb-2">No addresses found</h4>
          <p className="text-muted-foreground mb-6">Add an address to continue with your order</p>
          <Button onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Address
          </Button>
        </div>
      ) : (
        <RadioGroup value={selectedAddress} onValueChange={handleAddressSelect}>
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address._id} className={`cursor-pointer transition-all p-4 rounded-lg ${
                selectedAddress === address._id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <RadioGroupItem value={address._id} id={address._id} />
                    <div className="flex-1">
                      <Label htmlFor={address._id} className="cursor-pointer">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{address.address}</p>
                            {address.isDefault && (
                              <div className="flex items-center gap-1 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                <Star className="w-3 h-3" />
                                Default
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.postalCode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.country}</p>
                          <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingAddress(address)}
                      className="gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    {addresses.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address._id)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>
      )}

      {selectedAddress && (
        <div className="pt-4">
          <Button className="w-full" onClick={() => {/* Proceed to next step */}}>
            Continue to Payment
          </Button>
        </div>
      )}
    </div>
  );
};
