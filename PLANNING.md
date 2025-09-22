# Write2Learn - Project Architecture

## Overview

Write2Learn helps users improve their English writing skills through journaling, vocabulary building, and interactive roleplay. Built with Next.js (App Router), TypeScript, Supabase, and Tailwind CSS.

## Project Structure

```
/home/work/wtl2/
├── app/ - Next.js App Router pages and API routes
├── components/ - UI components organized by feature
│   ├── auth/, journal/, onboarding/, roleplay/, vocab/ - Feature components
│   ├── layout/ - Layout components
│   └── ui/ - Reusable UI components
├── services/ - API and external services
│   ├── api/ - Feature-specific API calls
│   └── supabase/ - Supabase configuration
├── stores/ - State management
├── hooks/ - React hooks by feature
├── types/ - TypeScript type definitions
├── utils/ - Utility functions
├── config/ - Configuration files
├── public/ - Static assets
├── tests/ - Test files
└── docs/ - Documentation
```

## Core Concepts

### Feature-Based Organization
Code is organized by feature (auth, journal, vocab) rather than technical concerns.

### Service Boundaries
- **Services**: API calls and external interactions
- **Stores**: Application state
- **Components**: UI rendering
- **Hooks**: Reusable component logic
- **Utils**: Pure utility functions

### Styling
- Tailwind CSS with utility-first approach
- Shared UI components in components/ui/

## Development Guidelines
1. Organize by feature
2. Files under 500 lines
3. Test new functionality
4. Use established patterns

## Data Model
- **profiles**: User information
- **journals**: User entries
- **journal_templates**: Writing templates
- **vocabulary**: User vocabulary
