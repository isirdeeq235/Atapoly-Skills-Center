import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowUpRight
} from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const footerLinks = {
  programs: [
    { label: "All Programs", href: "/programs" },
    { label: "How to Apply", href: "/register" },
    { label: "FAQs", href: "/faqs" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/faqs" },
    { label: "Student Portal", href: "/login" },
    { label: "Staff Login", href: "/admin-login" },
  ],
};

export const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  const { data: siteConfig } = useSiteConfig();
  const { data: homepageContent } = useHomepageContent();

  const footerAbout = homepageContent?.footer_about || "Empowering professionals with world-class training programs designed to accelerate your career growth.";

  return (
    <footer ref={ref} className="bg-foreground text-background">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-16 lg:py-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 lg:pr-12">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              {siteConfig?.logo_url ? (
                <img src={siteConfig.logo_url} alt={siteConfig.site_name} className="h-10 w-auto brightness-0 invert" />
              ) : (
                <span className="text-2xl font-bold">{siteConfig?.site_name || "Training Portal"}</span>
              )}
            </Link>
            <p className="text-background/60 leading-relaxed mb-8 max-w-sm">
              {footerAbout}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {siteConfig?.contact_email && (
                <a href={`mailto:${siteConfig.contact_email}`} className="flex items-center gap-3 text-background/60 hover:text-background transition-colors group">
                  <Mail className="w-5 h-5" />
                  <span>{siteConfig.contact_email}</span>
                </a>
              )}
              {siteConfig?.contact_phone && (
                <a href={`tel:${siteConfig.contact_phone}`} className="flex items-center gap-3 text-background/60 hover:text-background transition-colors group">
                  <Phone className="w-5 h-5" />
                  <span>{siteConfig.contact_phone}</span>
                </a>
              )}
              {siteConfig?.address && (
                <div className="flex items-start gap-3 text-background/60">
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{siteConfig.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-background mb-4">Programs</h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-background mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href}
                    className="text-background/60 hover:text-background transition-colors inline-flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} {siteConfig?.site_name || "Training Portal"}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="text-sm text-background/40 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-sm text-background/40 hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";
