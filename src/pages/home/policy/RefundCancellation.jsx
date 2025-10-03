import React from 'react'
import Footer from '../components/Footer'
import ViblyNavigation from '@/components/ui/vivly-navigation'

const RefundCancellation = () => {
  return (
    <div className="min-h-screen bg-background">
      <ViblyNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Refund & Cancellation Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
              <p className="mb-4">
                At Vibly.in, we strive to provide excellent quality products and customer service. This Refund & Cancellation Policy outlines our terms for order cancellations, returns, exchanges, and refunds. We encourage you to read this policy carefully to understand your rights and our procedures.
              </p>
              <p className="mb-4">
                This policy applies to all purchases made through our website and is designed to comply with applicable consumer protection laws in India.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Order Cancellation</h2>
              
              <h3 className="text-xl font-semibold mb-3">Pre-Delivery Cancellation:</h3>
              <p className="mb-4">
                You may cancel your order before it ships out:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Cancellation must be requested within 24 hours of order placement</li>
                <li>Requests made after shipment will be treated as returns</li>
                <li>No cancellation charges for pre-shipment cancellations</li>
                <li>Refund will be processed to original payment method within 3-5 business days</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Business-initiated Cancellations:</h3>
              <p className="mb-4">
                We reserve the right to cancel orders due to:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Product unavailability</li>
                <li>Pricing errors</li>
                <li>Suspected fraudulent transactions</li>
                <li>Address verification failures</li>
                <li>Payment processing issues</li>
              </ul>
              <p className="mb-4">
                In such cases, full refunds will be provided within 2-3 business days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Return Eligibility</h2>
              
              <h3 className="text-xl font-semibold mb-3">General Return Conditions:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Return requests must be made within 7 days of delivery</li>
                <li>Items must be in original condition with tags attached</li>
                <li>Products must not be used, washed, or damaged</li>
                <li>Original packaging must be intact</li>
                <li>Invoice and return slip must accompany the return</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Non-Returnable Items:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Underwear and intimate wear</li>
                <li>Items marked as "Final Sale"</li>
                <li>Used or damaged merchandise</li>
                <li>Items returned after the return period</li>
                <li>Customized or personalized items</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Return Process</h2>
              <h3 className="text-xl font-semibold mb-3">How to Initiate Returns:</h3>
              <ol className="list-decimal list-inside space-y-1 mb-4 ml-6">
                <li>Email us at mirajhasanmd6@gmail.com with your order number and reason for return</li>
                <li>Alternatively, log into your account and initiate return via order history</li>
                <li>Wait for our confirmation email with return instructions</li>
                <li>Package items securely with original packaging</li>
                <li>Send package to the provided address</li>
                <li>Track your return status online</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Refund Processing</h2>
              
              <h3 className="text-xl font-semibold mb-3">Refund Timeline:</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">1</div>
                  <div>
                    <p className="font-medium">Return Received</p>
                    <p className="text-sm text-muted-foreground">Processing begins</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-semibold">2</div>
                  <div>
                    <p className="font-medium">Quality Check</p>
                    <p className="text-sm text-muted-foreground">Items inspected (1-2 days)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-sm font-semibold">3</div>
                  <div>
                    <p className="font-medium">Refund Initiated</p>
                    <p className="text-sm text-muted-foreground">Money credited to account</p>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-3">Refund Methods and Timelines:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Credit/Debit Card:</strong> 5-7 business days</li>
                <li><strong>Net Banking:</strong> 3-5 business days</li>
                <li><strong>UPI/Wallet:</strong> 2-3 business days</li>
                <li><strong>Cash on Delivery:</strong> Bank transfer (5-7 business days)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Exchange Policy</h2>
              <p className="mb-4">
                We offer exchanges for the following reasons:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Size not suitable</li>
                <li>Color preference</li>
                <li>Defective products</li>
                <li>Wrong item received</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Exchange Process:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Request exchange within 7 days of delivery</li>
                <li>Return the original item with tags attached</li>
                <li>Select replacement item of equal or higher value</li>
                <li>Pay any price difference if applicable</li>
                <li>Receive replacement within 5-7 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Refund Amount</h2>
              <p className="mb-4">
                Refund amount depends on the reason for return:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Product Defect/Error:</strong> Full refund including shipping</li>
                <li><strong>Wrong Size/Color:</strong> Full product amount, shipping by customer</li>
                <li><strong>Change of Mind:</strong> Product amount minus shipping charges</li>
                <li><strong>Damaged in Transit:</strong> Full refund including shipping</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Shipping Charges</h2>
              <p className="mb-4">
                Shipping charge refund policies:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Free shipping orders: No shipping refund</li>
                <li>Paid shipping: Refunded for defective/wrong items</li>
                <li>Return shipping: Customer bears cost for change of mind</li>
                <li>Exchange orders: No additional shipping charge</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Quality Assurance</h2>
              <p className="mb-4">
                We maintain strict quality control measures:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>All returns undergo quality inspection</li>
                <li>Refunds approved only for eligible items</li>
                <li>Photos may be requested for damage claims</li>
                <li>External authentication may be required for high-value items</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Customer Rights</h2>
              <p className="mb-4">
                As a consumer, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Receive accurate product descriptions</li>
                <li>Return goods not conforming to order</li>
                <li>Receive timely repairs or replacements</li>
                <li>Claim compensation for damages</li>
                <li>File complaints with relevant authorities</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                To exercise these rights, please contact us at mirajhasanmd6@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Refund Reversal</h2>
              <p className="mb-4">
                We reserve the right to reverse refunds in cases of:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Returned items not meeting eligibility criteria</li>
                <li>Suspected fraudulent return activity</li>
                <li>Violation of return policy terms</li>
                <li>Used or damaged items being returned</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact for Returns & Refunds</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="mb-4">
                  For returns, refunds, and exchange requests:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> mirajhasanmd6@gmail.com</p>
                  <p><strong>Phone:</strong> +91-6287915088</p>
                  <p><strong>Website:</strong> https://vibly.in</p>
                  <p><strong>Business Hours:</strong> Monday to Friday (9 AM - 6 PM IST)</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg mt-4">
                  <p className="text-sm font-medium mb-2">📌 Quick Tips:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                    <li>Keep your order confirmation email for faster processing</li>
                    <li>Include return reason and preferred refund method in your email</li>
                    <li>Take photos of damaged items before packaging</li>
                    <li>Ensure items are packaged securely to prevent additional damage</li>
                  </ul>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>By purchasing from Vibly.in, you acknowledge that you have read and agree to this Refund & Cancellation Policy.</p>
            <p className="mt-2">This policy complies with Indian consumer protection laws and regulations.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default RefundCancellation