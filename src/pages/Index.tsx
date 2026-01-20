import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { ProgramsPreview } from "@/components/landing/ProgramsPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { useHomepageContent } from "@/hooks/useHomepageContent";

const Index = () => {
  const { data: content } = useHomepageContent();
  
  const showPrograms = content?.show_programs_section !== false;
  const showHowItWorks = content?.show_how_it_works !== false;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      {showPrograms && <ProgramsPreview />}
      <Features />
      {showHowItWorks && <HowItWorks />}
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
