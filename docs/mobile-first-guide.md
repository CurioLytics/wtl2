# Mobile-First Development Guide

This guide outlines the principles and best practices for maintaining a mobile-first approach in the Write2Learn application.

## Core Principles

1. **Mobile-First by Default**: Design and develop for mobile screens first, then progressively enhance for larger screens.
2. **Touch-Friendly UI**: Ensure all interactive elements have adequate touch targets (minimum 44×44px).
3. **Responsive Utilities**: Use the shared `useResponsive` hook for consistent breakpoint detection.
4. **Z-Index Management**: Use the centralized `zIndex` constants for proper layering.
5. **Progressive Enhancement**: Add features and visual complexity as screen size increases.

## Breakpoints

Our application uses the following breakpoints (from `useResponsive`):

```typescript
// Mobile-first breakpoints
const breakpoints = {
  mobile: 0,      // Default (everything starts as mobile)
  tablet: 640,    // sm: 640px and above
  desktop: 768,   // md: 768px and above
  largeDesktop: 1024 // lg: 1024px and above
};
```

## Using the Responsive Hook

Always use the shared `useResponsive` hook instead of creating duplicate media queries:

```typescript
import { useResponsive } from '@/hooks/common/use-responsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  // Apply responsive logic based on these flags
  return (
    <div className={isMobile ? 'mobile-class' : 'desktop-class'}>
      {/* Content */}
    </div>
  );
}
```

## Styling Best Practices

### 1. CSS Properties

Start with mobile styling as the default, then use conditionals for larger screens:

```tsx
<div 
  className="base-styles-for-all-screens"
  style={{
    // Mobile styles (default)
    padding: '0.5rem',
    fontSize: '16px',
    
    // Desktop styles conditionally applied
    ...(isDesktop && {
      padding: '1rem',
      fontSize: '14px'
    })
  }}
>
  {/* Content */}
</div>
```

### 2. Tailwind Classes

When using Tailwind, follow the mobile-first approach with responsive prefixes:

```html
<div class="
  p-2 text-base flex-col
  md:p-4 md:text-lg md:flex-row
  lg:p-6
">
  <!-- Content -->
</div>
```

### 3. Module CSS

When using CSS modules, start with mobile styles and use min-width media queries:

```css
.myComponent {
  /* Mobile styles */
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

@media (min-width: 768px) {
  .myComponent {
    /* Desktop styles */
    flex-direction: row;
    padding: 1rem;
  }
}
```

## Touch Targets

Ensure all interactive elements are at least 44×44px on mobile:

```css
/* Minimum sizes for touch targets */
.touchTarget {
  min-width: 44px;
  min-height: 44px;
}

/* Larger spacing between interactive elements */
.touchTargetContainer {
  gap: 12px;
}
```

## Z-Index Management

Always use the centralized `zIndex` constants for proper UI layering:

```typescript
import { zIndex } from '@/utils/z-index';

// In your component
<div style={{ zIndex: zIndex.dropdown }}>
  {/* Dropdown content */}
</div>
```

## Components Guide

### Navigation

- Bottom-fixed navigation on mobile
- Side navigation on desktop
- Use `zIndex.mobileNavigation` for proper stacking

### Buttons

- Minimum 44×44px touch target on mobile
- Add visible active/pressed state for touch feedback
- Consider larger text and spacing for mobile

### Forms

- Stack inputs vertically on mobile
- Use full width inputs on mobile
- Consider larger form controls for touch

### Content

- Single column layouts on mobile
- Multi-column on larger screens
- Adjust font sizes proportionally (larger on mobile for readability)

## Testing

Always test your changes on:
1. Mobile screens (320px - 639px)
2. Tablet screens (640px - 767px) 
3. Desktop screens (768px+)

Use Chrome DevTools Device Emulation for testing various screen sizes.