import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { HelpCircle, Mail, Phone } from "lucide-react";

const faqs = [
  {
    category: "Application Process",
    questions: [
      {
        question: "How do I apply for a training program?",
        answer: "To apply, create an account, complete your profile, browse our programs, select your preferred program and cohort, pay the application fee, and submit your application. Our team will review and notify you of the decision."
      },
      {
        question: "What happens after I submit my application?",
        answer: "After submission, our admissions team reviews your application. You'll receive an email notification once a decision is made. If approved, you can proceed to pay the registration fee to secure your spot."
      },
      {
        question: "Can I apply for multiple programs?",
        answer: "Yes, you can apply for multiple programs. However, each program requires a separate application and application fee."
      },
      {
        question: "What are the application requirements?",
        answer: "Requirements vary by program. Generally, you'll need to complete your profile with personal information, upload a passport photo, and provide any program-specific documents if requested."
      }
    ]
  },
  {
    category: "Payments & Fees",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept payments through Paystack and Flutterwave, which support debit cards, bank transfers, and other local payment methods."
      },
      {
        question: "Are application fees refundable?",
        answer: "Application fees are non-refundable once your application has been processed. This fee covers the administrative cost of reviewing your application."
      },
      {
        question: "What does the registration fee cover?",
        answer: "The registration fee secures your enrollment in the program and covers training materials, access to resources, and certificate issuance upon completion."
      },
      {
        question: "How do I get a payment receipt?",
        answer: "Payment receipts are automatically generated and available in your dashboard under Payment History. You can download them anytime."
      }
    ]
  },
  {
    category: "Training & Programs",
    questions: [
      {
        question: "Are the training programs in-person or online?",
        answer: "Our programs are primarily in-person physical training sessions. Please check individual program details for specific delivery methods and locations."
      },
      {
        question: "How do I choose a cohort/batch?",
        answer: "During the application process, you'll see available cohorts with their start dates. Choose the one that best fits your schedule."
      },
      {
        question: "What happens if I miss a training session?",
        answer: "Please contact your instructor or our support team if you need to miss a session. Attendance policies vary by program, so review the specific requirements."
      },
      {
        question: "Can I transfer to a different cohort?",
        answer: "Cohort transfers may be possible depending on availability. Contact our support team to discuss your situation and options."
      }
    ]
  },
  {
    category: "Certificates & ID Cards",
    questions: [
      {
        question: "How do I get my certificate?",
        answer: "Upon successful completion of your program and meeting all requirements, your certificate will be issued and available for download in your dashboard."
      },
      {
        question: "What is the ID card for?",
        answer: "Your digital ID card serves as proof of enrollment and can be used for identification at training venues and related activities."
      },
      {
        question: "Can I verify my certificate?",
        answer: "Yes, certificates include a unique certificate number that can be used for verification purposes."
      }
    ]
  },
  {
    category: "Account & Technical",
    questions: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox to reset your password."
      },
      {
        question: "How do I update my profile information?",
        answer: "Log into your dashboard and go to Profile Settings to update your personal information, contact details, and profile photo."
      },
      {
        question: "I'm having technical issues. What should I do?",
        answer: "Try refreshing the page or clearing your browser cache. If the issue persists, contact our support team with details about the problem."
      }
    ]
  }
];

const FAQs = () => {
  const { data: siteConfig } = useSiteConfig();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Find answers to common questions about our training programs, application process, 
              payments, and more.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-8">
            {faqs.map((section, sectionIndex) => (
              <Card key={sectionIndex}>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 text-foreground">{section.category}</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {section.questions.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`${sectionIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left text-foreground hover:no-underline">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Section */}
          <Card className="mt-12">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Still have questions?</h2>
              <p className="text-muted-foreground mb-6">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contact">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Support
                  </Button>
                </Link>
                {siteConfig?.contact_phone && (
                  <a href={`tel:${siteConfig.contact_phone}`}>
                    <Button variant="outline" className="gap-2">
                      <Phone className="w-4 h-4" />
                      {siteConfig.contact_phone}
                    </Button>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQs;
