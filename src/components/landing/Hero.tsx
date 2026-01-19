import { forwardRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import heroBackground from "@/assets/hero-background.jpg";

export const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  const { data: slides } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    title: 'Master New Skills. Advance Your Career.',
    subtitle: 'Professional training programs designed by industry experts to help you succeed in today\'s competitive world.',
    cta_text: 'Apply Now',
    cta_link: '/register',
    image_url: null,
  }];

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const currentSlideData = activeSlides[currentSlide];

  return (
    <section ref={ref} className="relative min-h-screen bg-background overflow-hidden">
      {/* Main Grid Layout */}
      <div className="container mx-auto px-4 pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[70vh]">
          
          {/* Left Content */}
          <div className="order-2 lg:order-1">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
                Professional Training
              </span>
            </div>

            {/* Main Heading */}
            <h1 
              key={currentSlide}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[0.95] tracking-tight mb-8"
            >
              {currentSlideData?.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground max-w-lg leading-relaxed mb-10">
              {currentSlideData?.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <Link to={currentSlideData?.cta_link || "/register"}>
                <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-14 text-base font-semibold group">
                  {currentSlideData?.cta_text || "Get Started"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button variant="ghost" size="lg" className="rounded-full px-8 h-14 text-base font-semibold group">
                  View Programs
                  <ArrowUpRight className="w-5 h-5 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-12 pt-8 border-t border-border">
              {[
                { value: "50+", label: "Programs" },
                { value: "10K+", label: "Graduates" },
                { value: "98%", label: "Success" },
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-3xl overflow-hidden">
              <img 
                src={currentSlideData?.image_url || heroBackground}
                alt="Training"
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
              
              {/* Play button overlay */}
              <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group">
                <Play className="w-8 h-8 text-foreground ml-1 group-hover:scale-110 transition-transform" fill="currentColor" />
              </button>

              {/* Floating badge */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Next cohort starts</p>
                    <p className="text-lg font-bold text-foreground">February 2026</p>
                  </div>
                  <Link to="/programs">
                    <Button size="sm" variant="outline" className="rounded-full">
                      View Schedule
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-foreground w-8' : 'bg-foreground/20 w-2 hover:bg-foreground/40'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
});

Hero.displayName = "Hero";
