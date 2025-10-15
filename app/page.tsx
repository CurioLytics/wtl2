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
      title: "Nhật ký cá nhân",
      description: "Viết suy nghĩ, nhận phản hồi tức thì và lưu lại những từ vựng mang ý nghĩa với riêng bạn.",
      iconSrc: "/icons/bookmark.svg",
    },
    {
      title: "Luyện tập đóng vai",
      description: "Hóa thân vào tình huống thực tế để luyện nói và phản xạ tự nhiên.",
      iconSrc: "/icons/language.svg",
    },
    {
      title: "Ôn tập từ vựng",
      description: "Ghi nhớ sâu hơn qua flashcard và chế độ dịch chuyện.",
      iconSrc: "/icons/cap.svg",
    },
  ];
  
  // Steps data
  const steps = [
    {
      number: 1,
      title: "Viết",
      description: "Chọn mẫu có sẵn hoặc viết tự do để bắt đầu hành trình học ngôn ngữ của bạn.",
      iconSrc: "/icons/plus.svg",
    },
    {
      number: 2,
      title: "Nhận phản hồi",
      description: "AI giúp chỉnh ngữ pháp, gợi ý từ mới và cải thiện phong cách viết.",
      iconSrc: "/icons/check.svg",
    },
    {
      number: 3,
      title: "Lưu & học từ",
      description: "Chọn những từ quan trọng để thêm vào bộ thẻ ghi nhớ cá nhân.",
      iconSrc: "/icons/bookmark.svg",
    },
    {
      number: 4,
      title: "Ôn & thực hành",
      description: "Học lại qua flashcard hoặc thử thách bản thân với chế độ dịch chuyện.",
      iconSrc: "/icons/cap.svg",
    },
  ];
  
  // Footer links
  const footerLinks = [
    { text: "Đăng nhập", href: "/auth" },
    { text: "Đăng ký", href: "/auth" },
    { text: "Quyền riêng tư", href: "#" },
    { text: "Điều khoản", href: "#" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <Header 
        logoSrc="/images/logo.svg"
        logoText="W2L"
        buttonText="Đăng ký"
        buttonLink="/auth"
      />

      {/* Hero Section */}
      <Hero 
        title="W2L – Viết để Học"
        subtitle="Biến từng dòng chữ thành bước tiến trong hành trình ngôn ngữ của bạn."
        description="Viết suy nghĩ, nhận phản hồi tức thì và lưu lại những từ vựng mang ý nghĩa với riêng bạn."
        buttonText="Bắt đầu hành trình của bạn"
        buttonLink="/onboarding"
      />

      {/* Features Section */}
      <Section 
        title="Bạn có thể làm gì với W2L?" 
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
        title="Cách W2L đồng hành cùng bạn"
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
        logoText="Viết để Học"
        links={footerLinks}
      />
    </div>
  );
}
