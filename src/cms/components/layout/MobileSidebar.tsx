import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Dialog from '../../../components/ui/CustomDialog';
import { NavigationItem } from '../../../types/navigation';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: NavigationItem[];
  userEmail?: string | null;
  onLogout: () => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  navigation,
  userEmail,
  onLogout
}) => {
  const location = useLocation();

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 flex z-40 md:hidden">
      <Dialog.Overlay onClick={onClose} />
      
      <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white dark:bg-gray-800">
        {/* Close button */}
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button
            type="button"
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Logo */}
        <div className="flex-shrink-0 flex items-center px-4">
          <Link to="/admin/dashboard" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            Portfolio CMS
          </Link>
        </div>
        
        {/* Navigation */}
        <div className="mt-5 flex-1 h-0 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-200'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
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
      
      <div className="flex-shrink-0 w-14" aria-hidden="true">
        {/* Dummy element to force sidebar to shrink to fit close icon */}
      </div>
    </Dialog>
  );
};

export default MobileSidebar;
