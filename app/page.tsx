'use client';

import { useResponsive } from '@/hooks/common/use-responsive';
import { Header } from '@/components/landing/header';
import { Hero } from '@/components/landing/hero';
import { Section } from '@/components/landing/section';
import { FeatureCard } from '@/components/landing/feature-card';
import { StepItem } from '@/components/landing/step-item';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  const { isMobile } = useResponsive();
  
  // Features data
  const features = [
    {
      title: "Personal Journaling",
      description: "Free Writing or Template",
      iconSrc: "/icons/bookmark.svg",
    },
    {
      title: "Role-Play Practice",
      description: "Learn From Real-world Situation",
      iconSrc: "/icons/language.svg",
    },
    {
      title: "Vocabulary Review",
      description: "Flashcards - story mode for long-term memory",
      iconSrc: "/icons/cap.svg",
    },
  ];
  
  // Steps data
  const steps = [
    {
      number: 1,
      title: "Start Writing",
      description: "Choose a template or a blank page to begin writing freely.",
      iconSrc: "/icons/plus.svg",
    },
    {
      number: 2,
      title: "Get Instant Feedback",
      description: "AI suggests corrections, style improvements, and vocabulary highlights.",
      iconSrc: "/icons/check.svg",
    },
    {
      number: 3,
      title: "Select Words to Learn",
      description: "Pick key words to save into your personalized flashcards.",
      iconSrc: "/icons/bookmark.svg",
    },
    {
      number: 4,
      title: "Review & Practice",
      description: "Practice with flashcards or challenge yourself with story translation mode.",
      iconSrc: "/icons/cap.svg",
    },
  ];
  
  // Footer links
  const footerLinks = [
    { text: "Log In", href: "/auth" },
    { text: "Sign Up", href: "/auth" },
    { text: "Privacy", href: "#" },
    { text: "Terms", href: "#" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        logoSrc="/images/logo.svg"
        logoText="W2L"
        buttonText="Start Journaling"
        buttonLink="/auth"
      />

      {/* Hero Section */}
      <Hero 
        title="WRITE TO LEARN"
        subtitle="Write your thoughts. Learn your words."
        description="A personal journaling space that helps you reflect and grow your language skill."
        buttonText="Start Writing"
        buttonLink="/auth"
      />

      {/* Features Section */}
      <Section 
        title="What Can You do?" 
        bgColor="bg-blue-50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              title={feature.title}
              description={feature.description}
              iconSrc={feature.iconSrc}
            />
          ))}
        </div>
      </Section>

      {/* How It Works Section */}
      <Section 
        title="How It Works"
        bgColor="bg-white"
      >
        <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8">
          {steps.map((step, index) => (
            <StepItem 
              key={index}
              number={step.number}
              title={step.title}
              description={step.description}
              iconSrc={step.iconSrc}
            />
          ))}
        </div>
      </Section>

      {/* Footer */}
      <Footer 
        logoSrc="/images/logo.svg"
        logoText="Write2Learn"
        links={footerLinks}
      />
    </div>
  );
}