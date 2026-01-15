import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Loader2 } from "lucide-react";
import { usePrograms } from "@/hooks/usePrograms";
import { useState, useMemo } from "react";

const Programs = () => {
  const { data: programs, isLoading, error } = usePrograms();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrograms = useMemo(() => {
    if (!programs) return [];
    if (!searchQuery.trim()) return programs;
    
    const query = searchQuery.toLowerCase();
    return programs.filter(program => 
      program.title.toLowerCase().includes(query) ||
      program.description?.toLowerCase().includes(query)
    );
  }, [programs, searchQuery]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white py-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Our Training Programs
            </h1>
            <p className="text-lg text-white/80 mb-8">
              Discover world-class training programs designed to accelerate your career 
              and equip you with in-demand skills.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  placeholder="Search programs..." 
                  className="pl-10 bg-white border-0 h-12"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="hero" size="lg" className="h-12">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Available Programs</h2>
              <p className="text-muted-foreground">
                {isLoading ? 'Loading...' : `${filteredPrograms.length} programs available`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-destructive">Failed to load programs. Please try again.</p>
            </div>
          ) : filteredPrograms.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">
                {searchQuery ? 'No programs found matching your search.' : 'No programs available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPrograms.map((program) => (
                <ProgramCard 
                  key={program.id} 
                  id={program.id}
                  title={program.title}
                  description={program.description || ''}
                  duration={program.duration || 'TBD'}
                  enrolledCount={program.enrolled_count}
                  maxCapacity={program.max_capacity || 0}
                  applicationFee={formatCurrency(program.application_fee)}
                  status={
                    program.status === 'published' 
                      ? (program.max_capacity && program.enrolled_count >= program.max_capacity ? 'closed' : 'open')
                      : 'coming-soon'
                  }
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
