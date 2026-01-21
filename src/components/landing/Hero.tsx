import { forwardRef, useState, useEffect, memo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, ChevronDown, Star } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";

// Memoized trust indicator avatars
const TrustAvatars = memo(() => (
  <div className="flex -space-x-2">
    {['JD', 'MK', 'AS', 'RN'].map((initials, i) => (
      <div 
        key={i} 
        className="w-10 h-10 rounded-full border-2 border-background bg-gradient-to-br from-accent to-primary flex items-center justify-center text-xs font-bold text-white"
      >
        {initials}
      </div>
    ))}
    <div className="w-10 h-10 rounded-full border-2 border-background bg-foreground flex items-center justify-center text-xs font-medium text-background">
      +10K
    </div>
  </div>
));
TrustAvatars.displayName = "TrustAvatars";

// Memoized stats cards
const StatsCards = memo(({ isVisible }: { isVisible: boolean }) => (
  <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2">
    <div className="flex flex-col gap-4">
      {[
        { value: "98%", label: "Completion Rate" },
        { value: "15+", label: "Industry Partners" },
        { value: "50+", label: "Programs" },
      ].map((stat, index) => (
        <div 
          key={index}
          className={`glass-dark rounded-2xl p-5 backdrop-blur-xl border border-background/10 min-w-[160px] transition-all duration-300 hover:scale-105 ${
            isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
          }`}
          style={{ transitionDelay: `${150 + index * 50}ms` }}
        >
          <div className="text-3xl font-bold text-accent mb-1">{stat.value}</div>
          <div className="text-sm text-background/60">{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
));
StatsCards.displayName = "StatsCards";

export const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  const { data: slides } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    title: 'Transform Your Future Through Expert Training',
    subtitle: 'Join thousands of professionals mastering in-demand skills with our industry-leading certification programs.',
    cta_text: 'Start Learning Today',
    cta_link: '/register',
    image_url: null,
  }];

  useEffect(() => {
    // Immediate visibility for faster perceived load
    requestAnimationFrame(() => setIsVisible(true));
    
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const currentSlideData = activeSlides[currentSlide];
  const backgroundImage = currentSlideData?.image_url;

  const scrollToNext = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section ref={ref} className="relative min-h-screen overflow-hidden">
      {/* Full-screen background with optimized loading */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <img 
            src={backgroundImage}
            alt=""
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-foreground via-foreground/95 to-primary/20" />
        )}
        {/* Layered gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/95 via-foreground/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-foreground/30" />
      </div>

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center pt-20 lg:pt-0">
        <div className="max-w-4xl">
          {/* Animated badge */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm border border-accent/30 mb-8 transition-all duration-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-background/90">Enrollment now open for 2026 cohorts</span>
          </div>

          {/* Main headline with fast animation */}
          <h1 
            key={currentSlide}
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-background leading-[1.05] tracking-tight mb-6 transition-all duration-300 delay-75 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {currentSlideData?.title?.split(' ').map((word, i) => (
              <span 
                key={i} 
                className={`inline-block mr-[0.3em] ${
                  i === 1 || i === 2 ? 'text-accent' : ''
                }`}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          <p 
            className={`text-lg md:text-xl lg:text-2xl text-background/70 max-w-2xl leading-relaxed mb-10 transition-all duration-300 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {currentSlideData?.subtitle}
          </p>

          {/* CTA Section */}
          <div 
            className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16 transition-all duration-300 delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <Link to={currentSlideData?.cta_link || "/register"}>
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-8 h-14 text-base font-semibold group shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all"
              >
                {currentSlideData?.cta_text || "Get Started"}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/programs">
              <Button 
                variant="ghost" 
                size="lg" 
                className="text-background/90 hover:text-background hover:bg-background/10 rounded-full px-8 h-14 text-base font-semibold border border-background/20"
              >
                Explore Programs
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div 
            className={`flex flex-wrap items-center gap-8 pt-8 border-t border-background/10 transition-all duration-300 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-accent fill-accent" />
              ))}
              <span className="ml-2 text-sm text-background/70">4.9/5 from 2,000+ reviews</span>
            </div>
            <div className="h-6 w-px bg-background/20 hidden sm:block" />
            <TrustAvatars />
            <span className="text-sm text-background/70">Graduates worldwide</span>
          </div>
        </div>

        {/* Floating stats cards */}
        <StatsCards isVisible={isVisible} />
      </div>

      {/* Slide indicators */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {activeSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-accent w-12' 
                  : 'bg-background/30 w-6 hover:bg-background/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll indicator */}
      <button 
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-background/50 hover:text-background/80 transition-colors z-20"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </button>
    </section>
  );
});

Hero.displayName = "Hero";
