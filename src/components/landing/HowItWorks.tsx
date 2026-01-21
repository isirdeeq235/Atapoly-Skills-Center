import { forwardRef, useState, memo } from "react";
import { ArrowRight, Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    step: "01",
    title: "Choose Your Path",
    description: "Browse our catalog of 50+ programs. Find the perfect fit for your career goals and select your preferred cohort start date.",
    highlights: ["Personalized recommendations", "Flexible scheduling", "Clear roadmaps"],
    color: "from-accent to-accent/60",
  },
  {
    step: "02",
    title: "Submit & Pay",
    description: "Complete your application in minutes. Our team reviews within 48 hours, ensuring a quick path to enrollment.",
    highlights: ["Secure payments", "Quick approval", "Instant confirmation"],
    color: "from-primary to-primary/60",
  },
  {
    step: "03",
    title: "Get Enrolled",
    description: "Once approved, finalize your registration. Receive your digital student ID and unlock your personalized learning dashboard.",
    highlights: ["Digital credentials", "Resource access", "Community entry"],
    color: "from-accent to-primary",
  },
  {
    step: "04",
    title: "Launch Your Career",
    description: "Join your cohort, engage with expert instructors, complete hands-on projects, and earn your industry-recognized certificate.",
    highlights: ["Live instruction", "Real projects", "Career support"],
    color: "from-primary to-accent",
  },
];

// Memoized step button for desktop
const StepButton = memo(({ step, index, isActive, onClick, isVisible }: {
  step: typeof steps[0];
  index: number;
  isActive: boolean;
  onClick: () => void;
  isVisible: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-6 rounded-2xl border transition-all duration-200 ${
      isActive 
        ? 'bg-card border-accent shadow-lg shadow-accent/10' 
        : 'bg-transparent border-border hover:border-muted-foreground/30 hover:bg-card/50'
    } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
    style={{ transitionDelay: `${50 + index * 50}ms` }}
  >
    <div className="flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
        isActive 
          ? 'bg-accent text-accent-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {step.step}
      </div>
      <div className="flex-1">
        <h3 className={`text-xl font-bold mb-1 transition-colors ${
          isActive ? 'text-foreground' : 'text-muted-foreground'
        }`}>
          {step.title}
        </h3>
        {isActive && (
          <p className="text-muted-foreground text-sm animate-fade-in">
            {step.description}
          </p>
        )}
      </div>
    </div>
  </button>
));
StepButton.displayName = "StepButton";

// Memoized mobile step card
const MobileStepCard = memo(({ step, index, isVisible }: {
  step: typeof steps[0];
  index: number;
  isVisible: boolean;
}) => (
  <div 
    className={`bg-card rounded-2xl p-6 border border-border transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
    }`}
    style={{ transitionDelay: `${50 + index * 50}ms` }}
  >
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
        {step.step}
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground mb-1">{step.title}</h3>
        <p className="text-muted-foreground text-sm">{step.description}</p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 pl-16">
      {step.highlights.map((highlight, hIndex) => (
        <span 
          key={hIndex}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm"
        >
          <Check className="w-3 h-3" />
          {highlight}
        </span>
      ))}
    </div>
  </div>
));
MobileStepCard.displayName = "MobileStepCard";

export const HowItWorks = forwardRef<HTMLElement>(function HowItWorks(_, ref) {
  const { ref: sectionRef, isVisible } = useInView();
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-px h-[50%] bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute top-1/4 right-0 w-px h-[50%] bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>

      <div ref={sectionRef} className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24">
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple 4-Step Process</span>
          </div>
          <h2 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 transition-all duration-300 delay-50 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Your journey to success
            <br />
            <span className="text-accent">starts here</span>
          </h2>
          <p 
            className={`text-xl text-muted-foreground transition-all duration-300 delay-75 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            From application to certification, we've streamlined every step to get you learning faster.
          </p>
        </div>

        {/* Interactive Steps - Desktop */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Step selector */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <StepButton
                key={index}
                step={step}
                index={index}
                isActive={activeStep === index}
                onClick={() => setActiveStep(index)}
                isVisible={isVisible}
              />
            ))}
          </div>

          {/* Right - Active step details */}
          <div 
            className={`relative transition-all duration-300 delay-150 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
            }`}
          >
            <div className="relative bg-card rounded-3xl p-10 border border-border overflow-hidden">
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${steps[activeStep].color} opacity-5`} />
              
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-8">
                  <span className="text-3xl font-bold text-white">{steps[activeStep].step}</span>
                </div>
                
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  {steps[activeStep].title}
                </h3>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {steps[activeStep].description}
                </p>
                
                {/* Highlights */}
                <div className="space-y-3">
                  {steps[activeStep].highlights.map((highlight, hIndex) => (
                    <div 
                      key={hIndex}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-foreground font-medium">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>

        {/* Mobile Steps */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <MobileStepCard key={index} step={step} index={index} isVisible={isVisible} />
          ))}
        </div>

        {/* CTA */}
        <div 
          className={`mt-16 text-center transition-all duration-300 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link to="/register">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 h-16 text-lg font-semibold group shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
            >
              Begin Your Journey
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-muted-foreground">No commitment required. Start exploring today.</p>
        </div>
      </div>
    </section>
  );
});

HowItWorks.displayName = "HowItWorks";
