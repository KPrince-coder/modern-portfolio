import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ScrollToTop from './components/utils/ScrollToTop';
import { ThemeProvider } from './context/ThemeContext';
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

// Conditional layout component that only renders header/footer for non-admin routes
const ConditionalLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <Layout>
      <Header />
      {children}
      <Footer />
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <CMSProvider>
            <ConditionalLayout>
              <Suspense fallback={<LoadingSpinner size="lg" text="Loading page..." />}>
                <Routes>
                  {/* Main website routes */}
                  {routes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={<route.element />}
                    />
                  ))}

                  {/* CMS routes - handled by CMSRoutes component */}
                  <Route path="/admin/*" element={<CMSRoutes />} />
                </Routes>
              </Suspense>
            </ConditionalLayout>
          </CMSProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
