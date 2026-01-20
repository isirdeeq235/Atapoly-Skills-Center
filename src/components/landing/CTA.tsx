import { forwardRef, useEffect, useRef, useState } from "react";
import { ArrowRight, Quote, Star, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const testimonials = [
  {
    quote: "The program transformed my career. Within months of completing, I landed my dream job with a 40% salary increase.",
    name: "Sarah Johnson",
    role: "Software Engineer",
    company: "Tech Corp",
    rating: 5,
  },
  {
    quote: "The hands-on approach and industry connections made all the difference. The instructors truly care about your success.",
    name: "Michael Chen",
    role: "Product Manager",
    company: "StartupXYZ",
    rating: 5,
  },
  {
    quote: "Best investment I've made in myself. The skills I learned are directly applicable to my daily work.",
    name: "Amara Okonkwo",
    role: "Data Analyst",
    company: "Finance Plus",
    rating: 5,
  }
];

const benefits = [
  "Industry-recognized certification",
  "Lifetime access to materials",
  "1-on-1 mentorship sessions",
  "Job placement assistance",
];

export const CTA = forwardRef<HTMLElement>(function CTA(_, ref) {
  const { data: content } = useHomepageContent();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const ctaTitle = content?.cta_title || "Ready to transform your career?";
  const ctaSubtitle = content?.cta_subtitle || "Join thousands of professionals who have accelerated their careers through our programs.";
  const ctaButtonText = content?.cta_button_text || "Start Your Journey";
  const ctaButtonLink = content?.cta_button_link || "/register";
  const showTestimonials = content?.show_testimonials !== false;

  return (
    <section ref={ref} className="relative overflow-hidden">
      {/* Testimonials Section */}
      {showTestimonials && (
        <div className="py-24 lg:py-32 bg-card">
          <div ref={sectionRef} className="container mx-auto px-4">
            <div 
              className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Quote className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Hear from our graduates
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className={`group relative bg-background p-8 rounded-3xl border border-border hover:border-accent/30 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5 hover:-translate-y-2 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${100 + index * 100}ms` }}
                >
                  {/* Quote mark decoration */}
                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Quote className="w-6 h-6 text-accent/40" />
                  </div>

                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  
                  <p className="text-foreground text-lg leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-border">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main CTA Section */}
      <div className="relative py-24 lg:py-32 bg-foreground overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto">
            {/* Left content */}
            <div 
              className={`transition-all duration-700 delay-300 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-[1.1] mb-6">
                {ctaTitle}
              </h2>
              <p className="text-xl text-background/70 mb-8 leading-relaxed">
                {ctaSubtitle}
              </p>
              
              {/* Benefits list */}
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-background/80">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link to={ctaButtonLink}>
                  <Button 
                    size="lg" 
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-10 h-16 text-lg font-semibold group shadow-lg shadow-accent/30 hover:shadow-xl hover:shadow-accent/40 transition-all"
                  >
                    {ctaButtonText}
                    <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/programs">
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    className="text-background/80 hover:text-background hover:bg-background/10 rounded-full px-8 h-14 border border-background/20"
                  >
                    Browse Programs
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right - Stats card */}
            <div 
              className={`transition-all duration-700 delay-400 ${
                isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
              }`}
            >
              <div className="relative bg-background/10 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-background/10">
                <div className="grid grid-cols-2 gap-8">
                  {[
                    { value: "10,000+", label: "Graduates" },
                    { value: "98%", label: "Completion Rate" },
                    { value: "50+", label: "Programs" },
                    { value: "4.9/5", label: "Average Rating" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl lg:text-4xl font-bold text-accent mb-2">{stat.value}</div>
                      <div className="text-sm text-background/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Decorative badge */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-accent rounded-2xl flex items-center justify-center rotate-12 shadow-lg">
                  <span className="text-accent-foreground font-bold text-center text-sm leading-tight -rotate-12">
                    Start<br/>Today
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";
