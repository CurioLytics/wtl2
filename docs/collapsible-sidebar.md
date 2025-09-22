# Collapsible Sidebar Implementation

This document explains how the collapsible sidebar feature works in the Write2Learn application, following mobile-first design principles.

## Overview

The sidebar provides navigation for desktop users while maintaining a clean mobile interface with bottom navigation. Key features include:

- Expandable/collapsible sidebar on desktop
- User preference persistence via localStorage
- Responsive design with mobile-first approach
- Smooth transitions between states

## Components and Files

### 1. Context Provider (`/hooks/common/use-sidebar.tsx`)

This hook creates and manages the sidebar state using React Context:

```tsx
// Core functionality
const [sidebarOpen, setSidebarOpen] = useState(true);
const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

// Persist user preferences
useEffect(() => {
  try {
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      setSidebarOpen(savedState === 'true');
    }
  } catch (error) {
    console.warn('Failed to access localStorage for sidebar state:', error);
  }
}, []);
```

### 2. Navigation Component (`/components/layout/navigation.tsx`)

This component handles both desktop sidebar navigation and mobile bottom navigation:

```tsx
// Conditional rendering based on device type
if (isDesktopSidebar && isMobile) return null;
if (!isDesktopSidebar && isDesktop) return null;

// Responsive sidebar width and layout
width: isDesktopSidebar ? (sidebarOpen ? '16rem' : '4.5rem') : 'auto',
```

### 3. App Layout Component (`/components/layout/app-layout.tsx`)

Wraps the application in the SidebarProvider and adjusts the main content based on sidebar state:

```tsx
// Responsive padding adjustments
paddingLeft: isDesktop ? '0.5rem' : contentStyles.paddingLeft,
paddingRight: isDesktop ? '0.5rem' : contentStyles.paddingRight,
```

## Sidebar States

The sidebar has two states:

1. **Expanded** (default): Shows full navigation with text labels (16rem/256px wide)
2. **Collapsed**: Shows only icons for a more compact view (4.5rem/72px wide)

## Implementation Details

### Responsive Behavior

- **Mobile**: No sidebar, navigation at bottom of screen
- **Desktop**: Collapsible sidebar with toggle button

### Transition Effects

Smooth transitions are applied using CSS transitions:

```css
transition: all 0.3s ease-in-out;
```

### User Preference Persistence

The sidebar state is saved to localStorage when changed:

```tsx
useEffect(() => {
  try {
    localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
  } catch (error) {
    console.warn('Failed to save sidebar state to localStorage:', error);
  }
}, [sidebarOpen]);
```

## Usage Guidelines

1. Use the `useSidebar` hook to access sidebar state:
   ```tsx
   const { sidebarOpen, toggleSidebar, setSidebarOpen } = useSidebar();
   ```

2. When adding new navigation items, follow the pattern in `navigation.tsx` for consistent responsive behavior:
   ```tsx
   {!isDesktopSidebar || sidebarOpen) && <span>{item.name}</span>}
   ```

3. Components inside the main content area should respect the responsive padding system defined in `contentStyles`.

## Mobile-First Design Principles Applied

- Core navigation works on mobile first
- Desktop is an enhancement of the mobile experience
- Responsive hooks handle device detection
- Persistent user preferences
- Touch-friendly toggle buttons (min 44x44px touch targets)