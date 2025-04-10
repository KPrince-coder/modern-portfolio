import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Container from './Container';
import ThemeToggler from '../ui/ThemeToggler';
import Button from '../ui/Button';
import MobileMenu from './MobileMenu';
import { usePersonalData } from '../../hooks/useSupabase';
import { navLinks } from '../../routes';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: personalData } = usePersonalData();

  // Fallback resume URL if data is not available
  const resumeUrl = personalData?.resume_url ?? '#';

  return (
    <header className="py-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-40 shadow-sm">
      <Container>
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Portfolio
          </Link>

          {/* Desktop navigation - centered */}
          <nav className="hidden md:flex items-center justify-center space-x-8 flex-1 mx-8">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path}>{link.label}</NavLink>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* CV Download Button - desktop only */}
            <div className="hidden md:block">
              <Button
                href={resumeUrl}
                variant="outline"
                size="sm"
                isExternal
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                }
              >
                Download CV
              </Button>
            </div>

            {/* Theme toggler */}
            <ThemeToggler />

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </header>
  );
};

// Helper component for navigation links
const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`relative transition-colors duration-200 ${isActive
        ? 'text-indigo-600 dark:text-indigo-400 font-medium'
        : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"></span>
      )}
    </Link>
  );
};

export default Header;
