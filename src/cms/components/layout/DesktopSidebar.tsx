import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavigationItem } from '../../../types/navigation';

interface DesktopSidebarProps {
  navigation: NavigationItem[];
  userEmail?: string | null;
  onLogout: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  navigation,
  userEmail,
  onLogout
}) => {
  const location = useLocation();

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Portfolio CMS
            </Link>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <nav className="flex-1 px-2 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* User info */}
            {userEmail && (
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex-shrink-0 w-full group block">
                  <div className="flex items-center">
                    <div>
                      <div className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200">
                        {userEmail.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {userEmail}
                      </p>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;
