import { ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Apply for a Program",
    description: "Browse available training programs and submit your application with required documents.",
  },
  {
    step: "02",
    title: "Pay Application Fee",
    description: "Complete secure payment via Paystack or Flutterwave. Receive instant receipt confirmation.",
  },
  {
    step: "03",
    title: "Get Approved",
    description: "Admin reviews your application. Upon approval, receive email notification to proceed.",
  },
  {
    step: "04",
    title: "Complete Registration",
    description: "Pay registration fee, get your unique ID card, and access your personalized dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-primary">Simple Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in four simple steps. Our streamlined process ensures 
            a smooth journey from application to certification.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-[10%] right-[10%] h-0.5 bg-border" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="relative z-10 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mb-6 mx-auto lg:mx-0">
                  {item.step}
                </div>
                
                {/* Arrow (Desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[calc(100%-1rem)] z-20">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}

                {/* Content */}
                <div className="text-center lg:text-left">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
