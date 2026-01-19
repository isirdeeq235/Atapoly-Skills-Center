import { forwardRef } from "react";
import { 
  GraduationCap, 
  CreditCard, 
  Users, 
  FileText, 
  Shield, 
  BarChart3,
  Mail,
  QrCode,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GraduationCap,
    title: "Program Management",
    description: "Create and manage training programs with comprehensive curriculum and schedules.",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Four user roles with tailored dashboards for Admins, Instructors, and Trainees.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description: "Seamless payment processing with Paystack and Flutterwave integration.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Automated Receipts",
    description: "Generate professional PDF receipts automatically upon payment confirmation.",
    gradient: "from-orange-500 to-amber-600",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with encrypted data and audit logs.",
    gradient: "from-rose-500 to-red-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track trainee progress, payments, and program performance visually.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Automated alerts for application status and payment confirmations.",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    icon: QrCode,
    title: "Digital ID Cards",
    description: "Generate unique digital ID cards with QR codes for verification.",
    gradient: "from-amber-500 to-orange-600",
  },
];

export const Features = forwardRef<HTMLElement>(function Features(_, ref) {
  return (
    <section ref={ref} className="py-32 bg-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.015]" 
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-6 py-2.5 mb-8">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-accent">Powerful Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
            Everything You Need for
            <span className="text-accent block mt-2">Modern Training Excellence</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From enrollment to certification, we've built the complete platform 
            to deliver exceptional training experiences.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`group relative p-8 bg-card rounded-3xl border border-border hover:border-accent/30 transition-all duration-500 overflow-hidden ${
                index === 0 || index === 5 ? 'lg:col-span-2' : ''
              }`}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
              
              {/* Subtle glow on hover */}
              <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-20">
          <Link to="/programs">
            <Button size="lg" variant="outline" className="group text-lg px-8 py-6 rounded-full border-2 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all">
              Explore All Features
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});

Features.displayName = "Features";
