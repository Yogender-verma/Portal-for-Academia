import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ValueLine } from '../components/landing/ValueLine';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { WhySkillBridgeSection } from '../components/landing/WhySkillBridgeSection';
import { ProductPreviewSection } from '../components/landing/ProductPreviewSection';
import { FaqSection } from '../components/landing/FaqSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      <Navbar />
      <main>
        <HeroSection />
        <ValueLine />
        <FeaturesSection />
        <HowItWorksSection />
        <WhySkillBridgeSection />
        <ProductPreviewSection />
        <FaqSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </div>
  );
};
