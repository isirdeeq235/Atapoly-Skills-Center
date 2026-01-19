import { forwardRef } from "react";
import { 
  GraduationCap, 
  CreditCard, 
  Users, 
  Award,
  ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    number: "01",
    icon: GraduationCap,
    title: "Expert-Led Programs",
    description: "Learn from industry professionals with years of real-world experience in their fields.",
  },
  {
    number: "02",
    icon: Users,
    title: "Small Cohorts",
    description: "Personalized attention with limited class sizes ensuring quality mentorship.",
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Affordable fee structures with multiple payment options to suit your budget.",
  },
  {
    number: "04",
    icon: Award,
    title: "Certified Credentials",
    description: "Receive industry-recognized certificates upon successful program completion.",
  },
];

export const Features = forwardRef<HTMLElement>(function Features(_, ref) {
  return (
    <section ref={ref} className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="max-w-3xl mb-16 lg:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-accent" />
            <span className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
              Why Choose Us
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
            Built for success, designed for learners
          </h2>
          <p className="text-xl text-muted-foreground">
            We've crafted every aspect of our training experience to maximize your potential and career growth.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative bg-card p-8 lg:p-10 rounded-2xl border border-border hover:border-accent/30 transition-all duration-300 hover:shadow-xl"
            >
              {/* Number */}
              <span className="absolute top-8 right-8 text-7xl font-bold text-muted-foreground/10 group-hover:text-accent/10 transition-colors">
                {feature.number}
              </span>
              
              <div className="relative">
                {/* Icon */}
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-accent group-hover:text-white transition-all">
                  <feature.icon className="w-7 h-7 text-accent group-hover:text-white transition-colors" />
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Link 
            to="/about" 
            className="inline-flex items-center gap-2 text-foreground font-semibold hover:text-accent transition-colors group"
          >
            Learn more about our approach
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";
