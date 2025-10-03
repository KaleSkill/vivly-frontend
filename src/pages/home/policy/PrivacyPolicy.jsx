import React from 'react'
import Footer from '../components/Footer'
import ViblyNavigation from '@/components/ui/vivly-navigation'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <ViblyNavigation />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction to Privacy Policy</h2>
              <p className="mb-4">
                This Privacy Policy applies to your use of the Vibly.in website and mobile applications (collectively, the "Platform" or "Website"). The terms "we," "our," and "us" refer to Vibly Retail Private Limited, and the terms "you," "your," and "User" refer to you as a user of Vibly. The term "Personal Information" means information that you provide to us that personally identifies you, such as your name, phone number, email address, and any other data linked to such information.
              </p>
              <p className="mb-4">
                Our practices and procedures regarding the collection and use of Personal Information are outlined below to ensure the safe use of the Website. We have implemented reasonable security practices and procedures appropriate to the nature of the information and our business. While we strive to provide security that exceeds industry standards, due to the inherent vulnerabilities of the internet, we cannot guarantee complete security of all information transmitted to us by you.
              </p>
              <p className="mb-4">
                By visiting or using the Website, you agree to be bound by this Privacy Policy and consent to the collection, use, processing, and sharing of your Personal Information as described below. If you do not agree with these terms, please do not use the Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Information we collect and how we use it</h2>
              <p className="mb-4">
                We collect and store your Personal Information. The Personal Information we collect will be used solely to enable you to use the services provided by us, promote a safe and secure experience, assess user interest in our products and services, inform you about online offers and updates, troubleshoot issues, customize your experience, detect and prevent errors, fraud, and other criminal activity, process payments through Razorpay, enforce our terms and conditions, and fulfill any other purpose disclosed to you at the time of collection.
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Name, email address (mirajhasanmd6@gmail.com), phone number (6287915088)</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely by Razorpay)</li>
                <li>Account credentials and preferences</li>
                <li>Government identification documents for verification</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Website Usage Information:</h3>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Pages visited and time spent on our site</li>
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Cookies and tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Payment Information Security</h2>
              <p className="mb-4">
                We securely handle payment information through Razorpay, our PCI DSS compliant payment processor. We do not store or process credit card details on our servers. All payment data is encrypted and processed securely by Razorpay. Your financial information is protected by Razorpay's security standards and we only store necessary transaction identifiers for order processing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>With payment processors like Razorpay for transaction processing</li>
                <li>With shipping carriers for order delivery</li>
                <li>With trusted service providers who assist in our operations</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with business transfers or mergers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>SSL encryption for data transmission</li>
                <li>Secure server infrastructure and access controls</li>
                <li>Regular security audits and updates</li>
                <li>Employee training on data protection practices</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar technologies to enhance your experience. These include:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Essential cookies for account authentication and shopping cart functionality</li>
                <li>Analytics cookies for website usage analytics and performance optimization</li>
                <li>You can disable cookies through your browser settings, though some features may not work properly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Your Rights and Choices</h2>
              <p className="mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Access to your personal information</li>
                <li>Correction of inaccurate information</li>
                <li>Deletion of your account and data</li>
                <li>Opt-out of marketing communications</li>
                <li>Data portability</li>
                <li>Withdrawal of consent</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                To exercise these rights, please contact us at mirajhasanmd6@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to fulfill the purposes outline in this policy:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Account information until account deletion</li>
                <li>Order records for legal and accounting purposes</li>
                <li>Marketing data until consent is withdrawn</li>
                <li>Analytics data in aggregated form</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Third-Party Services</h2>
              <p className="mb-4">
                We may use third-party services that have their own privacy policies:
              </p>
              <ul className="list-disc list-inside space-y-1 mb-4 ml-6">
                <li>Razorpay (payment processing)</li>
                <li>Google Analytics (website analytics)</li>
                <li>Shipping carriers (order delivery)</li>
                <li>Email service providers</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                We encourage you to review these third-party privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
              <p className="mb-4">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we discover that we have collected information from a child under 13, we will delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Policy Updates</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last Updated" date. Continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
              <div className="bg-muted/50 p-6 rounded-lg">
                <p className="mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
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
            <p>By using Vibly.in, you acknowledge that you have read, understood, and agree to our privacy practices.</p>
            <p className="mt-2">This Privacy Policy is designed to comply with applicable data protection laws and regulations.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default PrivacyPolicy