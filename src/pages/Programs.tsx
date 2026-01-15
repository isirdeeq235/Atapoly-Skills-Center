import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ProgramCard } from "@/components/programs/ProgramCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

const programs = [
  {
    id: "1",
    title: "Full Stack Web Development",
    description: "Master modern web development with React, Node.js, and cloud technologies. Build production-ready applications from scratch.",
    duration: "6 months",
    enrolledCount: 45,
    maxCapacity: 50,
    applicationFee: "₦25,000",
    status: "open" as const,
  },
  {
    id: "2",
    title: "Data Science & Machine Learning",
    description: "Learn data analysis, statistical modeling, and machine learning using Python, TensorFlow, and industry-standard tools.",
    duration: "8 months",
    enrolledCount: 30,
    maxCapacity: 40,
    applicationFee: "₦35,000",
    status: "open" as const,
  },
  {
    id: "3",
    title: "Project Management Professional",
    description: "Develop essential project management skills with Agile, Scrum, and PMP preparation. Lead teams to success.",
    duration: "3 months",
    enrolledCount: 25,
    maxCapacity: 30,
    applicationFee: "₦20,000",
    status: "open" as const,
  },
  {
    id: "4",
    title: "UI/UX Design Masterclass",
    description: "Create stunning user interfaces and seamless user experiences. Master Figma, design systems, and user research.",
    duration: "4 months",
    enrolledCount: 35,
    maxCapacity: 35,
    applicationFee: "₦22,000",
    status: "closed" as const,
  },
  {
    id: "5",
    title: "Digital Marketing & Growth",
    description: "Drive business growth with SEO, social media marketing, content strategy, and performance analytics.",
    duration: "3 months",
    enrolledCount: 0,
    maxCapacity: 40,
    applicationFee: "₦18,000",
    status: "coming-soon" as const,
  },
  {
    id: "6",
    title: "Cybersecurity Fundamentals",
    description: "Protect digital assets with ethical hacking, network security, and incident response skills. Industry certifications included.",
    duration: "5 months",
    enrolledCount: 28,
    maxCapacity: 30,
    applicationFee: "₦30,000",
    status: "open" as const,
  },
];

const Programs = () => {
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
              <p className="text-muted-foreground">{programs.length} programs available</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program) => (
              <ProgramCard key={program.id} {...program} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Programs;
