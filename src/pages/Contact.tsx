import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Loader2,
  CheckCircle
} from "lucide-react";

const Contact = () => {
  const { data: siteConfig } = useSiteConfig();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Reset success state after a few seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      value: siteConfig?.contact_email || "info@trainhub.com",
      description: "Send us an email anytime"
    },
    {
      icon: Phone,
      title: "Call Us",
      value: siteConfig?.contact_phone || "+234 800 000 0000",
      description: "Mon-Fri from 8am to 5pm"
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: siteConfig?.address || "Lagos, Nigeria",
      description: "Come say hello at our office"
    },
    {
      icon: Clock,
      title: "Office Hours",
      value: "Mon - Fri: 8am - 5pm",
      description: "Weekend appointments available"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/90">Get In Touch</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              We'd Love to Hear From You
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Have questions about our programs? Ready to start your learning journey? 
              Our team is here to help you every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center card-hover border-0 shadow-lg">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <info.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{info.title}</h3>
                  <p className="text-foreground font-medium mb-1">{info.value}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl">Send Us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name" 
                          placeholder="John Doe" 
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        name="subject" 
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="h-12"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        name="message" 
                        placeholder="Tell us more about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        className="resize-none"
                      />
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* FAQ / Additional Info */}
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {[
                  {
                    question: "How long does it take to complete a program?",
                    answer: "Program duration varies from a few weeks to several months depending on the course. Each program page shows the specific duration."
                  },
                  {
                    question: "Do you offer payment plans?",
                    answer: "Yes! We understand education is an investment. Contact us to discuss flexible payment options that work for your budget."
                  },
                  {
                    question: "Are your certifications recognized?",
                    answer: "Absolutely. Our certifications are industry-recognized and valued by employers across various sectors."
                  },
                  {
                    question: "Can I get a refund if I'm not satisfied?",
                    answer: "We offer a satisfaction guarantee. If you're not happy with your program within the first week, we'll work with you to find a solution."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-card rounded-xl p-6 shadow-lg border border-border">
                    <h4 className="font-semibold text-foreground mb-2">{faq.question}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
