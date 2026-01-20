import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";

const TermsOfService = () => {
  const { data: siteConfig } = useSiteConfig();
  const siteName = siteConfig?.site_name || "Training Portal";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-foreground">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p className="text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p>
                By accessing and using {siteName}'s services, you accept and agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">2. Registration and Account</h2>
              <p>To use our services, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Create an account with accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Be at least 18 years old or have parental consent</li>
                <li>Not share your account with others</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">3. Program Enrollment</h2>
              <p>When applying for and enrolling in our programs:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Application fees are non-refundable once processed</li>
                <li>Registration fees secure your spot in the selected batch/cohort</li>
                <li>Enrollment is subject to application approval by our team</li>
                <li>Program schedules and content are subject to change</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">4. Payment Terms</h2>
              <p>
                All payments are processed through secure third-party payment providers. By making a payment, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Pay all applicable fees as stated during enrollment</li>
                <li>Provide accurate payment information</li>
                <li>Accept that refunds are subject to our refund policy</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">5. Code of Conduct</h2>
              <p>As a trainee, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Attend scheduled training sessions</li>
                <li>Respect instructors, staff, and fellow trainees</li>
                <li>Complete assigned coursework and assessments</li>
                <li>Not engage in any disruptive or harmful behavior</li>
                <li>Not share or distribute course materials without permission</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">6. Certificates and Credentials</h2>
              <p>
                Certificates are issued upon successful completion of programs. We reserve the right to revoke 
                certificates if completion requirements were not genuinely met or if fraud is discovered.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">7. Limitation of Liability</h2>
              <p>
                {siteName} is not liable for any indirect, incidental, or consequential damages arising from 
                your use of our services. Our total liability shall not exceed the amount you paid for the relevant service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">8. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account for violations of these terms, 
                non-payment, or any conduct we deem harmful to our community.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">9. Changes to Terms</h2>
              <p>
                We may update these terms from time to time. Continued use of our services after changes 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">10. Contact Us</h2>
              <p>
                For questions about these Terms of Service, contact us at{" "}
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

export default TermsOfService;
