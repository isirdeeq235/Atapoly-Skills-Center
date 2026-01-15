import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import heroBackground from "@/assets/hero-background.jpg";
import { useState, useEffect } from "react";

const defaultFeatures = [
  "Role-based access control",
  "Automated payment processing",
  "Digital certificates & ID cards",
];

export function Hero() {
  const { data: slides, isLoading: slidesLoading } = useHeroSlides();
  const { data: siteConfig } = useSiteConfig();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    title: 'Transform Your Training Management Experience',
    subtitle: 'A complete platform for managing training programs, tracking progress, processing payments, and empowering learners to achieve their goals.',
    cta_text: 'Start Your Journey',
    cta_link: '/register',
    image_url: null,
  }];

  // Auto-advance slides
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const currentSlideData = activeSlides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ backgroundImage: `url(${currentSlideData?.image_url || heroBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/90 to-primary/80" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      </div>

      {/* Slide Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            <span className="text-sm text-white/90">Trusted by 10,000+ trainees worldwide</span>
          </div>

          {/* Main Heading - Dynamic from slides */}
          <h1 
            key={currentSlide}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-slide-up"
          >
            {currentSlideData?.title?.split(' ').slice(0, 3).join(' ')}
            <br />
            <span className="text-accent">
              {currentSlideData?.title?.split(' ').slice(3).join(' ')}
            </span>
          </h1>

          {/* Subheading - Dynamic from slides */}
          <p 
            key={`subtitle-${currentSlide}`}
            className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto animate-slide-up" 
            style={{ animationDelay: "0.1s" }}
          >
            {currentSlideData?.subtitle}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {defaultFeatures.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm text-white/90">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Link to={currentSlideData?.cta_link || "/register"}>
              <Button variant="hero" size="xl" className="group">
                {currentSlideData?.cta_text || "Start Your Journey"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="hero-outline" size="xl" className="group">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Slide Indicators */}
          {activeSlides.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-accent w-8' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {[
              { value: "50+", label: "Training Programs" },
              { value: "10K+", label: "Certified Trainees" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
