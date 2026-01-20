import { forwardRef } from "react";
import { ArrowRight, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const testimonials = [
  {
    quote: "The program transformed my career. Within months of completing, I landed my dream job with a 40% salary increase.",
    name: "Sarah Johnson",
    role: "Graduate, 2024"
  },
  {
    quote: "The hands-on approach and industry connections made all the difference. The instructors truly care about your success.",
    name: "Michael Chen",
    role: "Graduate, 2024"
  },
  {
    quote: "Best investment I've made in myself. The skills I learned are directly applicable to my daily work.",
    name: "Amara Okonkwo",
    role: "Graduate, 2023"
  }
];

export const CTA = forwardRef<HTMLElement>(function CTA(_, ref) {
  const { data: content } = useHomepageContent();

  const ctaTitle = content?.cta_title || "Ready to begin your journey?";
  const ctaSubtitle = content?.cta_subtitle || "Join thousands of professionals who have advanced their careers through our programs.";
  const ctaButtonText = content?.cta_button_text || "Apply Now — It's Free";
  const ctaButtonLink = content?.cta_button_link || "/register";
  const showTestimonials = content?.show_testimonials !== false;

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        
        {/* Testimonials */}
        {showTestimonials && (
          <div className="mb-24 lg:mb-32">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-accent" />
                <span className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
                  Success Stories
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Hear from our graduates
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-card p-8 rounded-2xl border border-border hover:border-accent/30 transition-all hover:shadow-lg"
                >
                  <Quote className="w-10 h-10 text-accent/20 mb-6" />
                  <p className="text-foreground text-lg leading-relaxed mb-8">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-white font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main CTA */}
        <div className="relative bg-foreground rounded-3xl p-12 lg:p-20 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
          
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-background leading-tight mb-6">
              {ctaTitle}
            </h2>
            <p className="text-xl text-background/70 mb-10 max-w-xl mx-auto">
              {ctaSubtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={ctaButtonLink}>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-14 text-base font-semibold group">
                  {ctaButtonText}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 rounded-full px-8 h-14 text-base font-semibold">
                  Browse Programs
                </Button>
              </Link>
            </div>

            <p className="mt-8 text-sm text-background/50">
              No credit card required • Start in minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";
