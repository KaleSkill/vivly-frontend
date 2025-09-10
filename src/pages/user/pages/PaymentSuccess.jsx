import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { userApi } from '@/api/api';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [status, setStatus] = useState('processing');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Get payment parameters from URL
        const orderId = searchParams.get('order_id');
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const provider = searchParams.get('provider') || 'cashfree';

        // Get stored payment data
        const pendingPayment = localStorage.getItem('pendingPayment');
        const pendingCashfreePayment = localStorage.getItem('pendingCashfreePayment');
        let paymentData = null;
        
        if (pendingPayment) {
          try {
            paymentData = JSON.parse(pendingPayment);
            console.log('Stored payment data:', paymentData);
          } catch (error) {
            console.error('Error parsing pending payment data:', error);
          }
        } else if (pendingCashfreePayment) {
          try {
            paymentData = JSON.parse(pendingCashfreePayment);
            console.log('Stored Cashfree payment data:', paymentData);
          } catch (error) {
            console.error('Error parsing pending Cashfree payment data:', error);
          }
        }

        console.log('Payment success page - URL params:', {
          orderId,
          paymentId,
          status,
          provider,
          paymentData
        });

        // Debug: Check if paymentData has the required orderId or providerOrderId
        if (paymentData && !paymentData.orderId && !paymentData.providerOrderId) {
          console.error('❌ Payment data missing orderId and providerOrderId:', paymentData);
          setStatus('failed');
          toast.error('Payment data is incomplete');
          setIsProcessing(false);
          return;
        }

        // Use orderId if available, otherwise use providerOrderId
        const orderIdToUse = paymentData?.orderId || paymentData?.providerOrderId;
        console.log('Using order ID for verification:', orderIdToUse);

        if ((status === 'SUCCESS' && orderId && paymentId && paymentData) || 
            (provider === 'cashfree' && paymentData)) {
          
          // For Cashfree, verify payment using the order ID from stored data
          let verifyResponse;
          
          if (provider === 'cashfree') {
            console.log('Verifying Cashfree payment with order ID:', orderIdToUse);
            console.log('Sending verification data:', { orderId: orderIdToUse });
            verifyResponse = await userApi.payments.verifyCashfreePayment({
              orderId: orderIdToUse
            });
          } else {
            // For other providers (Razorpay)
            verifyResponse = await userApi.payments.verifyCashfreePayment({
              transactionId: paymentData.transactionId,
              order_id: orderId,
              payment_id: paymentId
            });
          }

          console.log('Payment verification response:', verifyResponse);

          if (verifyResponse.data.success) {
            setStatus('success');
            toast.success('Payment successful!');
            
            // Create order
            try {
              // Get cart items from Zustand store (persisted in localStorage)
              const cartStorage = JSON.parse(localStorage.getItem('cart-storage') || '{}');
              const cartItems = cartStorage.state?.items || [];
              const selectedAddress = JSON.parse(localStorage.getItem('selectedAddress') || '{}');
              
              console.log('Raw cart storage:', cartStorage);
              console.log('Cart items for order creation:', cartItems);
              console.log('Selected address for order creation:', selectedAddress);
              
              if (cartItems.length > 0 && selectedAddress.address) {
                const orderData = {
                  items: cartItems.map(item => ({
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
                  paymentMethod: 'ONLINE',
                  paymentProvider: provider,
                  transactionId: verifyResponse.data.data.transactionId || verifyResponse.data.transactionId || paymentId || paymentData.paymentSessionId
                };

                console.log('Creating order with data:', orderData);
                console.log('Transaction ID being used:', orderData.transactionId);
                console.log('Verification response data:', verifyResponse.data);
                const orderResponse = await userApi.newOrders.createOrder(orderData);
                
                if (orderResponse.data.success) {
                  console.log('Order created successfully:', orderResponse.data);
                  toast.success('Order placed successfully!');
                } else {
                  console.error('Order creation failed:', orderResponse.data);
                  toast.error('Payment successful but order creation failed');
                }
              } else {
                console.error('Missing cart items or address for order creation');
                console.error('Cart items length:', cartItems.length);
                console.error('Address exists:', !!selectedAddress.address);
                console.error('Address data:', selectedAddress);
                toast.error('Payment successful but order creation failed - missing data');
              }
            } catch (orderError) {
              console.error('Order creation error:', orderError);
              toast.error('Payment successful but order creation failed');
            }
            
            // Clear cart and stored data
            clearCart();
            localStorage.removeItem('pendingPayment');
            localStorage.removeItem('pendingCashfreePayment');
            localStorage.removeItem('selectedAddress');
            
            // Redirect to home after 3 seconds
            setTimeout(() => {
              navigate('/');
            }, 3000);
          } else {
            setStatus('failed');
            toast.error('Payment verification failed');
          }
        } else {
          setStatus('failed');
          toast.error('Payment failed or incomplete');
        }
      } catch (error) {
        console.error('Payment processing error:', error);
        setStatus('failed');
        toast.error('Payment processing failed');
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [searchParams, navigate, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card rounded-lg shadow-lg p-8 text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Processing Payment...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we verify your payment.
              </p>
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-4">
                Your order has been placed successfully.
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to home page...
              </p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-500 text-2xl">✕</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Payment Failed
              </h2>
              <p className="text-muted-foreground mb-4">
                There was an issue processing your payment.
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
