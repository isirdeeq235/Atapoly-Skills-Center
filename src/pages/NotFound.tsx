import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background flex items-center justify-center p-4">
      <div className="text-center max-w-lg animate-fade-in">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="text-[10rem] md:text-[14rem] font-bold text-primary/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-accent/10 flex items-center justify-center animate-pulse-soft">
              <Search className="w-12 h-12 md:w-16 md:h-16 text-accent" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto group">
              <Home className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Back to Home
            </Button>
          </Link>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try one of these pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { label: "Programs", href: "/programs" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
              { label: "Sign In", href: "/login" },
            ].map((link) => (
              <Link 
                key={link.href} 
                to={link.href}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
