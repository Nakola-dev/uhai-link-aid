import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Card>
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-muted-foreground text-sm">
              Last updated: February 12, 2026 &bull; Version 1.0.0
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">1. Agreement to Terms</h2>
              <p>
                By accessing or using UhaiLink (&quot;the Platform&quot;), you agree to be bound by these 
                Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, do not use the Platform.
              </p>
              <p>
                UhaiLink is operated under the laws of the Republic of Kenya. These Terms are 
                governed by the Kenya Data Protection Act 2019, the Consumer Protection Act 2012, 
                and applicable international data protection regulations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">2. Description of Service</h2>
              <p>
                UhaiLink is an emergency medical information platform that enables users to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Store critical medical information in a secure digital profile</li>
                <li>Generate QR codes that provide emergency responders instant access to medical data</li>
                <li>Trigger emergency SOS alerts that notify designated emergency contacts via SMS</li>
                <li>Access AI-powered first aid guidance</li>
                <li>Learn emergency preparedness through educational content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">3. Eligibility</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>Parents or legal guardians may create profiles for minors under their care</li>
                <li>You must provide accurate and truthful information</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">4. Medical Information Disclaimer</h2>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 my-4">
                <p className="font-semibold text-destructive mb-2">IMPORTANT — PLEASE READ CAREFULLY</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    UhaiLink is <strong>NOT</strong> a medical device, diagnostic tool, or substitute 
                    for professional medical care.
                  </li>
                  <li>
                    The AI first aid assistant provides <strong>general guidance only</strong> and does 
                    not constitute medical advice, diagnosis, or treatment.
                  </li>
                  <li>
                    Always seek the advice of qualified healthcare professionals for medical conditions.
                  </li>
                  <li>
                    In life-threatening emergencies, call <strong>999</strong> (Kenya Emergency Services) 
                    or your local emergency number immediately.
                  </li>
                  <li>
                    UhaiLink does <strong>not guarantee</strong> that emergency responders will access 
                    your QR code during an emergency or that SMS notifications will be delivered successfully.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">5. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep your medical information accurate and up to date</li>
                <li>Do not share your account credentials with others</li>
                <li>Report any unauthorized access to your account immediately</li>
                <li>Use the platform only for its intended emergency medical information purposes</li>
                <li>Do not use the AI assistant as a replacement for professional medical consultations</li>
                <li>Ensure your emergency contacts have consented to receiving emergency notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">6. Data Accuracy</h2>
              <p>
                You are solely responsible for the accuracy of the medical information you provide. 
                UhaiLink is not responsible for any consequences arising from incorrect, incomplete, 
                or outdated medical information in your profile. Emergency responders rely on this 
                information — inaccurate data could lead to inappropriate medical treatment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  UhaiLink is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties 
                  of any kind, express or implied.
                </li>
                <li>
                  We do not warrant that the Platform will be uninterrupted, error-free, or available 
                  at all times, including during emergencies.
                </li>
                <li>
                  We are not liable for any direct, indirect, incidental, special, consequential, 
                  or punitive damages arising from your use of the Platform.
                </li>
                <li>
                  We are not liable for the failure of SMS notifications, QR code scans, or any 
                  third-party service (including SMS providers and AI services).
                </li>
                <li>
                  Our total liability shall not exceed the amount you have paid to UhaiLink in 
                  the 12 months preceding the claim.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">8. Privacy</h2>
              <p>
                Your use of UhaiLink is also governed by our{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>, 
                which describes how we collect, use, and protect your personal and medical data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">9. Intellectual Property</h2>
              <p>
                The Platform, including its design, code, content, and branding, is owned by UhaiLink 
                and protected by copyright and intellectual property laws. You may not copy, modify, 
                distribute, or create derivative works without our written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">10. Account Termination</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may delete your account at any time through your account settings</li>
                <li>
                  We may suspend or terminate your account if you violate these Terms, engage in 
                  fraudulent activity, or misuse the platform
                </li>
                <li>
                  Upon account deletion, your personal data will be removed in accordance with 
                  our data retention policy outlined in the Privacy Policy
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be 
                communicated via email or in-app notification at least 30 days before taking effect. 
                Continued use of the Platform after changes constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">12. Governing Law & Dispute Resolution</h2>
              <p>
                These Terms are governed by the laws of the Republic of Kenya. Any disputes arising 
                from these Terms shall be resolved through mediation administered by the Nairobi 
                Centre for International Arbitration (NCIA). If mediation fails, disputes shall be 
                submitted to the courts of Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mt-6 mb-3">13. Contact</h2>
              <p>
                For questions about these Terms:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Email: <strong>legal@uhailink.com</strong></li>
                <li>General support: <strong>support@uhailink.com</strong></li>
              </ul>
            </section>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
