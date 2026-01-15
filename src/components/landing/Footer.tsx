import { Link } from "react-router-dom";
import { GraduationCap, Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  programs: [
    { label: "All Programs", href: "/programs" },
    { label: "Web Development", href: "/programs" },
    { label: "Data Science", href: "/programs" },
    { label: "Project Management", href: "/programs" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Blog", href: "/blog" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "FAQs", href: "/faqs" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function Footer() {
  const { data: siteConfig } = useSiteConfig();

  return (
    <footer className="bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 pt-20 pb-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-accent-foreground" />
              </div>
              <span className="font-bold text-2xl">{siteConfig?.site_name || 'TrainHub'}</span>
            </Link>
            <p className="text-primary-foreground/70 mb-6 max-w-sm leading-relaxed">
              Empowering professionals to achieve their goals through world-class 
              training programs and expert guidance.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <p className="font-semibold">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-8">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg mb-5">Programs</h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg mb-5">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg mb-5">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-primary-foreground/70 hover:text-accent transition-colors flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-lg mb-5">Contact</h4>
            <ul className="space-y-4">
              {siteConfig?.contact_email && (
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-primary-foreground/70 text-sm">{siteConfig.contact_email}</span>
                </li>
              )}
              {siteConfig?.contact_phone && (
                <li className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-primary-foreground/70 text-sm">{siteConfig.contact_phone}</span>
                </li>
              )}
              {siteConfig?.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5" />
                  <span className="text-primary-foreground/70 text-sm">{siteConfig.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} {siteConfig?.site_name || 'TrainHub'}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-primary-foreground/50 hover:text-accent transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
