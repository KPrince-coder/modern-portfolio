import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface BlogTableOfContentsProps {
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({ contentRef }) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  // Extract headings from content
  useEffect(() => {
    if (!contentRef.current) return;

    // Get all headings (h2, h3, h4) from the content
    const headings = contentRef.current.querySelectorAll('h2, h3, h4');
    const items: TocItem[] = [];

    // Keep track of heading texts to ensure unique IDs
    const headingCounts: Record<string, number> = {};
    const usedIds = new Set<string>();

    headings.forEach((heading, index) => {
      const headingText = heading.textContent ?? '';
      // Create a base ID from the text or use a fallback with index if text is empty
      let baseId = headingText.toLowerCase().replace(/\s+/g, '-');
      if (!baseId) baseId = `heading-${index}`;

      // Count occurrences of this heading text
      headingCounts[baseId] = (headingCounts[baseId] || 0) + 1;

      // Create a unique ID by appending a counter if this is a duplicate
      let uniqueId = headingCounts[baseId] > 1 ? `${baseId}-${headingCounts[baseId]}` : baseId;

      // If the ID is still not unique (e.g., empty strings or special characters only), add index
      if (usedIds.has(uniqueId) || !uniqueId) {
        uniqueId = `${baseId}-${index}`;
      }

      // Track used IDs
      usedIds.add(uniqueId);

      // Make sure heading has an id
      if (!heading.id) {
        heading.id = uniqueId;
      } else {
        // If heading already has an ID, make sure we're using that exact ID
        uniqueId = heading.id;
        usedIds.add(uniqueId);
      }

      items.push({
        id: uniqueId,
        text: headingText,
        level: parseInt(heading.tagName.substring(1), 10),
      });
    });

    setTocItems(items);
  }, [contentRef]);

  // Set up intersection observer to highlight active section
  useEffect(() => {
    if (!contentRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '0px 0px -80% 0px',
      }
    );

    // Observe all headings
    const headings = contentRef.current.querySelectorAll('h2, h3, h4');
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [contentRef, tocItems]);

  // Scroll to heading when clicking on TOC item
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 100, // Offset for fixed header
        behavior: 'smooth',
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Table of Contents</h3>
      <nav>
        <ul className="space-y-2">
          {tocItems.map((item) => (
            <li
              key={item.id}
              style={{ paddingLeft: `${(item.level - 2) * 16}px` }}
              className={`text-sm transition-colors ${
                activeId === item.id
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}
            >
              <button
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className="text-left w-full py-1 focus:outline-none"
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </motion.div>
  );
};

export default BlogTableOfContents;
