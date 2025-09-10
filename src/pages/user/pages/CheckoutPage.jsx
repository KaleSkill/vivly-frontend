import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { AddressSelector } from '../common/AddressSelector';
import { PaymentSelector } from '../common/PaymentSelector';
import { useCartStore } from '@/store/cartStore';
import { userApi } from '@/api/api';
import { toast } from 'sonner';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCartStore();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const steps = [
    {
      id: 1,
      title: 'Address',
      description: 'Select delivery address'
    },
    {
      id: 2,
      title: 'Payment',
      description: 'Choose payment method'
    },
    {
      id: 3,
      title: 'Confirmation',
      description: 'Review and place order'
    }
  ];

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [cartItems, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await userApi.addresses.getUserAddresses();
      if (response.data.success) {
        setAddresses(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to load addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    }
  };

  const handleAddAddress = async (addressData) => {
    try {
      const response = await userApi.addresses.addAddress(addressData);
      if (response.data.success) {
        setAddresses(prev => [...prev, response.data.data]);
        toast.success('Address added successfully');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
      throw error;
    }
  };

  const handleEditAddress = async (addressId, addressData) => {
    try {
      const response = await userApi.addresses.updateAddress(addressId, addressData);
      if (response.data.success) {
        setAddresses(prev => 
          prev.map(addr => 
            addr._id === addressId ? response.data.data : addr
          )
        );
        toast.success('Address updated successfully');
      }
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
      throw error;
    }
  };

  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setCurrentStep(2);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await userApi.addresses.deleteAddress(addressId);
      if (response.data.success) {
        setAddresses(prev => prev.filter(addr => addr._id !== addressId));
        // If deleted address was selected, clear selection
        if (selectedAddress && selectedAddress._id === addressId) {
          setSelectedAddress(null);
          setCurrentStep(1);
        }
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      throw error;
    }
  };

  const handleSelectPayment = (paymentMethod) => {
    console.log('handleSelectPayment called with:', paymentMethod, typeof paymentMethod);
    
    // Ensure we always store a string, not an object
    let cleanPaymentMethod = 'COD'; // default fallback
    if (typeof paymentMethod === 'string') {
      cleanPaymentMethod = paymentMethod;
    } else if (typeof paymentMethod === 'object' && paymentMethod?.id) {
      cleanPaymentMethod = paymentMethod.id;
    } else if (paymentMethod) {
      cleanPaymentMethod = String(paymentMethod);
    }
    
    console.log('Setting selectedPayment to:', cleanPaymentMethod);
    setSelectedPayment(cleanPaymentMethod);
    
    // Store selected address in localStorage for payment success page
    if (selectedAddress) {
      localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    }
    
    // For COD, go to confirmation step. For online providers, stay on payment step
    if (cleanPaymentMethod === 'COD') {
      setCurrentStep(3);
    } else {
      // Stay on payment step for online payment providers
      setCurrentStep(2);
    }
  };

  // Test function for debugging
  const testOrderCreation = async () => {
    console.log('Testing order creation...');
    try {
      const testData = {
        items: [{
          productId: 'test123',
          colorId: 'color123',
          size: 'M',
          quantity: 1,
          price: 100
        }],
        shippingInfo: {
          address: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          country: 'Test Country',
          postalCode: '12345',
          phone: '1234567890'
        },
        paymentMethod: 'COD',
        paymentProvider: null,
        transactionId: null
      };
      
      console.log('Test data:', testData);
      const response = await userApi.newOrders.createOrder(testData);
      console.log('Test response:', response);
    } catch (error) {
      console.error('Test error:', error);
    }
  };

  const handlePlaceOrder = async (paymentMethod = null, provider = null, transactionId = null) => {
    // Safety check: ensure we never receive an event object
    if (paymentMethod && typeof paymentMethod === 'object' && paymentMethod.type === 'click') {
      console.error('Received click event instead of payment method, using selectedPayment');
      paymentMethod = selectedPayment;
    }
    
    const finalPaymentMethod = paymentMethod || selectedPayment;
    
    console.log('handlePlaceOrder called with:', { paymentMethod, provider, transactionId, finalPaymentMethod });
    console.log('finalPaymentMethod type:', typeof finalPaymentMethod);
    console.log('finalPaymentMethod value:', finalPaymentMethod);
    console.log('Cart items count:', cartItems?.length);
    console.log('Selected address:', selectedAddress);
    
    // Ensure we always have a string payment method
    const cleanPaymentMethod = typeof finalPaymentMethod === 'string' ? finalPaymentMethod : 'COD';
    console.log('Clean payment method:', cleanPaymentMethod);
    
    if (!selectedAddress || !cleanPaymentMethod) {
      toast.error('Please complete all steps');
      return;
    }

    if (!cartItems || cartItems.length === 0) {
      toast.error('No items in cart');
      return;
    }

    setIsLoading(true);
    try {
      // Create clean order data from scratch to avoid circular references
      let cleanOrderData;
      try {
        cleanOrderData = {
          items: (cartItems || []).map(item => ({
            productId: String(item.productId),
            colorId: String(item.colorId),
            size: String(item.size),
            quantity: Number(item.quantity),
            price: Number(item.price)
          })),
          shippingInfo: {
            address: String(selectedAddress.address),
            city: String(selectedAddress.city),
            state: String(selectedAddress.state),
            country: String(selectedAddress.country),
            postalCode: String(selectedAddress.postalCode),
            phone: String(selectedAddress.phone)
          },
          paymentMethod: cleanPaymentMethod,
          paymentProvider: provider ? String(provider) : null,
          transactionId: transactionId ? String(transactionId) : null
        };
        console.log('Order data created successfully');
      } catch (error) {
        console.error('Error creating order data:', error);
        throw new Error('Failed to prepare order data');
      }

      console.log('Clean order data:', cleanOrderData);

      // Validate order data
      if (!cleanOrderData.items || cleanOrderData.items.length === 0) {
        throw new Error('No items in cart');
      }

      if (!cleanOrderData.shippingInfo.address) {
        throw new Error('Shipping address is required');
      }

      if (!cleanOrderData.paymentMethod || cleanOrderData.paymentMethod === '[object Object]') {
        throw new Error('Payment method is required');
      }

      // Test API call first - ensure no circular references
      console.log('About to call API with data:', cleanOrderData);
      
      // Additional safety check for circular references
      try {
        JSON.stringify(cleanOrderData);
        console.log('Order data is serializable');
      } catch (error) {
        console.error('Order data contains circular references:', error);
        throw new Error('Order data contains circular references');
      }
      
      // Call the order creation API
      console.log('Calling order creation API with data:', cleanOrderData);
      const response = await userApi.newOrders.createOrder(cleanOrderData);
      
      console.log('Order creation response:', response);
      
      if (response.data.success) {
        toast.success('Order placed successfully!');
        clearCart();
        navigate(`/orders/${response.data.orderId}`);
      } else {
        toast.error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    return 0; // Free shipping for now
  };

  const calculateFinalTotal = () => {
    return calculateTotal() + calculateShipping();
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Add some items to your cart to proceed with checkout</p>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-12">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address Selection */}
          {currentStep === 1 && (
            <AddressSelector
              addresses={addresses}
              onSelectAddress={handleSelectAddress}
              onAddAddress={handleAddAddress}
              onEditAddress={handleEditAddress}
              onDeleteAddress={handleDeleteAddress}
            />
          )}

          {/* Step 2: Payment Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment Method</h3>
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                  Back to Address
                </Button>
              </div>
            <PaymentSelector
              onSelectPayment={handleSelectPayment}
              selectedPayment={selectedPayment}
              onPlaceOrder={(paymentMethod, provider, transactionId) => {
                console.log('PaymentSelector onPlaceOrder called with:', { paymentMethod, provider, transactionId });
                
                // For ONLINE payments, ensure we have provider and transactionId
                if (paymentMethod === 'ONLINE') {
                  if (!provider || !transactionId) {
                    console.error('Online payment requires provider and transactionId');
                    toast.error('Payment not completed. Please complete the payment process.');
                    return;
                  }
                  // Mark payment as completed and proceed to confirmation
                  setPaymentCompleted(true);
                  setCurrentStep(3);
                }
                
                // Ensure we always pass a string, not an event
                const cleanPaymentMethod = typeof paymentMethod === 'string' ? paymentMethod : selectedPayment || 'COD';
                const cleanProvider = provider || null;
                const cleanTransactionId = transactionId || null;
                handlePlaceOrder(cleanPaymentMethod, cleanProvider, cleanTransactionId);
              }}
              isLoading={isLoading}
              orderTotal={calculateTotal()}
            />
            
            {/* Test button for debugging */}
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">Debug: Test Order Creation</p>
              <Button 
                onClick={testOrderCreation}
                variant="outline"
                size="sm"
                className="text-yellow-800 border-yellow-300"
              >
                Test Order API
              </Button>
            </div>
            </div>
          )}

          {/* Step 3: Order Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Order Confirmation</h3>
                <Button variant="ghost" onClick={() => setCurrentStep(2)}>
                  Back to Payment
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Review Your Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Address */}
                  <div>
                    <h4 className="font-medium mb-2">Delivery Address</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium">{selectedAddress.address}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">{selectedAddress.country}</p>
                      <p className="text-sm text-muted-foreground">Phone: {selectedAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium">
                        {selectedPayment === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                      </p>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  {selectedPayment === 'COD' ? (
                    <Button 
                      onClick={handlePlaceOrder} 
                      disabled={isLoading}
                      className="w-full h-12 text-lg"
                    >
                      {isLoading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  ) : paymentCompleted ? (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                      <p className="text-green-700 dark:text-green-300 font-medium">
                        ✅ Payment completed successfully!
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Your order will be processed automatically.
                      </p>
                    </div>
                  ) : selectedPayment === 'ONLINE' && !paymentCompleted ? (
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        For online payments, please complete the payment process in the previous step.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentStep(2)}
                        className="mt-2"
                      >
                        Back to Payment
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        Please select a payment method.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
            
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {(cartItems || []).map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.color?.name || item.color} • Size {item.size} • Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-sm">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>₹{calculateShipping()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>₹{calculateFinalTotal()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
