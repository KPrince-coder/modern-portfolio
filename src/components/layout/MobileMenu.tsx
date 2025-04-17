import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePersonalData } from '../../hooks/useSupabase';
import { navLinks } from '../../routes';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const location = useLocation();
  const { data: personalData } = usePersonalData();
// @ts-ignore
  const resumeUrl = personalData?.resume_url ?? '#';

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex md:hidden">
      {/* Improved Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-lg"
        onClick={onClose}
        aria-label="Close menu overlay"
      />

      {/* Menu Container with Solid Background */}
      <div className="absolute inset-y-0 right-0 w-80 bg-indigo-900/95 text-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl font-bold">P</span>
            </div>
            <Link to="/" className="text-xl font-extrabold tracking-wider">
              {personalData?.name ?? 'Portfolio'}
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-transform hover:scale-110"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-6 py-8 bg-black/80">
          <nav>
            <ul className="space-y-4">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path ||
                  (link.path !== '/' && location.pathname.startsWith(link.path));

                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`group flex items-center w-full p-3 rounded-lg transition-all duration-300
                        ${isActive ? 'bg-indigo-700/50 text-white' : 'text-white/90 hover:text-white hover:bg-indigo-700/30'}`}
                      onClick={onClose}
                    >
                      {/* Arrow Icon */}
                      <svg
                        className={`w-5 h-5 transition-transform duration-300
                          ${isActive ? 'translate-x-2 text-purple-300' : 'group-hover:translate-x-2'}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="ml-4 text-lg font-medium">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Download CV Button */}
        <div className="p-6 border-t border-white/40 bg-black/80">
          <a
            href={resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 p-4 bg-white text-indigo-700 rounded-lg font-bold shadow-lg transition-transform hover:scale-[1.02]"
            onClick={onClose}
          >
            <svg
              className="w-6 h-6 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download CV</span>
          </a>
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-20 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float-reverse"></div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
