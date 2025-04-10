import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePersonalData } from '../../hooks/useSupabase';
import { navLinks } from '../../routes';

interface BasicMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const BasicMobileMenu = ({ isOpen, onClose }: BasicMobileMenuProps) => {
  const location = useLocation();
  const { data: personalData } = usePersonalData();
  const resumeUrl = personalData?.resume_url ?? '#';

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debug log
  console.log('BasicMobileMenu isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Debug indicator */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white p-2 text-center font-bold z-[10000]">
        BASIC MOBILE MENU OPEN
      </div>

      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9000]"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white dark:bg-gray-900 shadow-xl z-[9999] overflow-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-800">
            <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              Portfolio
            </Link>
            <button
              type="button"
              className="p-2 rounded-md text-gray-700 dark:text-gray-200"
              onClick={onClose}
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));

                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block py-3 px-4 rounded-lg text-lg ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={onClose}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download CV
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicMobileMenu;
