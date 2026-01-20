import { forwardRef, useEffect, useRef, useState } from "react";
import { usePrograms } from "@/hooks/usePrograms";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, GraduationCap, Sparkles } from "lucide-react";

export const ProgramsPreview = forwardRef<HTMLElement>(function ProgramsPreview(_, ref) {
  const { data: programs, isLoading } = usePrograms();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const featuredPrograms = programs?.slice(0, 3) || [];

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

  if (isLoading || featuredPrograms.length === 0) return null;

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-[80px]" />

      <div ref={sectionRef} className="container mx-auto px-4 relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <div 
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-accent">Featured Programs</span>
            </div>
            <h2 
              className={`text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight transition-all duration-700 delay-100 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Invest in your future
            </h2>
          </div>
          <div 
            className={`transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link to="/programs">
              <Button className="rounded-full group bg-foreground text-background hover:bg-foreground/90 px-6">
                View All Programs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredPrograms.map((program, index) => (
            <Link 
              key={program.id}
              to={`/programs`}
              className={`group block transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${300 + index * 100}ms` }}
            >
              <div className="relative bg-card rounded-3xl border border-border overflow-hidden hover:border-accent/40 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/10 hover:-translate-y-2">
                {/* Image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-accent/20 via-primary/10 to-accent/5 relative overflow-hidden">
                  {program.image_url ? (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 rounded-2xl bg-accent/20 flex items-center justify-center">
                        <GraduationCap className="w-10 h-10 text-accent/60" />
                      </div>
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                  
                  {/* Status badge */}
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Open for Enrollment
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:p-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                    {program.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-accent" />
                        {program.duration}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-accent" />
                        {program.enrolled_count} enrolled
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent transition-colors">
                      <ArrowRight className="w-5 h-5 text-accent group-hover:text-accent-foreground group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Trust banner */}
        <div 
          className={`mt-16 text-center transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-muted-foreground">
            Trusted by <span className="text-foreground font-semibold">10,000+</span> professionals from leading organizations
          </p>
        </div>
      </div>
    </section>
  );
});

ProgramsPreview.displayName = "ProgramsPreview";
