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
import './cms/styles/customUtilities.css';

// Import app
import App from './App.tsx';

// Theme handling removed

// Create root and render app
const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
