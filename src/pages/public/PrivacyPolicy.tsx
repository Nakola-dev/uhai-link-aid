import Layout from '@/components/shared/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground text-sm">
              Last updated: February 12, 2026 &bull; Version 1.0.0
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
              <p>
                UhaiLink (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates a life-critical 
                emergency medical information platform. This Privacy Policy explains how we 
                collect, use, store, share, and protect your personal data, including sensitive 
                medical information, in compliance with the <strong>Kenya Data Protection Act 2019 (DPA)</strong>, 
                the <strong>EU General Data Protection Regulation (GDPR)</strong>, and other applicable 
                data protection laws.
              </p>
              <p>
                By creating an account or using UhaiLink, you acknowledge that you have read, 
                understood, and agree to this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">2. Data Controller</h2>
              <p>
                The data controller responsible for your personal data is:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Entity</strong>: UhaiLink</li>
                <li><strong>Email</strong>: privacy@uhailink.com</li>
                <li><strong>Address</strong>: Nairobi, Kenya</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Data We Collect</h2>
              <h3 className="text-lg font-medium mt-4 mb-2">3.1 Identity Data</h3>
              <p>Full name, email address, phone number, date of birth, gender, city, and county.</p>
              
              <h3 className="text-lg font-medium mt-4 mb-2">3.2 Sensitive Medical Data (Special Category)</h3>
              <p>
                Blood type, allergies, medications, chronic conditions, and primary hospital. 
                This data is classified as <strong>sensitive personal data</strong> under the Kenya DPA 
                (Section 44) and GDPR (Article 9) and requires your <strong>explicit consent</strong> 
                before processing.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">3.3 Emergency Contact Data</h3>
              <p>Names, phone numbers, and relationships of your designated emergency contacts.</p>

              <h3 className="text-lg font-medium mt-4 mb-2">3.4 Usage Data</h3>
              <p>
                QR code scan logs (IP address, user agent, timestamp), emergency incident records, 
                AI chat conversations, and notification delivery logs.
              </p>

              <h3 className="text-lg font-medium mt-4 mb-2">3.5 Technical Data</h3>
              <p>Device information, browser type, geolocation (only during emergency incidents with your permission).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Lawful Basis for Processing</h2>
              <p>We process your data based on the following legal grounds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Explicit Consent</strong> (DPA Section 32, GDPR Art. 6(1)(a), Art. 9(2)(a)): 
                  For medical data processing, emergency data sharing, and AI-assisted guidance.
                </li>
                <li>
                  <strong>Vital Interests</strong> (GDPR Art. 6(1)(d), Art. 9(2)(c)): 
                  Sharing medical data with emergency responders when you trigger an emergency SOS 
                  or when your QR code is scanned during a medical emergency.
                </li>
                <li>
                  <strong>Contractual Necessity</strong> (DPA Section 30, GDPR Art. 6(1)(b)): 
                  To provide the core QR-based medical information service.
                </li>
                <li>
                  <strong>Legitimate Interest</strong> (GDPR Art. 6(1)(f)): 
                  For platform security, fraud prevention, and service improvement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">5. How We Use Your Data</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Display your medical profile to emergency responders via QR code scan</li>
                <li>Send emergency SMS notifications to your contacts during SOS events</li>
                <li>Provide AI-powered first aid guidance personalized to your medical profile</li>
                <li>Notify you of account activities and platform updates</li>
                <li>Maintain audit trails for security and compliance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Sharing & Third Parties</h2>
              <p>We share your data only when necessary:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Emergency Responders</strong>: Medical profile data visible via QR code during emergencies.
                </li>
                <li>
                  <strong>SMS Providers</strong> (Africa&apos;s Talking, Twilio): Phone numbers and 
                  emergency notification content for SMS delivery.
                </li>
                <li>
                  <strong>AI Service Providers</strong> (OpenRouter): Anonymized medical context 
                  for AI-generated first aid guidance. No personally identifiable information is shared.
                </li>
                <li>
                  <strong>Infrastructure Providers</strong> (Supabase): Data hosting and storage. 
                  Supabase processes data on our behalf under a data processing agreement.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Cross-Border Data Transfers</h2>
              <p>
                Our infrastructure is hosted by Supabase, which may process data outside Kenya. 
                We ensure appropriate safeguards (DPA Section 48, GDPR Chapter V) are in place, 
                including standard contractual clauses where applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">8. Data Security</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All data encrypted in transit (TLS/HTTPS) and at rest (AES-256)</li>
                <li>Row-Level Security (RLS) on all database tables</li>
                <li>Role-based access control for administrative functions</li>
                <li>Audit logging for data access and modifications</li>
                <li>Regular security assessments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">9. Your Rights</h2>
              <p>Under the Kenya DPA and GDPR, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access</strong>: Request a copy of your personal data</li>
                <li><strong>Rectification</strong>: Update or correct your data via your profile settings</li>
                <li><strong>Erasure</strong>: Request deletion of your account and all associated data</li>
                <li><strong>Restrict Processing</strong>: Limit how we use your data</li>
                <li><strong>Withdraw Consent</strong>: Revoke any previously given consent at any time</li>
                <li><strong>Data Portability</strong>: Receive your data in a machine-readable format</li>
                <li><strong>Complaint</strong>: Lodge a complaint with the Office of the Data Protection Commissioner (ODPC) Kenya</li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us at <strong>privacy@uhailink.com</strong>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">10. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account data</strong>: Retained while your account is active, deleted within 30 days of account closure</li>
                <li><strong>Emergency incident logs</strong>: Retained for 7 years for legal compliance</li>
                <li><strong>QR scan logs</strong>: Retained for 1 year</li>
                <li><strong>AI chat history</strong>: Retained for 90 days, then automatically purged</li>
                <li><strong>Consent records</strong>: Retained for the lifetime of the account plus 5 years</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">11. Children&apos;s Privacy</h2>
              <p>
                UhaiLink is intended for individuals aged 18 and above. If a parent or guardian 
                wishes to create a profile for a minor, they must provide consent on the minor&apos;s behalf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of material 
                changes via email or in-app notification. Your continued use of UhaiLink after 
                changes are posted constitutes acceptance of the updated policy. You may be asked 
                to re-consent if material changes affect how we process sensitive data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">13. Contact Us</h2>
              <p>
                For questions, concerns, or to exercise your data rights:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: <strong>privacy@uhailink.com</strong></li>
                <li>General: <strong>support@uhailink.com</strong></li>
              </ul>
              <p className="mt-2">
                You may also contact the <strong>Office of the Data Protection Commissioner (ODPC)</strong> 
                of Kenya at <a href="https://www.odpc.go.ke" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.odpc.go.ke</a>.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
