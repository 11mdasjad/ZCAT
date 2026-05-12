import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import HeroSection from '@/components/landing/HeroSection';
import TrustedSection from '@/components/landing/TrustedSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ProctoringSection from '@/components/landing/ProctoringSection';
import CodeEditorSection from '@/components/landing/CodeEditorSection';
import StatsSection from '@/components/landing/StatsSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import ContactSection from '@/components/landing/ContactSection';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <TrustedSection />
        <FeaturesSection />
        <ProctoringSection />
        <CodeEditorSection />
        <StatsSection />
        <TestimonialsSection />
        <PricingSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
