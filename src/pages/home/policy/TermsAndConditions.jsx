import React from 'react'
import Footer from '../components/Footer'
import ViblyNavigation from '@/components/ui/vivly-navigation'

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <ViblyNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using Vibly.in (the "Website"), you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions ("Terms") govern your use of our website and services provided by Vibly Retail Private Limited ("Company", "we", "us", or "our").
              </p>
              <p className="mb-4">
                If you do not agree to abide by the above, please do not use this service. Your continued use of the website constitutes your acceptance of these terms and any modifications we may make to them.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
              <p className="mb-4">
                Vibly.in is an e-commerce platform providing:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Online retail of clothing and related products</li>
                <li>Customer account management</li>
                <li>Order processing and fulfillment</li>
                <li>Shopping cart functionality</li>
                <li>Product search and filter capabilities</li>
                <li>Secure payment processing through Razorpay</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-xl font-semibold mb-3">Account Creation:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One account per person - duplicate accounts are prohibited</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Account Security:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>We reserve the right to suspend or terminate accounts violating these terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Product Information and Pricing</h2>
              <p className="mb-4">
                We strive to provide accurate product information, but we cannot guarantee:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Complete accuracy of product descriptions, colors, sizes, or prices</li>
                <li>Availability of all advertised products</li>
                <li>Manufacturer warranty status</li>
              </ul>
              <p className="mb-4">
                Pricing is subject to change without notice. All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise specified.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Orders, Payment, and Processing</h2>
              <h3 className="text-xl font-semibold mb-3">Order Process:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>All orders are subject to product availability</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Order confirmation will be sent to your registered email address</li>
                <li>Estimated delivery times are provided as guidance only</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Payment Terms:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Payment is processed securely through Razorpay payment gateway</li>
                <li>Accepted payment methods: Credit/Debit cards, Net Banking, UPI, Wallets</li>
                <li>Payment must be completed before order processing begins</li>
                <li>Failed payments will result in order cancellation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Returns and Refunds</h2>
              <p className="mb-4">
                Please refer to our separate Refund & Cancellation Policy for detailed information about returns, exchanges, and refunds. Key points include:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Return requests must be initiated within applicable return periods</li>
                <li>Items must be in original condition with tags attached</li>
                <li>Specific return policies may apply to different product categories</li>
                <li>Refund processing time varies by payment method</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Prohibited Uses</h2>
              <p className="mb-4">
                You may not use our services for:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Any unlawful purpose or to violate any laws</li>
                <li>Transmitting harmful or malicious software</li>
                <li>Attempting unauthorized access to systems or data</li>
                <li>Engaging in fraudulent activities</li>
                <li>Harassment or threatening behavior</li>
                <li>Infringing on intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property Rights</h2>
              <p className="mb-4">
                All content on Vibly.in, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Text, images, graphics, logos, and designs</li>
                <li>Software, code, and technical specifications</li>
                <li>Trademarks, service marks, and trade names</li>
                <li>Are protected by intellectual property laws and are owned by Vibly or our licensors</li>
              </ul>
              <p className="mb-4">
                You may not copy, modify, distribute, or use any content without our explicit written permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our separate Privacy Policy to understand:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>What information we collect</li>
                <li>How we use and protect your data</li>
                <li>Your rights regarding your personal information</li>
                <li>Our data sharing practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Service Availability and Modifications</h2>
              <p className="mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Modify or discontinue the service at any time</li>
                <li>Perform maintenance that may temporarily affect service availability</li>
                <li>Update features and functionality</li>
                <li>Restrict access to certain areas or features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Limitations of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>We shall not be liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability shall not exceed the amount paid for the specific service or product</li>
                <li>We disclaim warranties except as explicitly stated</li>
                <li>You assume all risks associated with online commerce</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify and hold harmless Vibly Retail Private Limited, its officers, directors, employees, and agents from any claims, damages, or expenses arising from:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Your use of our services</li>
                <li>Violation of these terms by you</li>
                <li>Infringement of any third-party rights by you</li>
                <li>Your failure to comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Dispute Resolution</h2>
              <p className="mb-4">
                These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India. Before pursuing legal action, we encourage resolution through:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Direct communication with our customer service</li>
                <li>Alternative dispute resolution methods</li>
                <li>Mediation or arbitration if mutually agreed</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">14. Modifications to Terms</h2>
              <p className="mb-4">
                We may modify these Terms at any time. Notice of significant changes will be provided by:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Email notification to registered users</li>
                <li>Prominent notice on our website</li>
                <li>Updates to the "Last Updated" date</li>
              </ul>
              <p className="mb-4">
                Continued use after modifications constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">15. Severability</h2>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, the remaining provisions will continue to be valid and enforceable to the fullest extent permitted by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="mb-4">
                  For any questions about these Terms & Conditions, please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> mirajhasanmd6@gmail.com</p>
                  <p><strong>Phone:</strong> +91-6287915088</p>
                  <p><strong>Website:</strong> https://vibly.in</p>
                  <p><strong>Business Name:</strong> Vibly Retail Private Limited</p>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Note */}
          <div className="text-center text-sm text-muted-foreground pt-8 border-t">
            <p>By using Vibly.in, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default TermsAndConditions