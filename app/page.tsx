import { CTASection } from '@/components/landing/cta-section';
import { ProblemSection } from '@/components/landing/problem-section';
import { CoreIdeaSection } from '@/components/landing/core-idea-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { FeatureCard } from '@/components/landing/feature-card';
import { TestimonialCard } from '@/components/landing/testimonial-card';
import { TargetAudienceSection } from '@/components/landing/target-audience-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <CTASection
        headline="Viết. Nói. Suy nghĩ bằng tiếng Anh – mỗi ngày."
        subheadline={
          <>
            Write2Learn giúp bạn chuyển tiếng Anh từ{' '}
            <span className="highlight-purple">biết</span> sang{' '}
            <span className="highlight-purple">dùng được</span>, thông qua viết{' '}
            <span className="highlight-purple">nhật ký</span>,{' '}
            <span className="highlight-purple">luyện hội thoại</span> và{' '}
            <span className="highlight-purple">ghi nhớ từ vựng</span> theo chính{' '}
            <span className="highlight-purple">trải nghiệm</span> của bạn.
          </>
        }
        primaryButtonText="👉 Bắt đầu viết hôm nay"
        primaryButtonLink="/journal"
        secondaryButtonText="Xem cách hoạt động"
        secondaryButtonLink="#how-it-works"
        fullHeight={true}
      />

      {/* Problem Awareness Section */}
      <ProblemSection
        headline="Bạn không thiếu kiến thức."
        subheadline="Bạn thiếu môi trường để dùng tiếng Anh."
        problems={[
          'Học nhiều năm nhưng vẫn ngại viết, ngại nói',
          'Thuộc từ nhưng không biết dùng trong câu thật',
          'Công cụ rời rạc, học xong là quên',
          'Không duy trì được thói quen lâu dài',
        ]}
      />

      {/* Core Idea Section */}
      <CoreIdeaSection
        headline="Write2Learn không dạy bạn 'học tiếng Anh'."
        subheadline="Nó tạo điều kiện để bạn sử dụng tiếng Anh."
        points={[
          'Viết về chính cuộc sống của bạn',
          'Nhận phản hồi ngay khi còn nhớ ngữ cảnh',
          'Giữ lại những gì bạn từng dùng, từng sai, từng học',
        ]}
      />

      {/* How It Works Section */}
      <div id="how-it-works">
        <HowItWorksSection
          headline="Cách hoạt động"
          steps={[
            {
              title: 'Viết hoặc nói như bạn vẫn nghĩ',
              description:
                'Viết nhật ký ngắn, hoặc tham gia một tình huống giao tiếp quen thuộc (phỏng vấn, du lịch, công việc).',
            },
            {
              title: 'AI phản hồi như một người hướng dẫn',
              description:
                'Chỉ ra lỗi, gợi ý cách diễn đạt tự nhiên hơn, không chấm điểm – không phán xét.',
            },
            {
              title: 'Giữ lại từ & cấu trúc bạn vừa dùng',
              description:
                'Highlight ngay trong bài viết hoặc hội thoại → tạo flashcard tự động, gắn với ngữ cảnh thật.',
            },
            {
              title: 'Ôn lại đúng lúc, không lãng phí thời gian',
              description:
                'Hệ thống nhắc bạn ôn những gì sắp quên, không phải những gì bạn đã nhớ.',
            },
          ]}
          ctaText="👉 Trải nghiệm quy trình này"
          ctaLink="/journal"
        />
      </div>

      {/* Feature Blocks Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              emoji="✍️"
              title="Journal – Viết để suy nghĩ bằng tiếng Anh"
              description="Viết không còn là bài tập. Nó là thói quen."
              details={[
                'Gợi ý viết khi bí ý tưởng',
                'Phản hồi rõ ràng: sai ở đâu, vì sao',
                'Viết lại tốt hơn, tự nhiên hơn',
              ]}
            />
            <FeatureCard
              emoji="🗣️"
              title="Roleplay – Luyện nói trong môi trường an toàn"
              description="Phù hợp cho người bận rộn, cần luyện phản xạ."
              details={[
                'Hội thoại theo tình huống thực tế',
                'Không sợ sai, không áp lực người đối diện',
                'Kết thúc phiên là biết mình cần cải thiện gì',
              ]}
            />
            <FeatureCard
              emoji="🧠"
              title="Vocabulary – Nhớ từ vì bạn đã dùng nó"
              description="Từ vựng có ký ức → nhớ lâu hơn."
              details={[
                'Không học từ rời rạc',
                'Từ vựng sinh ra từ chính bài viết & hội thoại của bạn',
                'Ôn tập thông minh, không quá tải',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <TargetAudienceSection
        headline="Write2Learn dành cho bạn nếu:"
        criteria={[
          'Bạn hiểu tiếng Anh nhưng khó viết, khó nói',
          'Bạn đi làm, ít thời gian nhưng cần dùng tiếng Anh thật',
          'Bạn chán các app "học cho có"',
          'Bạn muốn tiến bộ bền vững, không học vẹt',
        ]}
      />

      {/* Social Proof Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TestimonialCard quote="Mình viết mỗi ngày 10–15 phút. Sau vài tuần, mình bắt đầu nghĩ bằng tiếng Anh thay vì dịch trong đầu." />
            <TestimonialCard quote="Roleplay là tính năng mình dùng nhiều nhất. Nó giống tập dượt trước khi ra đời thật." />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <CTASection
        headline="Đừng đợi đến khi 'giỏi hơn' mới bắt đầu dùng tiếng Anh. Hãy bắt đầu để trở nên 'giỏi hơn'."
        primaryButtonText="👉 Bắt đầu với bài viết đầu tiên"
        primaryButtonLink="/journal"
        className="bg-white"
      />

      {/* Footer */}
      <Footer
        brandName="Write2Learn"
        links={[
          { text: 'About', href: '/about' },
          { text: 'Privacy', href: '/privacy' },
          { text: 'Contact', href: '/contact' },
        ]}
      />
    </div>
  );
}
