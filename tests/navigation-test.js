// Simple test script to verify navigation behavior
// Run this in the browser console after loading the application

function testNavigation() {
  console.log('Starting navigation test...');
  
  // Check responsive breakpoints
  const width = window.innerWidth;
  console.log(`Current window width: ${width}px`);
  console.log(`Expected navigation mode: ${width < 768 ? 'Mobile (bottom nav)' : width < 1024 ? 'Tablet (collapsible sidebar)' : 'Desktop (fixed sidebar)'}`);
  
  // Check if navigation is visible on main pages
  const isMainPage = !window.location.pathname.includes('/journal/new') && 
                     !window.location.pathname.includes('/flashcards/create') &&
                     !window.location.pathname.includes('/roleplay/session');
                     
  console.log(`Current page: ${window.location.pathname}`);
  console.log(`Should show navigation: ${isMainPage ? 'Yes' : 'No (processing page)'}`);
  
  // Check for mobile bottom navigation
  const bottomNav = document.querySelector('nav:not([class*="desktopSidebar"])');
  console.log(`Bottom navigation visible: ${bottomNav && window.getComputedStyle(bottomNav).display !== 'none' ? 'Yes' : 'No'}`);
  
  // Check for desktop sidebar
  const sidebar = document.querySelector('nav[class*="desktopSidebar"]');
  console.log(`Sidebar visible: ${sidebar && window.getComputedStyle(sidebar).display !== 'none' ? 'Yes' : 'No'}`);
  
  if (sidebar) {
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    console.log(`Sidebar width: ${sidebarWidth}px`);
    console.log(`Sidebar state: ${sidebarWidth > 100 ? 'Expanded' : 'Collapsed'}`);
  }
  
  // Check accessibility
  const navLinks = document.querySelectorAll('nav a');
  let accessibilityIssues = 0;
  
  navLinks.forEach((link, index) => {
    // Check touch target size
    const rect = link.getBoundingClientRect();
    const isTouchFriendly = rect.width >= 44 && rect.height >= 44;
    if (!isTouchFriendly) {
      console.warn(`Accessibility issue: Nav link #${index} too small for touch (${rect.width}x${rect.height}px)`);
      accessibilityIssues++;
    }
    
    // Check aria attributes
    const hasAriaLabel = link.hasAttribute('aria-label') || link.textContent.trim().length > 0;
    if (!hasAriaLabel) {
      console.warn(`Accessibility issue: Nav link #${index} missing accessible name`);
      accessibilityIssues++;
    }
  });
  
  console.log(`Accessibility check: ${accessibilityIssues === 0 ? 'All passed' : `${accessibilityIssues} issues found`}`);
  console.log('Navigation test complete');
}

// Run the test
testNavigation();