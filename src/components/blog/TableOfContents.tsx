import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiList } from 'react-icons/fi';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  contentRef: React.RefObject<HTMLElement>;
  className?: string;
}

/**
 * Table of Contents component that extracts headings from blog content
 * and provides smooth scrolling navigation
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ contentRef, className = '' }) => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const tocRef = useRef<HTMLDivElement>(null);

  // Extract headings from content
  useEffect(() => {
    if (!contentRef.current) return;

    // Find all h2, h3, and h4 elements
    const elements = contentRef.current.querySelectorAll('h2, h3, h4');
    const headingsList: Heading[] = [];

    elements.forEach((el) => {
      const id = el.id;
      const text = el.textContent || '';
      const level = parseInt(el.tagName.substring(1), 10);

      if (id && text) {
        headingsList.push({ id, text, level });
      }
    });

    setHeadings(headingsList);
  }, [contentRef.current]);

  // Set up intersection observer to highlight active heading
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-100px 0px -80% 0px',
        threshold: 0,
      }
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings, contentRef.current]);

  // Close TOC when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tocRef.current && !tocRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Scroll to heading when clicked
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100,
        behavior: 'smooth',
      });
      setActiveId(id);
      setIsOpen(false);
    }
  };

  // If no headings, don't render
  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={tocRef}>
      {/* Mobile toggle button */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-expanded={isOpen}
          aria-controls="table-of-contents"
        >
          <FiList className="w-4 h-4" />
          <span>Table of Contents</span>
        </button>
      </div>

      {/* Desktop always visible, mobile conditional */}
      <motion.div
        id="table-of-contents"
        className={`mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm md:block ${
          isOpen ? 'block' : 'hidden'
        }`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FiList className="w-5 h-5" />
          Table of Contents
        </h2>
        <nav aria-label="Table of contents">
          <ul className="space-y-2">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`${
                  heading.level === 2 ? 'ml-0' : heading.level === 3 ? 'ml-4' : 'ml-8'
                }`}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-left w-full px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                    activeId === heading.id
                      ? 'text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </motion.div>
    </div>
  );
};

export default TableOfContents;
