import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle, Star, Users, Award } from "lucide-react";

const benefits = [
  { icon: CheckCircle, text: "No credit card required" },
  { icon: Star, text: "Industry-recognized certificates" },
  { icon: Users, text: "Join 10,000+ graduates" },
];

const stats = [
  { value: "50+", label: "Programs" },
  { value: "10K+", label: "Graduates" },
  { value: "98%", label: "Success Rate" },
];

export const CTA = forwardRef<HTMLElement>(function CTA(_, ref) {
  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-primary via-primary to-primary/95 p-16 md:p-24">
          {/* Background decorations */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-accent/40 rounded-full blur-[120px]" />
            <div className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]" />
            
            {/* Animated grid pattern */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }} />
            
            {/* Floating shapes */}
            <div className="absolute top-20 right-20 w-20 h-20 border border-white/10 rounded-2xl rotate-12 animate-float" />
            <div className="absolute bottom-32 left-20 w-16 h-16 border border-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-accent/20 rounded-xl rotate-45 animate-float" style={{ animationDelay: '2s' }} />
          </div>

          {/* Content */}
          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3 mb-10 shadow-lg">
              <Sparkles className="w-5 h-5 text-accent" />
              <span className="text-sm font-semibold text-white tracking-wide">Limited Time — Enroll Now</span>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-8 leading-tight tracking-tight">
              Ready to Transform
              <span className="text-accent block mt-2">Your Career?</span>
            </h2>

            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
              Join thousands of professionals who have accelerated their careers 
              through our world-class training programs.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/10">
                  <benefit.icon className="w-5 h-5 text-accent" />
                  <span className="text-sm font-medium text-white">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link to="/register">
                <Button size="xl" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl shadow-accent/40 group text-lg px-10 py-7 rounded-full">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/programs">
                <Button size="xl" variant="outline" className="border-2 border-white/30 text-white hover:bg-white/10 text-lg px-10 py-7 rounded-full backdrop-blur-sm">
                  View Programs
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="flex flex-wrap justify-center gap-12 md:gap-20">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-white/60 font-medium tracking-wide uppercase">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-12">
              <p className="text-sm text-white/40 mb-6 tracking-wide uppercase">Trusted by leading organizations</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12">
                {['TechCorp', 'EduGlobal', 'LearnFirst', 'SkillMaster'].map((company, i) => (
                  <div key={i} className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors">
                    <Award className="w-5 h-5" />
                    <span className="font-semibold tracking-wide">{company}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

CTA.displayName = "CTA";
