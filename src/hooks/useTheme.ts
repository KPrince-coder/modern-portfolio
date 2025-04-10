import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    if (storedTheme) {
      return storedTheme;
    }
    
    // If no theme is stored, use system preference
    return 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Update the theme in localStorage and apply it to the document
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && systemTheme === 'dark');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, systemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Get the current effective theme (light or dark)
  const currentTheme = theme === 'system' ? systemTheme : theme;

  return {
    theme,
    setTheme,
    currentTheme,
    isLight: currentTheme === 'light',
    isDark: currentTheme === 'dark',
  };
};

export default useTheme;
