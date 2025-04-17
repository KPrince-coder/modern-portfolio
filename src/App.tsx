import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
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

// Lazy-load the BlogPostPage component
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

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
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </QueryClientProvider>
      </HelmetProvider>
    </div>
  );
}

// AppContent component with access to router context
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isBlogPostRoute = /^\/blog\/[\w-]+$/.test(location.pathname);

  const renderRouteContent = () => {
    if (isAdminRoute) {
      return (
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
          <Routes>
            <Route path="/admin/*" element={<CMSRoutes />} />
          </Routes>
        </Suspense>
      );
    }

    if (isBlogPostRoute) {
      return (
        <Suspense fallback={<BlogSuspenseFallback />}>
          <Routes>
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </Suspense>
      );
    }

    return (
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
    );
  };

  return (
    <CMSProvider>
      {renderRouteContent()}
    </CMSProvider>
  );
}

export default App;
