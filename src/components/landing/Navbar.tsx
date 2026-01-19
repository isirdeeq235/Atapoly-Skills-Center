import { useState, useEffect, forwardRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const Navbar = forwardRef<HTMLElement>(function Navbar(_, ref) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: siteConfig } = useSiteConfig();
  const { user, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    return role === 'trainee' ? '/dashboard' : '/admin';
  };

  return (
    <header ref={ref} className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-background/95 backdrop-blur-lg shadow-lg border-b border-border" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            {siteConfig?.logo_url ? (
              <img src={siteConfig.logo_url} alt={siteConfig.site_name} className="w-10 h-10 rounded-lg object-contain transition-transform group-hover:scale-105" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
                <GraduationCap className="w-6 h-6 text-accent-foreground" />
              </div>
            )}
            <span className={cn("font-bold text-xl transition-colors", isScrolled ? "text-foreground" : "text-white")}>
              {siteConfig?.site_name || 'TrainHub'}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className={cn(
                "text-sm font-medium transition-all relative group",
                isScrolled ? "text-muted-foreground hover:text-foreground" : "text-white/80 hover:text-white",
                location.pathname === link.href && "text-accent"
              )}>
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300",
                  location.pathname === link.href ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <Link to={getDashboardLink()}>
                <Button variant={isScrolled ? "default" : "hero"} className="transition-transform hover:scale-105">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login"><Button variant="ghost" className={cn("transition-all", isScrolled ? "" : "text-white hover:bg-white/10")}>Sign In</Button></Link>
                <Link to="/register"><Button variant={isScrolled ? "default" : "hero"} className="transition-transform hover:scale-105">Get Started</Button></Link>
              </>
            )}
          </div>

          <button className={cn("md:hidden p-2 transition-colors", isScrolled ? "text-foreground" : "text-white")} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border bg-background animate-slide-up">
            {navLinks.map((link) => (
              <Link key={link.href} to={link.href} className="block px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors rounded-lg mx-2" onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
            ))}
            <div className="flex flex-col gap-2 px-4 pt-4 border-t border-border mt-2">
              {user ? (
                <Link to={getDashboardLink()}><Button className="w-full">Dashboard</Button></Link>
              ) : (
                <>
                  <Link to="/login"><Button variant="outline" className="w-full">Sign In</Button></Link>
                  <Link to="/register"><Button className="w-full">Get Started</Button></Link>
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
