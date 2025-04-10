# Modern Portfolio Project Setup

This document provides an overview of how the Modern Portfolio project was set up and configured.

## Project Overview

The Modern Portfolio is a cutting-edge, modern portfolio application built with React.js. It features:

- A content management system (CMS) as the source of all UI content
- Supabase backend for data management
- AI agents powered by the Groq API for advanced functionalities
- SEO optimization, accessibility, and performance best practices
- A custom, innovative cursor that replaces the standard cursor
- Modern fonts, animations, icons, and SVGs

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router
- **State Management**: React Query
- **Backend**: Supabase
- **AI Integration**: Groq API
- **Animations**: Framer Motion
- **Fonts**: Inter (general text) and Fira Code (code blocks)

## Project Structure

```
modern-portfolio/
├── docs/                  # Documentation
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable components
│   │   ├── layout/        # Layout components
│   │   └── ui/            # UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.css            # App-specific styles
│   ├── App.tsx            # Main App component
│   ├── index.css          # Global styles
│   └── main.tsx           # Entry point
├── .env                   # Environment variables (not committed)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── index.html             # HTML entry point
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Setup Steps

1. **Initialize the project**:
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm install react-router-dom @supabase/supabase-js @tanstack/react-query framer-motion @fontsource/inter @fontsource/fira-code @heroicons/react
   ```

3. **Set up Tailwind CSS v4**:
   ```bash
   npm install tailwindcss @tailwindcss/vite
   ```
   See [Tailwind CSS v4 Integration](./tailwind-v4-vite-integration.md) for details.

4. **Configure environment variables**:
   Create a `.env` file based on `.env.example` with your API keys.

5. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Component Development**:
   - Create reusable components in the `components` directory
   - Use Tailwind CSS for styling
   - Use Framer Motion for animations

2. **Page Development**:
   - Create page components in the `pages` directory
   - Use React Router for navigation
   - Use React Query for data fetching

3. **API Integration**:
   - Use Supabase for backend functionality
   - Use Groq API for AI features

4. **Testing**:
   - Test components in isolation
   - Test pages with mock data
   - Test API integrations with real data

5. **Deployment**:
   - Build the project with `npm run build`
   - Deploy to a static hosting service

## Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/en/main)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Framer Motion Documentation](https://www.framer.com/motion/)
