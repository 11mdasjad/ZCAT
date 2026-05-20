import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import HeroSection from '@/components/landing/HeroSection';
import TrustedSection from '@/components/landing/TrustedSection';
import dynamic from 'next/dynamic';

// Lazy-load below-the-fold sections to dramatically reduce initial JS bundle
const FeaturesSection = dynamic(() => import('@/components/landing/FeaturesSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const ProctoringSection = dynamic(() => import('@/components/landing/ProctoringSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const CodeEditorSection = dynamic(() => import('@/components/landing/CodeEditorSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const StatsSection = dynamic(() => import('@/components/landing/StatsSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const TestimonialsSection = dynamic(() => import('@/components/landing/TestimonialsSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const PricingSection = dynamic(() => import('@/components/landing/PricingSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});
const ContactSection = dynamic(() => import('@/components/landing/ContactSection'), {
  loading: () => <section className="py-24 sm:py-32" />,
});

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
