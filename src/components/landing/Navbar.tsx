import { forwardRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = forwardRef<HTMLElement>(function Navbar(_, ref) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: siteConfig } = useSiteConfig();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {siteConfig?.logo_url ? (
              <img 
                src={siteConfig.logo_url} 
                alt={siteConfig.site_name || "Logo"} 
                className="h-10 w-auto"
              />
            ) : (
              <span className="text-xl font-bold text-foreground">
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
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
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
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-full px-6">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-base font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              {user ? (
                <Button 
                  onClick={() => {
                    navigate(getDashboardLink());
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
});

Navbar.displayName = "Navbar";
