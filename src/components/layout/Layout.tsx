import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import CustomCursor from '../ui/CustomCursor';
import LoadingSpinner from '../ui/LoadingSpinner';
import PageTransition from './PageTransition';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Simulate page transition loading
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CustomCursor />
      {isLoading ? (
        <LoadingSpinner fullPage size="lg" />
      ) : (
        <main className="min-h-[calc(100vh-200px)] pt-24">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              {children}
            </PageTransition>
          </AnimatePresence>
        </main>
      )}
    </div>
  );
};

export default Layout;
