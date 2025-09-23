import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Cashfree SDK - we'll load it dynamically
let cashfree = null;

function CashfreeTest() {
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(100); // 1 rupee in paise
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeCashfreeSDK();
  }, []);

  const initializeCashfreeSDK = async () => {
    try {
      // Dynamically import Cashfree SDK
      const { load } = await import('@cashfreepayments/cashfree-js');
      cashfree = await load({
        mode: "sandbox",
      });
      console.log('Cashfree SDK initialized');
      toast.success('Cashfree SDK initialized successfully!');
    } catch (error) {
      console.error('Error initializing Cashfree SDK:', error);
      toast.error('Failed to initialize Cashfree SDK');
    }
  };

  const getSessionId = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/payments/simple-payment", {
        orderId: orderId || `test_${Date.now()}`,
        amount: amount
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data && res.data.data && res.data.data.payment_session_id) {
        console.log('Payment session created:', res.data.data);
        setOrderId(res.data.data.order_id);
        return res.data.data.payment_session_id;
      }
      throw new Error('No payment session ID received');
    } catch (error) {
      console.error('Error getting session ID:', error);
      toast.error('Failed to create payment session');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    try {
      const res = await axios.post("http://localhost:8000/api/payments/verify/cashfree", {
        orderId: orderId
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (res && res.data && res.data.success) {
        toast.success("Payment verified successfully!");
        return true;
      } else {
        toast.error("Payment verification failed");
        return false;
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
      return false;
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!cashfree) {
      toast.error('Cashfree SDK not initialized. Please try again.');
      return;
    }

    try {
      setLoading(true);
      
      // Get session ID
      const sessionId = await getSessionId();
      
      // Configure checkout options
      const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_modal",
      };

      // Open Cashfree checkout
      cashfree.checkout(checkoutOptions).then(async (res) => {
        console.log("Payment initialized:", res);
        
        // Verify payment after successful initialization
        await verifyPayment();
      }).catch((error) => {
        console.error('Cashfree checkout error:', error);
        toast.error('Payment failed. Please try again.');
      });

    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Cashfree Payment Gateway Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter order ID or leave empty for auto-generated"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (in paise)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter amount in paise"
              />
            </div>

            <Button 
              onClick={handlePayment} 
              disabled={loading || !cashfree}
              className="w-full"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </Button>

            {!cashfree && (
              <p className="text-sm text-muted-foreground text-center">
                Initializing Cashfree SDK...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CashfreeTest;
