import { forwardRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    step: "01",
    title: "Choose Your Program",
    description: "Browse our catalog and select a program that aligns with your career goals. Pick your preferred cohort start date.",
    highlights: ["50+ programs available", "Flexible start dates", "Clear curriculum outline"],
  },
  {
    step: "02",
    title: "Apply & Pay",
    description: "Submit your application and pay the application fee securely online. We'll review your application within 48 hours.",
    highlights: ["Secure payment", "Quick approval", "Email notifications"],
  },
  {
    step: "03",
    title: "Get Enrolled",
    description: "Once approved, complete your registration payment. You'll receive your unique student ID and dashboard access.",
    highlights: ["Digital ID card", "Personal dashboard", "Learning resources"],
  },
  {
    step: "04",
    title: "Start Learning",
    description: "Join your cohort on the start date. Engage with instructors, complete assignments, and earn your certificate.",
    highlights: ["Expert instructors", "Hands-on training", "Career support"],
  },
];

export const HowItWorks = forwardRef<HTMLElement>(function HowItWorks(_, ref) {
  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 lg:mb-24">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
              How It Works
            </span>
            <div className="h-px w-12 bg-accent" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Simple steps to transform your career
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-16 ${
                index !== steps.length - 1 ? 'border-b border-border' : ''
              }`}
            >
              {/* Step Number */}
              <div className="lg:w-32 flex-shrink-0">
                <span className="text-6xl lg:text-7xl font-bold text-muted-foreground/20">
                  {step.step}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-muted-foreground mb-6 max-w-xl">
                  {step.description}
                </p>
                
                {/* Highlights */}
                <div className="flex flex-wrap gap-4">
                  {step.highlights.map((highlight, hIndex) => (
                    <div 
                      key={hIndex}
                      className="flex items-center gap-2 text-sm"
                    >
                      <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connector line for desktop */}
              {index !== steps.length - 1 && (
                <div className="hidden lg:block absolute left-16 bottom-0 w-px h-8 bg-border translate-y-full" />
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link to="/register">
            <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-14 text-base font-semibold group">
              Start Your Application
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";
