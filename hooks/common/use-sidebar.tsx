'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type SidebarContextType = {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// Local storage key for persisting sidebar state
const SIDEBAR_STATE_KEY = 'wtl2-sidebar-open';

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if available, otherwise default to open
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Load saved preference on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
      if (savedState !== null) {
        setSidebarOpen(savedState === 'true');
      }
    } catch (error) {
      // Ignore localStorage errors (e.g., in SSR or if disabled)
      console.warn('Failed to access localStorage for sidebar state:', error);
    }
  }, []);
  
  // Save preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, String(sidebarOpen));
    } catch (error) {
      console.warn('Failed to save sidebar state to localStorage:', error);
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}