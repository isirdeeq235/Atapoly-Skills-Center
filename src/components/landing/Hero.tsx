import { forwardRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, ChevronLeft, ChevronRight, Star, Award, Zap, Users, CheckCircle } from "lucide-react";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import heroBackground from "@/assets/hero-background.jpg";

const defaultFeatures = [
  { icon: Star, text: "Industry-leading programs" },
  { icon: Award, text: "Certified instructors" },
  { icon: Zap, text: "Fast-track your career" },
];

export const Hero = forwardRef<HTMLElement>(function Hero(_, ref) {
  const { data: slides, isLoading: slidesLoading } = useHeroSlides();
  const [currentSlide, setCurrentSlide] = useState(0);

  const activeSlides = slides && slides.length > 0 ? slides : [{
    id: 'default',
    title: 'Transform Your Future With World-Class Training',
    subtitle: 'Join thousands of professionals who have accelerated their careers through our comprehensive, industry-recognized programs.',
    cta_text: 'Start Your Journey',
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
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden -mt-16 pt-16">
      {/* Dynamic Background with Parallax Effect */}
      <div className="absolute inset-0 -top-16">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
          style={{ backgroundImage: `url(${currentSlideData?.image_url || heroBackground})` }}
        />
        {/* Sophisticated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Animated mesh pattern */}
        <div className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-accent/20 rounded-full blur-[100px] animate-pulse-soft" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-pulse-soft" style={{ animationDelay: '1s' }} />

      {/* Slide Navigation */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
            className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all flex items-center justify-center group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % activeSlides.length)}
            className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:scale-110 transition-all flex items-center justify-center group"
          >
            <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-left">
            {/* Animated Status Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-10 animate-fade-in shadow-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
              </span>
              <span className="text-sm font-semibold text-white tracking-wide">🎓 Now Enrolling — 2026 Programs</span>
            </div>

            {/* Dynamic Heading */}
            <h1 
              key={currentSlide}
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-8 leading-[1.05] animate-slide-up tracking-tight"
            >
              {currentSlideData?.title?.split(' ').slice(0, -2).join(' ')}
              <span className="text-accent block mt-2">
                {currentSlideData?.title?.split(' ').slice(-2).join(' ')}
              </span>
            </h1>

            {/* Subtitle */}
            <p 
              key={`subtitle-${currentSlide}`}
              className="text-xl md:text-2xl text-white/80 mb-10 max-w-2xl leading-relaxed animate-slide-up font-light" 
              style={{ animationDelay: "0.1s" }}
            >
              {currentSlideData?.subtitle}
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              {defaultFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2.5 border border-white/10 hover:bg-white/15 transition-all"
                >
                  <feature.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link to={currentSlideData?.cta_link || "/register"}>
                <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl shadow-accent/30 group text-lg px-8 py-6">
                  {currentSlideData?.cta_text || "Start Your Journey"}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="xl" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  Explore Programs
                </Button>
              </Link>
            </div>

            {/* Slide Indicators */}
            {activeSlides.length > 1 && (
              <div className="flex gap-3 mt-12">
                {activeSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-accent w-12' : 'bg-white/30 w-8 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Premium Stats Card */}
          <div className="hidden lg:block relative animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <div className="relative">
              {/* Main Stats Card */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-10 shadow-2xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Why Choose Us?</h3>
                  <p className="text-white/60">Trusted by thousands of professionals</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: "50+", label: "Training Programs", icon: Star },
                    { value: "10K+", label: "Certified Graduates", icon: Users },
                    { value: "98%", label: "Success Rate", icon: CheckCircle },
                    { value: "24/7", label: "Learning Support", icon: Award },
                  ].map((stat, index) => (
                    <div 
                      key={index} 
                      className="text-center p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 group"
                    >
                      <stat.icon className="w-8 h-8 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Card 1 - Top Right */}
              <div className="absolute -top-8 -right-8 bg-accent text-accent-foreground rounded-2xl p-5 shadow-2xl shadow-accent/30 animate-float">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Certified</p>
                    <p className="text-sm opacity-90">Industry Standard</p>
                  </div>
                </div>
              </div>

              {/* Floating Card 2 - Bottom Left */}
              <div className="absolute -bottom-6 -left-8 bg-white text-foreground rounded-2xl p-5 shadow-2xl animate-float" style={{ animationDelay: "0.5s" }}>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-white shadow-lg" />
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-lg">+500</p>
                    <p className="text-sm text-muted-foreground">Joined this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";
