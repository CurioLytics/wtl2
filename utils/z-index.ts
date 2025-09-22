/**
 * Z-index constants to maintain consistent layering throughout the application.
 * Following a mobile-first approach, these ensure proper stacking of UI elements.
 * 
 * Usage:
 * import { zIndex } from '@/utils/z-index';
 * 
 * Example:
 * // In a component
 * const MobileNav = () => (
 *   <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: zIndex.mobileNavigation }}>
 *     Navigation content
 *   </div>
 * );
 */

export const zIndex = {
  // Base layers
  base: 0,
  content: 1,
  
  // UI components
  dropdown: 50,
  tooltip: 60,
  
  // Modals and overlays
  modalBackdrop: 90,
  modal: 100,
  
  // Navigation
  mobileNavigation: 80,
  desktopNavigation: 30,
  
  // Floating UI elements
  highlightButton: 70,
  notification: 110,
  
  // Top-level elements
  toast: 120,
  loadingOverlay: 130
};