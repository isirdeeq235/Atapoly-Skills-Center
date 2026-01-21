import { forwardRef, memo } from "react";
import { GraduationCap, Users, Award, Briefcase, Lightbulb, Globe, Layers, Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useHomepageContent } from "@/hooks/useHomepageContent";
import { useInView } from "@/hooks/useInView";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap,
  Users,
  Award,
  Briefcase,
  Lightbulb,
  Globe,
  Layers,
  Shield,
};

const defaultFeatures = [
  { number: "01", icon: "GraduationCap", title: "Industry-Led Curriculum", description: "Programs designed by experts with real-world experience, ensuring you learn skills that matter." },
  { number: "02", icon: "Users", title: "Expert Mentorship", description: "Get personalized guidance from instructors who've achieved success in their fields." },
  { number: "03", icon: "Award", title: "Recognized Credentials", description: "Earn certifications valued by top employers, opening doors to new opportunities." },
  { number: "04", icon: "Briefcase", title: "Career Acceleration", description: "Access job placement support, networking events, and interview coaching." },
];

// Memoized feature card
const FeatureCard = memo(({ feature, index, isVisible, isLarge }: {
  feature: { number: string; icon: string; title: string; description: string };
  index: number;
  isVisible: boolean;
  isLarge: boolean;
}) => {
  const IconComponent = iconMap[feature.icon] || GraduationCap;
  
  return (
    <div 
      className={`group relative bg-background rounded-3xl p-8 border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-2xl hover:shadow-accent/5 ${
        isLarge ? 'lg:col-span-2' : ''
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${50 + index * 50}ms` }}
    >
      {/* Hover gradient */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {/* Icon with animated background */}
        <div className="relative mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:scale-110 transition-all duration-300">
            <IconComponent className="w-8 h-8 text-accent group-hover:text-accent-foreground transition-colors" />
          </div>
          {/* Number tag */}
          <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all">
            {feature.number}
          </span>
        </div>

        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
          {feature.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
});
FeatureCard.displayName = "FeatureCard";

export const Features = forwardRef<HTMLElement>(function Features(_, ref) {
  const { data: content } = useHomepageContent();
  const { ref: sectionRef, isVisible } = useInView();

  const features = content ? [
    { number: "01", icon: content.feature_1_icon, title: content.feature_1_title, description: content.feature_1_description },
    { number: "02", icon: content.feature_2_icon, title: content.feature_2_title, description: content.feature_2_description },
    { number: "03", icon: content.feature_3_icon, title: content.feature_3_title, description: content.feature_3_description },
    { number: "04", icon: content.feature_4_icon, title: content.feature_4_title, description: content.feature_4_description },
  ] : defaultFeatures;

  const featuresTitle = content?.features_title || "Why leaders choose us";
  const featuresSubtitle = content?.features_subtitle || "We've built a learning experience that delivers real results and lasting career impact.";

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      
      <div ref={sectionRef} className="container mx-auto px-4 relative">
        {/* Header - Asymmetric layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mb-16 lg:mb-24">
          <div>
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 transition-all duration-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-accent">Why Choose Us</span>
            </div>
            <h2 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] transition-all duration-300 delay-50 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {featuresTitle}
            </h2>
          </div>
          <div className="lg:pt-12">
            <p 
              className={`text-xl text-muted-foreground leading-relaxed transition-all duration-300 delay-75 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {featuresSubtitle}
            </p>
          </div>
        </div>

        {/* Features - Bento Grid Style */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              feature={feature}
              index={index}
              isVisible={isVisible}
              isLarge={index === 0 || index === 3}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div 
          className={`mt-16 flex justify-center transition-all duration-300 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <Link 
            to="/about" 
            className="group inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background hover:bg-foreground/90 font-semibold transition-all"
          >
            Learn more about our approach
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";
