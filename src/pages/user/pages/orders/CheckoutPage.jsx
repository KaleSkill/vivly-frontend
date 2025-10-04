import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/ui/stepper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  CreditCard, 
  MapPin, 
  Package, 
  ArrowLeft,
  Plus,
  CheckCircle,
  Truck,
  Shield
} from 'lucide-react';
import { userApi } from '@/api/api';
import { useCartStore } from '@/store/cartStore';

// Cashfree SDK - we'll load it dynamically
let cashfree = null;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, fetchCartItems } = useCartStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [newAddress, setNewAddress] = useState({
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
    fetchPaymentConfig();
    fetchCartItemsFromStore();
    initializeCashfreeSDK();
  }, []);

  // Calculate shipping charges based on payment method and order amount
  useEffect(() => {
    calculateShippingCharges();
  }, [paymentMethod, totalPrice]);

  const calculateShippingCharges = () => {
    if (paymentMethod === 'cod') {
      // COD: Always charge ₹50 shipping
      setShippingCharges(50);
    } else if (paymentMethod === 'razorpay' || paymentMethod === 'cashfree') {
      // Online payment: Free shipping above ₹599, ₹50 below ₹599
      if (totalPrice >= 599) {
        setShippingCharges(0);
      } else {
        setShippingCharges(50);
      }
    } else {
      // Default: No shipping charges
      setShippingCharges(0);
    }
  };

  const initializeCashfreeSDK = async () => {
    try {
      // Dynamically import Cashfree SDK
      const { load } = await import('@cashfreepayments/cashfree-js');
      cashfree = await load({
        mode: "sandbox",
      });
      console.log('Cashfree SDK initialized');
    } catch (error) {
      console.error('Error initializing Cashfree SDK:', error);
      // If SDK fails to load, we'll fall back to URL redirect method
      console.log('Falling back to URL redirect method for Cashfree');
    }
  };

  const fetchCartItemsFromStore = async () => {
    try {
      await fetchCartItems();
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchPaymentConfig = async () => {
    try {
      const response = await userApi.payments.getPaymentConfig();
      if (response.data.success) {
        setPaymentConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
    }
  };

  const isPaymentMethodEnabled = (method) => {
    if (!paymentConfig) return true; // Default to enabled if config not loaded
    
    switch (method) {
      case 'cod':
        return paymentConfig.codEnabled;
      case 'razorpay':
        return paymentConfig.onlinePaymentEnabled && 
               paymentConfig.providers?.find(p => p.name === 'razorpay')?.isEnabled;
      case 'cashfree':
        return paymentConfig.onlinePaymentEnabled && 
               paymentConfig.providers?.find(p => p.name === 'cashfree')?.isEnabled;
      default:
        return true;
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await userApi.addresses.getUserAddresses();
      if (response.data.success) {
        setAddresses(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedAddress(response.data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userApi.addresses.addAddress(newAddress);
      toast.success('Address added successfully!');
      setIsAddressDialogOpen(false);
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        addressType: 'home'
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    try {
      setLoading(true);
      
      // Find the selected address object
      const selectedAddressObj = addresses.find(addr => addr._id === selectedAddress);
      if (!selectedAddressObj) {
        toast.error('Selected address not found');
        return;
      }

      if (paymentMethod === 'cod') {
        // For COD, create order directly
        await handleCODOrder(selectedAddressObj);
      } else {
        // For online payments, create payment first, then order after success
        await handleOnlinePaymentFlow(selectedAddressObj);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleCODOrder = async (selectedAddressObj) => {
    console.log('=== FRONTEND COD ORDER CREATION DEBUG START ===');
    console.log('Creating COD order with:', {
      selectedAddressObj,
      items: items.map(item => ({
        productId: item.productId,
        colorId: item.colorId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    });
    
    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        colorId: item.colorId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      })),
      shippingInfo: {
        address: selectedAddressObj.address,
        city: selectedAddressObj.city,
        state: selectedAddressObj.state,
        country: selectedAddressObj.country,
        postalCode: selectedAddressObj.postalCode,
        phone: selectedAddressObj.phone
      },
      paymentMethod: 'COD',
      paymentProvider: null,
      transactionId: null,
      shippingCharges: shippingCharges,
      totalAmount: totalPrice + shippingCharges
    };

    console.log('COD Order data being sent:', JSON.stringify(orderData, null, 2));
    const orderResponse = await userApi.newOrders.createOrder(orderData);
    console.log('COD Order creation response:', orderResponse);
    
    if (orderResponse.data.success) {
      const orderId = orderResponse.data.orderId || orderResponse.data.order?._id;
      console.log('COD Order created successfully with ID:', orderId);
      console.log('=== FRONTEND COD ORDER CREATION DEBUG END (SUCCESS) ===');
      toast.success('Order placed successfully!');
      clearCart();
      navigate(`/payment/success?orderId=${orderId}`);
    } else {
      console.log('COD Order creation failed:', orderResponse.data);
      console.log('=== FRONTEND COD ORDER CREATION DEBUG END (FAILED) ===');
      toast.error('Failed to place order. Please try again.');
    }
  };

  const handleOnlinePaymentFlow = async (selectedAddressObj) => {
    // Generate a temporary order ID for payment
    const tempOrderId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      if (paymentMethod === 'razorpay') {
        // For Razorpay, use the existing payment order creation
        const paymentData = {
          orderId: tempOrderId,
          amount: (totalPrice + shippingCharges) * 100, // Convert to paise/cents
          provider: 'razorpay',
          customerName: selectedAddressObj.phone,
          customerEmail: 'customer@example.com',
          customerPhone: selectedAddressObj.phone
        };

        const paymentResponse = await userApi.payments.createPaymentOrder(paymentData);
        
        if (paymentResponse.data.success) {
          const { transactionId, paymentOrder, key_id } = paymentResponse.data.data;
          await openRazorpayPayment(paymentOrder, key_id, transactionId, tempOrderId);
        } else {
          throw new Error('Failed to create Razorpay payment order');
        }
      } else if (paymentMethod === 'cashfree') {
        // For Cashfree, use the simple payment approach
        const paymentResponse = await userApi.payments.createSimplePayment({
          orderId: tempOrderId,
          amount: (totalPrice + shippingCharges) * 100 // Convert to paise
        });

        if (!paymentResponse.data.success) {
          throw new Error('Failed to create payment session');
        }

        await openCashfreePayment(paymentResponse.data.data, null, tempOrderId, selectedAddressObj);
      }
    } catch (error) {
      console.error('Error in online payment flow:', error);
      throw error;
    }
  };

  const handleOnlinePayment = async (orderId, amount, provider, addressObj) => {
    try {
      // Create payment order with the payment gateway
      const paymentData = {
        orderId,
        amount: amount * 100, // Convert to paise/cents
        provider,
        customerName: addressObj.phone, // Using phone as identifier
        customerEmail: 'customer@example.com', // You might want to get this from user profile
        customerPhone: addressObj.phone
      };

      const paymentResponse = await userApi.payments.createPaymentOrder(paymentData);
      
      if (paymentResponse.data.success) {
        const { transactionId, paymentOrder, key_id } = paymentResponse.data.data;
        
        if (provider === 'razorpay') {
          await openRazorpayPayment(paymentOrder, key_id, transactionId, orderId);
        } else if (provider === 'cashfree') {
          await openCashfreePayment(paymentOrder, transactionId, orderId);
        }
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const openRazorpayPayment = async (paymentOrder, keyId, transactionId, tempOrderId) => {
    const options = {
      key: keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      name: "Your Store",
      description: `Order #${tempOrderId}`,
      order_id: paymentOrder.id,
      handler: async function (response) {
        try {
          // Verify payment
          const verifyData = {
            transactionId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          };

          const verifyResponse = await userApi.payments.verifyRazorpayPayment(verifyData);
          
          if (verifyResponse.data.success) {
            // Payment successful, now create the actual order
            const selectedAddressObj = addresses.find(addr => addr._id === selectedAddress);
            await createOrderAfterPayment(selectedAddressObj, transactionId);
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
        }
      },
      prefill: {
        name: "Customer",
        email: "customer@example.com",
        contact: addresses.find(addr => addr._id === selectedAddress)?.phone || ""
      },
      theme: {
        color: "#3399cc"
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const openCashfreePayment = async (paymentOrder, transactionId, tempOrderId, selectedAddressObj) => {
    try {
      const verifyPayment = async () => {
        try {
          const res = await userApi.payments.verifyCashfreePayment({
            orderId: tempOrderId
          });

          if (res && res.data && res.data.success) {
            // Payment successful, now create the actual order
            await createOrderAfterPayment(selectedAddressObj, res.data.data.transactionId);
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
        }
      };

      if (cashfree) {
        // Use SDK if available
        const checkoutOptions = {
          paymentSessionId: paymentOrder.payment_session_id,
          redirectTarget: "_modal",
        };

        cashfree.checkout(checkoutOptions).then(async (res) => {
          console.log("Payment initialized:", res);
          
          // Verify payment after successful initialization
          await verifyPayment();
        }).catch((error) => {
          console.error('Cashfree checkout error:', error);
          toast.error('Payment failed. Please try again.');
        });
      } else {
        // Fallback to URL redirect method
        console.log('Using URL redirect method for Cashfree');
        const paymentUrl = `https://payments.cashfree.com/forms/${paymentOrder.payment_session_id}`;
        
        // Open in new window/tab
        const paymentWindow = window.open(paymentUrl, '_blank', 'width=800,height=600');
        
        if (!paymentWindow) {
          toast.error('Please allow popups for payment');
          return;
        }
        
        // Poll for payment completion
        const pollPayment = setInterval(async () => {
          try {
            if (paymentWindow.closed) {
              clearInterval(pollPayment);
              // Check payment status
              await verifyPayment();
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            clearInterval(pollPayment);
          }
        }, 2000);
      }

    } catch (error) {
      console.error('Error opening Cashfree payment:', error);
      toast.error('Failed to initialize payment. Please try again.');
    }
  };

  const createOrderAfterPayment = async (selectedAddressObj, transactionId) => {
    console.log('=== FRONTEND ORDER CREATION DEBUG START ===');
    console.log('Creating order after payment with:', {
      selectedAddressObj,
      transactionId,
      paymentMethod,
      items: items.map(item => ({
        productId: item.productId,
        colorId: item.colorId,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))
    });
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId,
          colorId: item.colorId,
          size: item.size,
          quantity: item.quantity,
          price: item.price
        })),
        shippingInfo: {
          address: selectedAddressObj.address,
          city: selectedAddressObj.city,
          state: selectedAddressObj.state,
          country: selectedAddressObj.country,
          postalCode: selectedAddressObj.postalCode,
          phone: selectedAddressObj.phone
        },
        paymentMethod: 'ONLINE',
        paymentProvider: paymentMethod,
        transactionId: transactionId,
        shippingCharges: shippingCharges,
        totalAmount: totalPrice + shippingCharges
      };

      console.log('Order data being sent:', JSON.stringify(orderData, null, 2));
      const orderResponse = await userApi.newOrders.createOrder(orderData);
      console.log('Order creation response:', orderResponse);
      
      if (orderResponse.data.success) {
        const orderId = orderResponse.data.orderId || orderResponse.data.order?._id;
        console.log('Order created successfully with ID:', orderId);
        console.log('=== FRONTEND ORDER CREATION DEBUG END (SUCCESS) ===');
        toast.success('Payment successful! Order placed successfully!');
        clearCart();
        navigate(`/payment/success?orderId=${orderId}`);
      } else {
        console.log('Order creation failed:', orderResponse.data);
        console.log('=== FRONTEND ORDER CREATION DEBUG END (FAILED) ===');
        toast.error('Payment successful but failed to create order. Please contact support.');
      }
    } catch (error) {
      console.log('=== FRONTEND ORDER CREATION DEBUG END (ERROR) ===');
      console.error('Error creating order after payment:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Payment successful but failed to create order. Please contact support.');
    }
  };

  const steps = [
    { id: 1, title: 'Address', description: 'Shipping address' },
    { id: 2, title: 'Payment', description: 'Payment method' },
    { id: 3, title: 'Review', description: 'Order review' }
  ];

  const selectedAddressData = addresses.find(addr => addr._id === selectedAddress);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to proceed with checkout</p>
          <Button onClick={() => navigate('/products')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Cart Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/user/cart')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Checkout</h1>
          <p className="text-xl text-muted-foreground">Complete your order</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address Selection */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addresses.length === 0 ? (
                    <div className="text-center py-8">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No addresses found</h3>
                      <p className="text-muted-foreground mb-4">Add a shipping address to continue</p>
                      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Address
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Add New Address</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleAddAddress} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="phone">Phone *</Label>
                                <Input
                                  id="phone"
                                  name="phone"
                                  value={newAddress.phone}
                                  onChange={handleAddressInputChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="address">Address *</Label>
                                <Input
                                  id="address"
                                  name="address"
                                  value={newAddress.address}
                                  onChange={handleAddressInputChange}
                                  placeholder="House number, street name, apartment, etc."
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="city">City *</Label>
                                <Input
                                  id="city"
                                  name="city"
                                  value={newAddress.city}
                                  onChange={handleAddressInputChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="state">State *</Label>
                                <Input
                                  id="state"
                                  name="state"
                                  value={newAddress.state}
                                  onChange={handleAddressInputChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code *</Label>
                                <Input
                                  id="postalCode"
                                  name="postalCode"
                                  value={newAddress.postalCode}
                                  onChange={handleAddressInputChange}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="country">Country *</Label>
                                <Input
                                  id="country"
                                  name="country"
                                  value={newAddress.country}
                                  onChange={handleAddressInputChange}
                                  required
                                />
                              </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <Button type="submit" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Address'}
                              </Button>
                              <Button type="button" variant="outline" onClick={() => setIsAddressDialogOpen(false)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                      {addresses.map((address) => (
                        <div key={address._id} className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value={address._id} id={address._id} />
                          <Label htmlFor={address._id} className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2">
                                {address.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                              </div>
                              <div className="text-sm text-muted-foreground">{address.phone}</div>
                              <div className="text-sm text-muted-foreground">{address.address}</div>
                              <div className="text-sm text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </div>
                              <div className="text-sm text-muted-foreground">{address.country}</div>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setCurrentStep(2)} disabled={!selectedAddress}>
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {isPaymentMethodEnabled('razorpay') && (
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="razorpay" id="razorpay" />
                          <Label htmlFor="razorpay" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="font-medium">Credit/Debit Card</div>
                              <div className="text-sm text-muted-foreground">Pay securely with Razorpay</div>
                            </div>
                          </Label>
                        </div>
                      )}
                      {isPaymentMethodEnabled('cashfree') && (
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="cashfree" id="cashfree" />
                          <Label htmlFor="cashfree" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="font-medium">UPI/Wallet</div>
                              <div className="text-sm text-muted-foreground">Pay with UPI or digital wallet</div>
                            </div>
                          </Label>
                        </div>
                      )}
                      {isPaymentMethodEnabled('cod') && (
                        <div className="flex items-start space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="cod" id="cod" />
                          <Label htmlFor="cod" className="flex-1 cursor-pointer">
                            <div className="space-y-1">
                              <div className="font-medium">Cash on Delivery</div>
                              <div className="text-sm text-muted-foreground">Pay when your order arrives</div>
                            </div>
                          </Label>
                        </div>
                      )}
                      {!isPaymentMethodEnabled('razorpay') && !isPaymentMethodEnabled('cashfree') && !isPaymentMethodEnabled('cod') && (
                        <div className="text-center py-8">
                          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="font-medium mb-2">No payment methods available</h3>
                          <p className="text-muted-foreground">Please contact support for assistance</p>
                        </div>
                      )}
                    </div>
                  </RadioGroup>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      Back to Address
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} disabled={!paymentMethod}>
                      Review Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Order Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Address */}
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    {selectedAddressData && (
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="font-medium">{selectedAddressData.fullName}</div>
                        <div className="text-sm text-muted-foreground">{selectedAddressData.phone}</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedAddressData.addressLine1}
                          {selectedAddressData.addressLine2 && `, ${selectedAddressData.addressLine2}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {selectedAddressData.city}, {selectedAddressData.state} {selectedAddressData.pincode}
                        </div>
                        <div className="text-sm text-muted-foreground">{selectedAddressData.country}</div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="font-medium capitalize">{paymentMethod}</div>
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <Label htmlFor="notes">Order Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Any special instructions for your order..."
                      className="mt-2"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(2)}>
                      Back to Payment
                    </Button>
                    <Button onClick={handlePlaceOrder} disabled={loading} className="gap-2">
                      <Shield className="h-4 w-4" />
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.colorId}-${item.size}`} className="flex gap-3">
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.colorName} • Size {item.size}
                        </div>
                        <div className="text-xs text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span className={shippingCharges === 0 ? "text-green-600" : ""}>
                      {shippingCharges === 0 ? "Free" : `₹${shippingCharges}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{(totalPrice + shippingCharges).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
