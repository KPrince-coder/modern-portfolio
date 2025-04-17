import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ScrollToTop from './components/utils/ScrollToTop';
import BlogSuspenseFallback from './components/blog/BlogSuspenseFallback';
// Theme provider removed
import { routes } from './routes';
import CMSRoutes from './cms/CMSRoutes';
import { CMSProvider } from './cms/CMSProvider';
import './App.css';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <div className="app-container overflow-hidden">
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </QueryClientProvider>
    </div>
  );
}

// AppContent component with access to router context
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBlogPostRoute = /^\/blog\/[\w-]+$/.test(location.pathname);

  return (
    <CMSProvider>
      {isAdminRoute ? (
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
          <Routes>
            <Route path="/admin/*" element={<CMSRoutes />} />
          </Routes>
        </Suspense>
      ) : isBlogPostRoute ? (
        <Suspense fallback={<BlogSuspenseFallback />}>
          <Routes>
            <Route path="/blog/:slug" element={React.createElement(routes.find(r => r.path === '/blog/:slug')?.element || (() => <div>Not found</div>))} />
          </Routes>
        </Suspense>
      ) : (
        <Layout>
          <Header />
          <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
            <Routes>
              {routes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.element />}
                />
              ))}
            </Routes>
          </Suspense>
          <Footer />
        </Layout>
      )}
    </CMSProvider>
  );
}

export default App;
