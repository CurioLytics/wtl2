import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Hero } from '@/components/landing/hero';
import { FeatureCard } from '@/components/landing/feature-card';
import { StepItem } from '@/components/landing/step-item';
import { Header } from '@/components/landing/header';
import { Footer } from '@/components/landing/footer';
import { Section } from '@/components/landing/section';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Landing Page Components', () => {
  // Hero Component Tests
  describe('Hero', () => {
    // Expected use case test
    it('renders hero content correctly', () => {
      render(
        <Hero
          title="Test Title"
          subtitle="Test Subtitle"
          description="Test Description"
          buttonText="Test Button"
          buttonLink="/test-link"
        />
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    // Edge case test
    it('handles empty content gracefully', () => {
      render(
        <Hero
          title=""
          subtitle=""
          description=""
          buttonText="Test Button"
          buttonLink="/test-link"
        />
      );

      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    // Failure case test
    it('handles button click', () => {
      const router = require('next/navigation').useRouter();
      
      render(
        <Hero
          title="Test Title"
          subtitle="Test Subtitle"
          description="Test Description"
          buttonText="Test Button"
          buttonLink="/test-link"
        />
      );

      fireEvent.click(screen.getByText('Test Button'));
      expect(router.push).toHaveBeenCalledWith('/test-link');
    });
  });

  // Feature Card Tests
  describe('FeatureCard', () => {
    // Expected use case test
    it('renders feature card correctly', () => {
      render(
        <FeatureCard
          title="Feature Title"
          description="Feature Description"
          iconSrc="/test-icon.svg"
        />
      );

      expect(screen.getByText('Feature Title')).toBeInTheDocument();
      expect(screen.getByText('Feature Description')).toBeInTheDocument();
      expect(screen.getByAltText('Feature Title')).toBeInTheDocument();
    });

    // Edge case test
    it('applies custom className correctly', () => {
      const { container } = render(
        <FeatureCard
          title="Feature Title"
          description="Feature Description"
          iconSrc="/test-icon.svg"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    // Failure case test
    it('handles missing icon gracefully', () => {
      render(
        <FeatureCard
          title="Feature Title"
          description="Feature Description"
          iconSrc=""
        />
      );

      expect(screen.getByText('Feature Title')).toBeInTheDocument();
      expect(screen.getByText('Feature Description')).toBeInTheDocument();
    });
  });

  // Step Item Tests
  describe('StepItem', () => {
    // Expected use case test
    it('renders step item correctly', () => {
      render(
        <StepItem
          number={1}
          title="Step Title"
          description="Step Description"
          iconSrc="/test-icon.svg"
        />
      );

      expect(screen.getByText('Step Title')).toBeInTheDocument();
      expect(screen.getByText('Step Description')).toBeInTheDocument();
      expect(screen.getByAltText('Step 1: Step Title')).toBeInTheDocument();
    });

    // Edge case test
    it('handles long description text', () => {
      const longText = 'A'.repeat(200);
      render(
        <StepItem
          number={1}
          title="Step Title"
          description={longText}
          iconSrc="/test-icon.svg"
        />
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    // Failure case test
    it('handles invalid step number', () => {
      render(
        <StepItem
          number={-1} // Invalid number
          title="Step Title"
          description="Step Description"
          iconSrc="/test-icon.svg"
        />
      );

      expect(screen.getByText('Step Title')).toBeInTheDocument();
      expect(screen.getByAltText('Step -1: Step Title')).toBeInTheDocument();
    });
  });
  
  // Header Tests
  describe('Header', () => {
    // Expected use case test
    it('renders header correctly', () => {
      render(
        <Header
          logoSrc="/logo.svg"
          logoText="Logo Text"
          buttonText="Button Text"
          buttonLink="/button-link"
        />
      );

      expect(screen.getByText('Logo Text')).toBeInTheDocument();
      expect(screen.getByText('Button Text')).toBeInTheDocument();
      expect(screen.getByText('Log In')).toBeInTheDocument();
    });

    // Edge case test
    it('handles button click', () => {
      const router = require('next/navigation').useRouter();
      
      render(
        <Header
          logoSrc="/logo.svg"
          logoText="Logo Text"
          buttonText="Button Text"
          buttonLink="/button-link"
        />
      );

      fireEvent.click(screen.getByText('Button Text'));
      expect(router.push).toHaveBeenCalledWith('/button-link');
    });

    // Failure case test
    it('handles missing logo text', () => {
      render(
        <Header
          logoSrc="/logo.svg"
          logoText=""
          buttonText="Button Text"
          buttonLink="/button-link"
        />
      );

      expect(screen.getByText('Button Text')).toBeInTheDocument();
    });
  });
  
  // Footer Tests
  describe('Footer', () => {
    // Expected use case test
    it('renders footer correctly', () => {
      const links = [
        { text: 'Link 1', href: '/link1' },
        { text: 'Link 2', href: '/link2' },
      ];
      
      render(
        <Footer
          logoSrc="/logo.svg"
          logoText="Logo Text"
          links={links}
        />
      );

      expect(screen.getByText('Logo Text')).toBeInTheDocument();
      expect(screen.getByText('Link 1')).toBeInTheDocument();
      expect(screen.getByText('Link 2')).toBeInTheDocument();
    });

    // Edge case test
    it('handles empty links array', () => {
      render(
        <Footer
          logoSrc="/logo.svg"
          logoText="Logo Text"
          links={[]}
        />
      );

      expect(screen.getByText('Logo Text')).toBeInTheDocument();
    });

    // Failure case test
    it('renders links with proper href attributes', () => {
      const links = [
        { text: 'Link 1', href: '/link1' },
        { text: 'Link 2', href: '/link2' },
      ];
      
      render(
        <Footer
          logoSrc="/logo.svg"
          logoText="Logo Text"
          links={links}
        />
      );

      expect(screen.getByText('Link 1').closest('a')).toHaveAttribute('href', '/link1');
      expect(screen.getByText('Link 2').closest('a')).toHaveAttribute('href', '/link2');
    });
  });
  
  // Section Tests
  describe('Section', () => {
    // Expected use case test
    it('renders section correctly', () => {
      render(
        <Section title="Section Title">
          <div data-testid="section-content">Content</div>
        </Section>
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByTestId('section-content')).toBeInTheDocument();
    });

    // Edge case test
    it('applies custom background color', () => {
      const { container } = render(
        <Section title="Section Title" bgColor="bg-red-100">
          <div>Content</div>
        </Section>
      );

      expect(container.firstChild).toHaveClass('bg-red-100');
    });

    // Failure case test
    it('applies custom className', () => {
      const { container } = render(
        <Section title="Section Title" className="custom-class">
          <div>Content</div>
        </Section>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});