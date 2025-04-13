import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ScrollToTop from './components/utils/ScrollToTop';
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
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

// AppContent component with access to router context
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <CMSProvider>
      {isAdminRoute ? (
        <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
          <Routes>
            <Route path="/admin/*" element={<CMSRoutes />} />
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
