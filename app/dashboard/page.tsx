'use client';

import { useAuth } from '@/hooks/auth/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PinnedTemplates } from '@/components/journal/pinned-templates';
import { Quote } from '@/components/ui/quote';
import { RoleplayCard } from '@/components/roleplay/roleplay-card';
import { QuickReview } from '@/components/flashcards/quick-review';

const quotes = [
  {
    text: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius"
  },
  {
    text: "Your mind will take the shape of what you frequently hold in thought.",
    author: "Marcus Aurelius"
  },
  {
    text: "The more you write, the more you know what you think.",
    author: "Marty Rubin"
  },
  {
    text: "If you want to be a writer, you must do two things above all others: read a lot and write a lot.",
    author: "Stephen King"
  }
];

const roleplayScenarios = [
  {
    id: 'vietnam-day',
    title: 'Independence Day in Vietnam',
    description: 'Practice cultural explanations and conversational fluency',
    imageUrl: '' // Placeholder, would be replaced with actual image path
  },
  {
    id: 'job-interview',
    title: 'Job Interview',
    description: 'Practice professional English and interview skills',
    imageUrl: '' // Placeholder, would be replaced with actual image path
  },
  {
    id: 'restaurant',
    title: 'At a Restaurant',
    description: 'Order food and engage in casual conversation',
    imageUrl: '' // Placeholder, would be replaced with actual image path
  }
];

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Select a quote with a stable index based on the day of month
  // This ensures server and client render the same quote, avoiding hydration errors
  const today = new Date();
  const dayOfMonth = today.getDate();
  const stableIndex = dayOfMonth % quotes.length;
  const selectedQuote = quotes[stableIndex];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Welcome Section with User Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.email?.split('@')[0] || 'Writer'}</h1>
        <p className="text-gray-600 mt-2">Continue your English language journey today</p>
      </div>

      {/* Pinned Templates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <PinnedTemplates />
      </section>
      
      {/* Quote Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Quote text={selectedQuote.text} author={selectedQuote.author} />
        
        {/* Scroll down arrow */}
        <div className="flex justify-center mt-8 mb-4" id="scroll-arrow-container">
          <button
            id="scroll-down-btn"
            aria-label="Scroll down to next section"
            className="flex items-center justify-center p-2 rounded-full bg-white/80 shadow-md hover:bg-white hover:shadow-lg transition-all duration-300 mobile-btn tap-highlight-none animate-pulse"
            onClick={() => {
              // Find the roleplay section element
              const nextSection = document.getElementById('roleplay-section');
              // Smoothly scroll to it if it exists
              if (nextSection) {
                nextSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600"
            >
              <path d="M12 5v14" />
              <path d="m19 12-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>
      
      {/* Roleplay Gallery */}
      <section id="roleplay-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">🎭 Try today's role-play</h2>
            <Link href="/roleplay" className="text-blue-600 text-sm hover:underline">View all</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleplayScenarios.map((scenario) => (
              <RoleplayCard
                key={scenario.id}
                id={scenario.id}
                title={scenario.title}
                description={scenario.description}
                imageUrl={scenario.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Quick Review Vocab Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">📝 Vocab Review</h2>
            <Link href="/vocab" className="text-blue-600 text-sm hover:underline">Vocab Hub</Link>
          </div>
          
          <QuickReview count={5} />
        </div>
      </section>
    </div>
  );
}