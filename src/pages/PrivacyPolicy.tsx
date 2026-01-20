import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const PrivacyPolicy = () => {
  const { data: siteConfig } = useSiteConfig();
  const siteName = siteConfig?.site_name || "Training Portal";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                At {siteName}, we collect information you provide directly to us, such as when you create an account, 
                apply for a program, make a payment, or contact us for support. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Personal identification information (name, email, phone number)</li>
                <li>Educational and professional background</li>
                <li>Payment information (processed securely through our payment partners)</li>
                <li>Communication preferences and correspondence</li>
                <li>Profile photo and identification documents</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process your applications and enrollments</li>
                <li>Provide and improve our training services</li>
                <li>Communicate with you about programs, updates, and support</li>
                <li>Process payments and issue receipts</li>
                <li>Generate certificates and ID cards</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Information Sharing</h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Payment processors for transaction processing</li>
                <li>Service providers who assist in our operations</li>
                <li>Regulatory bodies when required by law</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{" "}
                {siteConfig?.contact_email ? (
                  <a href={`mailto:${siteConfig.contact_email}`} className="text-primary hover:underline">
                    {siteConfig.contact_email}
                  </a>
                ) : (
                  "our support email"
                )}.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
