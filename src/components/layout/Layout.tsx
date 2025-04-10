import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CustomCursor from '../ui/CustomCursor';
import LoadingSpinner from '../ui/LoadingSpinner';

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
        <main className="min-h-[calc(100vh-200px)]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8">
            {children}
          </div>
        </main>
      )}
    </div>
  );
};

export default Layout;
