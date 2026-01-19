import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { 
  GraduationCap, 
  Users, 
  Award, 
  Target, 
  Heart, 
  Lightbulb, 
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";

const stats = [
  { value: "10,000+", label: "Graduates", icon: GraduationCap },
  { value: "50+", label: "Programs", icon: Award },
  { value: "98%", label: "Success Rate", icon: Target },
  { value: "15+", label: "Years Experience", icon: Star },
];

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "We are committed to delivering the highest quality training programs that exceed industry standards."
  },
  {
    icon: Heart,
    title: "Integrity",
    description: "We operate with transparency and honesty in all our interactions with students and partners."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously evolve our curriculum to incorporate the latest industry trends and technologies."
  },
  {
    icon: Users,
    title: "Community",
    description: "We foster a supportive learning environment where students can grow and network together."
  },
];

const benefits = [
  "Industry-recognized certifications",
  "Hands-on practical training",
  "Expert instructors with real-world experience",
  "Flexible learning schedules",
  "Career guidance and job placement support",
  "Lifetime access to learning resources",
];

const About = () => {
  const { data: siteConfig } = useSiteConfig();
  const siteName = siteConfig?.site_name || 'TrainHub';

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-[150px]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center py-12">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Award className="w-4 h-4 text-accent" />
              <span className="text-sm text-white/90">About Us</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Empowering Careers Through Excellence
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              {siteName} is dedicated to transforming lives by providing world-class 
              training programs that prepare professionals for success in their careers.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center card-hover border-0 shadow-lg">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                At {siteName}, we believe that everyone deserves access to quality education 
                that can transform their professional journey. Our mission is to bridge the 
                gap between traditional education and industry requirements.
              </p>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                We partner with industry leaders to develop curriculum that is relevant, 
                practical, and immediately applicable in the workplace. Our graduates leave 
                with not just knowledge, but with the confidence and skills to excel.
              </p>
              <Link to="/programs">
                <Button size="lg" className="group">
                  Explore Programs
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Why Choose Us?</h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-[60px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do and shape the experience we provide to our students.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card key={index} className="card-hover border-0 shadow-lg group">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <value.icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-4 relative text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with {siteName}.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
