import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import fonts
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/fira-code/400.css';
import '@fontsource/fira-code/500.css';

// Import styles
import './index.css';
import './App.css';

// Import app
import App from './App.tsx';

// Set up dark mode based on user preference or localStorage
const setInitialTheme = () => {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem('theme');

  if (storedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (storedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    // If no theme is stored, use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Set initial theme
setInitialTheme();

// Create root and render app
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
