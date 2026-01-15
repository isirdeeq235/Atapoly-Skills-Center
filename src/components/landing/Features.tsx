import { 
  GraduationCap, 
  CreditCard, 
  Users, 
  FileText, 
  Shield, 
  BarChart3,
  Mail,
  QrCode,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: GraduationCap,
    title: "Program Management",
    description: "Create and manage training programs with comprehensive curriculum and schedules.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Four user roles with tailored dashboards for Admins, Instructors, and Trainees.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description: "Seamless payment processing with Paystack and Flutterwave integration.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: FileText,
    title: "Automated Receipts",
    description: "Generate professional PDF receipts automatically upon payment confirmation.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with encrypted data and audit logs.",
    color: "from-red-500 to-red-600",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track trainee progress, payments, and program performance visually.",
    color: "from-cyan-500 to-cyan-600",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Automated alerts for application status and payment confirmations.",
    color: "from-pink-500 to-pink-600",
  },
  {
    icon: QrCode,
    title: "Digital ID Cards",
    description: "Generate unique digital ID cards with QR codes for verification.",
    color: "from-amber-500 to-amber-600",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-5 py-2 mb-6">
            <span className="text-sm font-semibold text-accent">Why Choose Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="block text-accent">Modern Training</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to deliver exceptional training experiences, 
            from enrollment to certification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative p-6 bg-card rounded-2xl border border-border hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-500 card-hover"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 shadow-lg`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-accent transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to="/programs">
            <Button size="lg" variant="outline" className="group">
              Explore All Features
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
