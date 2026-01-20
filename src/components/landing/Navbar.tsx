import { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faqs", label: "FAQs" },
];

export const Navbar = forwardRef<HTMLElement>(function Navbar(_, ref) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: siteConfig } = useSiteConfig();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (role === 'super_admin' || role === 'admin') return '/admin';
    if (role === 'instructor') return '/instructor';
    return '/dashboard';
  };

  return (
    <header
      ref={ref}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-lg shadow-foreground/5" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {siteConfig?.logo_url ? (
              <img 
                src={siteConfig.logo_url} 
                alt={siteConfig.site_name || "Logo"} 
                className="h-10 lg:h-12 w-auto transition-transform group-hover:scale-105"
              />
            ) : (
              <span className={`text-xl lg:text-2xl font-bold transition-colors ${
                isScrolled ? 'text-foreground' : 'text-background'
              }`}>
                {siteConfig?.site_name || "Training Portal"}
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 text-sm font-medium transition-all rounded-full ${
                  isScrolled 
                    ? 'text-muted-foreground hover:text-foreground hover:bg-secondary' 
                    : 'text-background/80 hover:text-background hover:bg-background/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Button 
                onClick={() => navigate(getDashboardLink())}
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-11 font-semibold group"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    className={`rounded-full px-6 h-11 font-medium ${
                      isScrolled 
                        ? 'text-foreground hover:bg-secondary' 
                        : 'text-background/90 hover:text-background hover:bg-background/10'
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full px-6 h-11 font-semibold shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30 transition-all">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2.5 rounded-full transition-all ${
              isScrolled 
                ? 'text-foreground hover:bg-secondary' 
                : 'text-background hover:bg-background/10'
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl animate-fade-in">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-accent hover:bg-secondary rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex flex-col gap-3 pt-4 mt-4 border-t border-border">
                {user ? (
                  <Button 
                    onClick={() => {
                      navigate(getDashboardLink());
                      setIsMobileMenuOpen(false);
                    }}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold"
                  >
                    Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-full h-12 font-medium">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 font-semibold">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar";
