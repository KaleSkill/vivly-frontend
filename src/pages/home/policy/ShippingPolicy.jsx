import React from 'react'
import Footer from '../components/Footer'
import ViblyNavigation from '@/components/ui/vivly-navigation'

const ShippingPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <ViblyNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Shipping Overview</h2>
              <p className="mb-4">
                Vibly.in delivers premium clothing products across India through our trusted logistics partners. This Shipping Policy outlines our delivery procedures, timelines, shipping charges, and terms of service to ensure a smooth order fulfillment experience.
              </p>
              <p className="mb-4">
                We partner with leading courier services to ensure your orders are delivered safely and efficiently to your doorstep.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Delivery Partners</h2>
              <p className="mb-4">
                We collaborate with major shipping providers across India:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Blue Dart Express Limited</li>
                <li>DTDC Express Limited</li>
                <li>Delhivery Limited</li>
                <li>India Post (Speed Post)</li>
                <li>Local courier partners for remote areas</li>
              </ul>
              <p className="mb-4">
                The assignment of courier partners is subject to availability and delivery location. We reserve the right to change delivery partners without prior notice to ensure optimal service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Delivery Timelines</h2>
              
              <h3 className="text-xl font-semibold mb-3">Standard Delivery:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Metro Cities:</strong> 2-4 business days</li>
                <li><strong>Tier 1 Cities:</strong> 3-5 business days</li>
                <li><strong>Tier 2 Cities:</strong> 4-6 business days</li>
                <li><strong>Tier 3 Cities:</strong> 5-7 business days</li>
                <li><strong>Rural Areas:</strong> 7-10 business days</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Minimum Delivery Timeline:</h3>
              <p className="mb-4">
                As per Indian consumer protection guidelines, we guarantee minimum delivery within 7 days for metro cities and 10 days for other areas, unless external factors prevent delivery.
              </p>

              <h3 className="text-xl font-semibold mb-3">Maximum Delivery Timeline:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Metro Cities:</strong> 14 days maximum</li>
                <li><strong>Other Cities:</strong> 20 days maximum</li>
                <li><strong>Remote Areas:</strong> 30 days maximum</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Shipping Charges</h2>
              
              <h3 className="text-xl font-semibold mb-3">Standard Shipping Rates:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Orders below ₹999:</strong> ₹100 shipping charge</li>
                <li><strong>Orders above ₹999:</strong> FREE shipping</li>
                <li><strong>Express Delivery:</strong> ₹200 additional charge</li>
                <li><strong>International Orders:</strong> Not currently available</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Free Shipping Conditions:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Order value must be ₹999 or above</li>
                <li>Free shipping applies to standard delivery only</li>
                <li>Express delivery charges additional regardless of order value</li>
                <li>Cancelled orders may incur delivery charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Order Processing</h2>
              
              <h3 className="text-xl font-semibold mb-3">Processing Timeline:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Order Confirmation:</strong> Immediate (paid orders)</li>
                <li><strong>Inventory Check:</strong> 1-2 hours</li>
                <li><strong>Picking & Packing:</strong> 4-6 hours (business days)</li>
                <li><strong>Dispatch:</strong> Same day for orders placed before 2 PM</li>
                <li><strong>Tracking Update:</strong> Within 24 hours of dispatch</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Weekend and Holiday Processing:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Orders placed on weekends/holidays processed next business day</li>
                <li>Bank holidays may affect payment processing</li>
                <li>Festival periods may have extended processing times</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Order Verification</h2>
              <p className="mb-4">
                Prior to dispatch, orders undergo verification:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Payment confirmation</li>
                <li>Address validation</li>
                <li>Contact number verification (SMS/call)</li>
                <li>Emergency contact confirmation (for high-value orders)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Order Tracking</h2>
              <p className="mb-4">
                Track your order through multiple channels:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li><strong>Website:</strong> Order tracking portal at vibly.in/track-order</li>
                <li><strong>SMS Updates:</strong> Automated delivery notifications</li>
                <li><strong>Email:</strong> Dispatch and delivery confirmation emails</li>
                <li><strong>WhatsApp:</strong> Delivery status updates (metro cities)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Delivery Terms</h2>
              
              <h3 className="text-xl font-semibold mb-3">Delivery Attempts:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Maximum 3 delivery attempts per order</li>
                <li>Each attempt on consecutive business days</li>
                <li>Packages returned if all attempts unsuccessful</li>
                <li>Additional delivery fee may apply for re-delivery</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Delivery Requirements:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Valid government-issued ID required</li>
                <li>OTP verification for contactless delivery</li>
                <li>Authorization from registered contact</li>
                <li>Safe drop option for unattended premises</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Failed Deliveries</h2>
              
              <h3 className="text-xl font-semibold mb-3">Reasons for Failed Delivery:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Incorrect/Incomplete address</li>
                <li>Recipient unavailable</li>
                <li>Refusal to accept package</li>
                <li>Unsafe delivery location</li>
                <li>Identity verification failure</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Handle Failed Deliveries:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Contact courier partner for re-delivery</li>
                <li>Provide alternative delivery address</li>
                <li>Update contact information on website</li>
                <li>Arrange pickup from courier office</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Address Modifications</h2>
              <p className="mb-4">
                Address changes are permitted under certain conditions:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Request must be made before dispatch</li>
                <li>Modifications permitted once per order</li>
                <li>Additional charges may apply for address corrections</li>
                <li>Changes after dispatch not guaranteed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Delayed Deliveries</h2>
              
              <h3 className="text-xl font-semibold mb-3">Compensation for Delays:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Store credit equivalent to shipping charges</li>
                <li>Discount coupons for future purchases</li>
                <li>Priority processing for subsequent orders</li>
                <li>Escalation to senior management for extended delays</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Force Majeure Events:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Natural disasters affecting logistics</li>
                <li>Government-imposed restrictions</li>
                <li>Courier partner operational issues</li>
                <li>Pandemic-related restrictions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Shipping Support</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                    <p className="mb-4">
                      For shipping inquiries and support:
                    </p>
                    <div className="space-y-2">
                      <p><strong>Email:</strong> mirajhasanmd6@gmail.com</p>
                      <p><strong>Phone:</strong> +91-6287915088</p>
                      <p><strong>Track Your Order:</strong> https://vibly.in/track-order</p>
                      <p><strong>Business Hours:</strong> Monday to Friday (9 AM - 7 PM)</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg mt-4">
                      <p className="text-sm font-medium mb-2">📞 Quick Assistance:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                        <li>For order tracking issues, quote your order number</li>
                        <li>SMS support available for delivery queries</li>
                        <li>Emergency contact for high-priority orders</li>
                        <li>Live chat support during business hours</li>
                        <li>WhatsApp support for metro city deliveries</li>
                      </ul>
                    </div>
                  </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>By placing an order with Vibly.in, you acknowledge that you have read and agree to this Shipping Policy.</p>
            <p className="mt-2">Delivery timelines are indicative and may vary based on location and external factors beyond our control.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ShippingPolicy