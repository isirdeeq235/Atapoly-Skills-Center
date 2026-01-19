import { forwardRef } from "react";
import { usePrograms } from "@/hooks/usePrograms";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Users, ArrowUpRight } from "lucide-react";

export const ProgramsPreview = forwardRef<HTMLElement>(function ProgramsPreview(_, ref) {
  const { data: programs, isLoading } = usePrograms();
  
  const featuredPrograms = programs?.slice(0, 3) || [];

  if (isLoading || featuredPrograms.length === 0) return null;

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-accent" />
              <span className="text-sm font-semibold text-accent uppercase tracking-[0.2em]">
                Our Programs
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Featured training programs
            </h2>
          </div>
          <Link to="/programs">
            <Button variant="outline" className="rounded-full group">
              View All Programs
              <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {featuredPrograms.map((program) => (
            <Link 
              key={program.id}
              to={`/programs`}
              className="group block"
            >
              <div className="bg-card rounded-2xl border border-border overflow-hidden hover:border-accent/30 hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <div className="aspect-[16/10] bg-gradient-to-br from-primary/10 to-accent/10 relative overflow-hidden">
                  {program.image_url ? (
                    <img 
                      src={program.image_url} 
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-bold text-muted-foreground/20">
                        {program.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Status badge */}
                  <div className="absolute top-4 left-4 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                    Open for Enrollment
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-accent transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {program.description}
                  </p>
                  
                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {program.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {program.enrolled_count} enrolled
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
});

ProgramsPreview.displayName = "ProgramsPreview";
