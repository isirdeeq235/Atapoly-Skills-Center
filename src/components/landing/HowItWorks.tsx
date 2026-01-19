import { forwardRef } from "react";
import { ArrowRight, CheckCircle, FileText, CreditCard, UserCheck, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Apply for a Program",
    description: "Browse available training programs and submit your application with the required details.",
    color: "bg-blue-500",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Pay Application Fee",
    description: "Complete secure payment via Paystack or Flutterwave and receive instant confirmation.",
    color: "bg-purple-500",
  },
  {
    step: "03",
    icon: UserCheck,
    title: "Get Approved",
    description: "Admin reviews your application. Upon approval, you'll receive an email notification.",
    color: "bg-orange-500",
  },
  {
    step: "04",
    icon: Award,
    title: "Start Learning",
    description: "Pay registration fee, get your unique ID card, and access your personalized dashboard.",
    color: "bg-green-500",
  },
];

export const HowItWorks = forwardRef<HTMLElement>(function HowItWorks(_, ref) {
  return (
    <section ref={ref} className="py-24 bg-secondary/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
        backgroundSize: '32px 32px'
      }} />

      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-5 py-2 mb-6">
            <span className="text-sm font-semibold text-primary">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Get Started in
            <span className="text-accent"> 4 Simple Steps</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Our streamlined process ensures a smooth journey from application to certification.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-28 left-[15%] right-[15%] h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 to-green-500 rounded-full opacity-20" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative group">
                {/* Card */}
                <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300 relative z-10">
                  {/* Step Number */}
                  <div className={`w-16 h-16 ${item.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  {/* Step Badge */}
                  <div className="absolute top-4 right-4 text-3xl font-bold text-muted-foreground/20">
                    {item.step}
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>

                  {/* Checkmark */}
                  <div className="mt-4 flex items-center gap-2 text-accent">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Quick & Easy</span>
                  </div>
                </div>

                {/* Arrow (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute top-28 -right-4 z-20 w-8 h-8 bg-background rounded-full border border-border items-center justify-center shadow-sm">
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/register">
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/25">
              Start Your Journey Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";
