import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Play, ChevronLeft, ChevronRight, Star, Award, Zap } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import heroBackground from "@/assets/hero-background.jpg";
import { useState, useEffect } from "react";

const defaultFeatures = [
  { icon: Star, text: "Industry-leading programs" },
  { icon: Award, text: "Certified instructors" },
  { icon: Zap, text: "Fast-track your career" },
];

export function Hero() {
  const { data: slides, isLoading: slidesLoading } = useHeroSlides();
  const { data: siteConfig } = useSiteConfig();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    title: 'Unlock Your Potential With Expert Training',
    subtitle: 'Join thousands of professionals who have transformed their careers through our comprehensive training programs.',
    cta_text: 'Start Learning Today',
    cta_link: '/register',
    image_url: null,
  }];

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const currentSlideData = activeSlides[currentSlide];

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
          style={{ backgroundImage: `url(${currentSlideData?.image_url || heroBackground})` }}
        />
        {/* Multi-layer gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-transparent to-primary/50" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px]" />
        
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Slide Navigation */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all flex items-center justify-center group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              <span className="text-sm font-medium text-white/90">Now enrolling for 2026 programs</span>
            </div>

            {/* Dynamic Heading */}
            <h1 
              key={currentSlide}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-[1.1] animate-slide-up"
            >
              {currentSlideData?.title}
            </h1>

            {/* Subtitle */}
            <p 
              key={`subtitle-${currentSlide}`}
              className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed animate-slide-up" 
              style={{ animationDelay: "0.1s" }}
            >
              {currentSlideData?.subtitle}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mb-10 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {defaultFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10"
                >
                  <feature.icon className="w-4 h-4 text-accent" />
                  <span className="text-sm text-white/90">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link to={currentSlideData?.cta_link || "/register"}>
                <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/25 group">
                  {currentSlideData?.cta_text || "Start Learning Today"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Programs
                </Button>
              </Link>
            </div>

            {/* Slide Indicators */}
            {activeSlides.length > 1 && (
              <div className="flex gap-2 mt-10">
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-accent w-10' : 'bg-white/30 w-6 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Stats Cards */}
          <div className="hidden lg:block relative animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Main Stats Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "50+", label: "Training Programs", color: "text-accent" },
                    { value: "10K+", label: "Certified Graduates", color: "text-white" },
                    { value: "98%", label: "Success Rate", color: "text-accent" },
                    { value: "24/7", label: "Learning Support", color: "text-white" },
                  ].map((stat, index) => (
                    <div key={index} className="text-center p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                      <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card 1 */}
              <div className="absolute -top-6 -right-6 bg-accent text-accent-foreground rounded-2xl p-4 shadow-xl animate-float">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8" />
                  <div>
                    <p className="font-bold">Certified</p>
                    <p className="text-sm opacity-90">Industry Standard</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 */}
              <div className="absolute -bottom-4 -left-6 bg-white text-foreground rounded-2xl p-4 shadow-xl animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-sm">+500</p>
                    <p className="text-xs text-muted-foreground">Joined this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 100L48 93.3C96 86.7 192 73.3 288 66.7C384 60 480 60 576 63.3C672 66.7 768 73.3 864 76.7C960 80 1056 80 1152 73.3C1248 66.7 1344 53.3 1392 46.7L1440 40V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
}
