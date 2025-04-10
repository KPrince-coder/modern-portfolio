import { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import ThemeToggler from '../ui/ThemeToggler';
import { navLinks } from '../../routes';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="py-6 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-40 shadow-sm">
      <Container>
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Portfolio
          </Link>

          <div className="flex items-center gap-4">
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

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink key={link.path} to={link.path}>{link.label}</NavLink>
              ))}
            </nav>
          </div>
        </div>
      </Container>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <Container>
          <nav className="md:hidden py-4 flex flex-col space-y-4 bg-white dark:bg-gray-800 rounded-lg mt-2 shadow-lg">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </Container>
      )}
    </header>
  );
};

// Helper component for navigation links
const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link
    to={to}
    className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200"
    onClick={onClick}
  >
    {children}
  </Link>
);

export default Header;
