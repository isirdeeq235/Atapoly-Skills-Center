import { 
  GraduationCap, 
  CreditCard, 
  Users, 
  FileText, 
  Shield, 
  BarChart3,
  Mail,
  QrCode
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Program Management",
    description: "Create and manage training programs with comprehensive curriculum, schedules, and instructor assignments.",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Four distinct user roles with tailored dashboards and permissions for Super Admins, Admins, Instructors, and Trainees.",
  },
  {
    icon: CreditCard,
    title: "Integrated Payments",
    description: "Seamless payment processing with Paystack and Flutterwave for application and registration fees.",
  },
  {
    icon: FileText,
    title: "Automated Receipts",
    description: "Generate professional PDF receipts automatically upon payment confirmation with unique receipt numbers.",
  },
  {
    icon: Shield,
    title: "Secure & Compliant",
    description: "Enterprise-grade security with encrypted data, secure authentication, and comprehensive audit logs.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track trainee progress, payment statistics, and program performance with visual reports.",
  },
  {
    icon: Mail,
    title: "Email Notifications",
    description: "Automated email alerts for application status, payment confirmations, and important updates.",
  },
  {
    icon: QrCode,
    title: "Digital ID Cards",
    description: "Generate unique digital ID cards with QR codes for easy verification and access control.",
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-4">
            <span className="text-sm font-medium text-accent">Powerful Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to Manage Training Programs
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete suite of tools designed to streamline your training operations, 
            from enrollment to certification.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group p-6 bg-card rounded-xl border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 card-hover"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
