import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCMS } from '../CMSProvider';
import MobileSidebar from './layout/MobileSidebar';
import DesktopSidebar from './layout/DesktopSidebar';
import TopBar from './layout/TopBar';
import { mainNavigation, adminNavigation } from '../config/navigation';

interface CMSLayoutProps {
  children: React.ReactNode;
}

const CMSLayout: React.FC<CMSLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoading, logout, user, isAdmin } = useCMS();
  const location = useLocation();

  // If still loading, show loading indicator
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (!isAuthenticated && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }

  // If on login page and authenticated, redirect to dashboard
  if (isAuthenticated && location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If on login page, don't show the layout
  if (location.pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Combine navigation items based on user role
  const fullNavigation = isAdmin ? [...mainNavigation, ...adminNavigation] : mainNavigation;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigation={fullNavigation}
        userEmail={user?.email}
        onLogout={logout}
      />

      {/* Desktop sidebar */}
      <DesktopSidebar
        navigation={fullNavigation}
        userEmail={user?.email}
        onLogout={logout}
      />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopBar onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default CMSLayout;
