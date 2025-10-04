import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Shield, Clock } from 'lucide-react';
import { userApi } from '@/api/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authstore';
import { load } from '@cashfreepayments/cashfree-js';

export const PaymentSelector = ({ onSelectPayment, selectedPayment, onPlaceOrder, isLoading, orderTotal }) => {
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const { authUser } = useAuthStore();

  console.log('PaymentSelector: selectedPayment prop:', selectedPayment, typeof selectedPayment);

  useEffect(() => {
    fetchPaymentConfig();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const response = await userApi.payments.getPaymentConfig();
      if (response.data.success) {
        console.log('Payment config loaded:', response.data.data);
        setPaymentConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Create payment methods array with COD and Online options
  const paymentMethods = [
    {
      id: 'COD',
      title: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: Banknote,
      available: paymentConfig?.codEnabled || false
    },
    {
      id: 'ONLINE',
      title: 'Online Payment',
      description: 'Pay securely with your card or wallet',
      icon: CreditCard,
      available: paymentConfig?.onlinePaymentEnabled || false,
      providers: paymentConfig?.providers?.filter(p => p.isEnabled) || []
    }
  ];

  console.log('Payment methods:', paymentMethods);
  console.log('Online providers:', paymentMethods[1]?.providers);

  // Debug: Show payment config status
  console.log('Payment config status:', {
    codEnabled: paymentConfig?.codEnabled,
    onlinePaymentEnabled: paymentConfig?.onlinePaymentEnabled,
    providers: paymentConfig?.providers,
    enabledProviders: paymentConfig?.providers?.filter(p => p.isEnabled)
  });

  const handlePaymentSelect = (paymentId) => {
    console.log('PaymentSelector: handlePaymentSelect called with:', paymentId, typeof paymentId);
    console.log('PaymentSelector: paymentId value:', paymentId);
    console.log('PaymentSelector: paymentId stringified:', JSON.stringify(paymentId));
    onSelectPayment(paymentId);
  };

  const handleOnlinePayment = async (provider) => {
    try {
      if (!orderTotal || orderTotal <= 0) {
        toast.error('Invalid order amount');
        return;
      }

      // Create payment order
      // Get customer data from authStore and address from localStorage
      const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');
      
      // Generate a proper order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Get customer data
      const customerName = authUser?.firstname || 'Customer';
      const customerEmail = authUser?.email || 'customer@example.com';
      const customerPhone = selectedAddress?.phone || '1234567890';
      
      console.log('Creating payment order with data:', {
        orderId,
        amount: orderTotal,
        provider,
        customerName,
        customerEmail,
        customerPhone
      });
      
      const response = await userApi.payments.createPaymentOrder({
        orderId: orderId,
        amount: orderTotal,
        provider: provider,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone
      });
      
      console.log('Payment order creation response:', response);

      if (response.data.success) {
        const { transactionId, providerOrderId, paymentOrder, key_id } = response.data.data;
        console.log('Payment order created successfully:', { transactionId, providerOrderId, paymentOrder, key_id });
        
        // Store transaction ID in localStorage for payment success page
        localStorage.setItem('pendingPayment', JSON.stringify({
          transactionId,
          provider,
          providerOrderId,
          orderTotal
        }));
        
        if (provider === 'razorpay') {
          console.log('Initializing Razorpay with:', { paymentOrder, providerOrderId });
          
          // Check if Razorpay SDK is loaded
          if (!window.Razorpay) {
            console.error('Razorpay SDK not loaded');
            toast.error('Payment gateway not available. Please refresh the page.');
            return;
          }
          
          // Initialize Razorpay
          const options = {
            key: key_id, // Use key_id from response
            amount: paymentOrder.amount,
            currency: paymentOrder.currency,
            name: "vibly.in",
            description: "Payment for your order",
            order_id: providerOrderId,
            image: "https://res.cloudinary.com/dnfknlwos/image/upload/v1759602472/vibly1_fhaeud.png",
            theme: {
              color: "#002C0F"
            },
            handler: async function (response) {
              try {
                // Verify payment
                const verifyResponse = await userApi.payments.verifyRazorpayPayment({
                  transactionId,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                });

                if (verifyResponse.data.success) {
                  toast.success('Payment successful!');
                  // Trigger order creation with clean parameters
                  setTimeout(() => {
                    try {
                      console.log('Calling onPlaceOrder with:', { paymentMethod: 'ONLINE', provider, transactionId });
                      onPlaceOrder('ONLINE', provider, transactionId);
                      // Clear cart and redirect to home page after successful payment
                      setTimeout(() => {
                        clearCart();
                        navigate('/');
                      }, 2000);
                    } catch (error) {
                      console.error('Error calling onPlaceOrder:', error);
                      toast.error('Failed to process order');
                    }
                  }, 100);
                } else {
                  toast.error('Payment verification failed');
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                toast.error('Payment verification failed');
              }
            },
            prefill: {
              name: "Customer Name",
              email: "customer@example.com",
              contact: "1234567890"
            },
            theme: {
              color: "#000000"
            }
          };

          const razorpay = new window.Razorpay(options);
          console.log('Opening Razorpay payment screen...');
          razorpay.open();
        } else if (provider === 'cashfree') {
          console.log('Initializing Cashfree with:', { paymentOrder, providerOrderId });
          console.log('Cashfree payment order data:', paymentOrder);
          
          // Check if payment_session_id exists
          if (!paymentOrder.payment_session_id) {
            console.error('Cashfree payment_session_id is missing:', paymentOrder);
            toast.error('Cashfree payment session ID is missing');
            return;
          }
          
          // Initialize Cashfree using official package
          console.log('🚀 Initializing Cashfree with official package...');
          
          try {
            const cashfree = await load({
              mode: "sandbox" // Change to "production" for live
            });
            
            console.log('✅ Cashfree instance created:', cashfree);
            console.log('Opening Cashfree payment screen...');
            console.log('Using payment session ID:', paymentOrder.payment_session_id);
            
            console.log('🚀 CALLING CASHFREE CHECKOUT...');
            console.log('Calling Cashfree checkout with:', {
              paymentSessionId: paymentOrder.payment_session_id,
              returnUrl: `${window.location.origin}/payment/success`
            });
            
            const checkoutOptions = {
              paymentSessionId: paymentOrder.payment_session_id,
              redirectTarget: "_modal"
            };
            
            console.log('🚀 CALLING CASHFREE CHECKOUT with options:', checkoutOptions);
            
            const checkoutResult = await cashfree.checkout(checkoutOptions);
            
            console.log('✅ Cashfree checkout initialized successfully:', checkoutResult);
            
            // After checkout success, verify payment
            if (checkoutResult) {
              console.log('🎉 CASHFREE PAYMENT INITIALIZED SUCCESSFULLY!');
              
              // Store payment data for verification
              const paymentData = {
                orderId: response.data.orderId || paymentOrder.order_id,
                providerOrderId: response.data.providerOrderId || paymentOrder.order_id,
                paymentSessionId: paymentOrder.payment_session_id,
                provider: provider,
                orderTotal: orderTotal
              };
              
              console.log('💾 Storing Cashfree payment data:', paymentData);
              localStorage.setItem('pendingCashfreePayment', JSON.stringify(paymentData));
              
              // Also store the selected address if it exists in localStorage
              const selectedAddress = localStorage.getItem('selectedAddress');
              if (selectedAddress) {
                console.log('✅ Address already stored in localStorage');
              } else {
                console.log('⚠️ No address found in localStorage - this might cause order creation to fail');
              }
              
              // Redirect to payment success page for verification
              navigate('/payment/success?provider=cashfree&status=pending');
            }
          
            console.log('Cashfree checkout result:', checkoutResult);
          } catch (error) {
            console.error('Cashfree initialization or checkout error:', error);
            toast.error('Failed to initialize or open Cashfree payment screen: ' + error.message);
          }
        }
      } else {
        console.error('Payment order creation failed:', response.data);
        toast.error('Failed to create payment order: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Failed to initiate payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePlaceOrder = () => {
    if (selectedPayment) {
      if (selectedPayment === 'ONLINE') {
        // Show provider selection for online payment
        return;
      }
      onPlaceOrder(selectedPayment);
    }
  };

  if (loadingConfig) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-muted-foreground">Select your preferred payment method</p>
      </div>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div 
              key={method.id} 
              className={`cursor-pointer transition-all p-4 rounded-lg ${
                selectedPayment === method.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'
              } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (method.available) {
                  console.log('Method clicked:', method.id);
                  handlePaymentSelect(method.id);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 ${
                  selectedPayment === method.id ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {selectedPayment === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <Icon className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">{method.title}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                  {method.id === 'COD' && (
                    <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      Available
                    </div>
                  )}
                  {method.id === 'ONLINE' && (
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      method.available 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {method.available ? 'Available' : 'Coming Soon'}
                    </div>
                  )}
                </div>

                {/* Show provider options for online payment */}
                {method.id === 'ONLINE' && method.available && selectedPayment === 'ONLINE' && (
                  <div className="mt-4 ml-8 space-y-3">
                    <h5 className="text-sm font-medium text-foreground">Choose Payment Provider:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {method.providers.map((provider) => (
                        <Button
                          key={provider.name}
                          variant="outline"
                          className="flex items-center space-x-2 p-3 h-auto cursor-pointer hover:bg-primary/10 transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Provider button clicked:', provider.name);
                            handleOnlinePayment(provider.name);
                          }}
                        >
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">{provider.name}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      {selectedPayment && (
        <div className="pt-6">
          <div className="bg-muted/30 rounded-lg p-4 mb-4">
            <div className="text-sm text-muted-foreground">
              <p>Payment: {paymentMethods.find(m => m.id === selectedPayment)?.title}</p>
              <p>You'll receive a confirmation email after placing your order.</p>
            </div>
          </div>
          
          {selectedPayment === 'COD' && (
            <Button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('COD button clicked');
                onPlaceOrder('COD', null, null);
              }} 
              disabled={isLoading}
              className="w-full h-11"
            >
              {isLoading ? 'Placing Order...' : 'Place Order'}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
