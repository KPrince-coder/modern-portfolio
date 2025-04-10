import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useSupabase';

interface SearchResult {
  id: string;
  title: string;
  type: 'project' | 'blog';
  url: string;
}

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  const { data: projects } = useProjects();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search with Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Close search with Escape
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when search is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    const searchResults: SearchResult[] = [];
    
    // Search in projects
    if (projects) {
      const matchedProjects = projects
        .filter(project => 
          project.title.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase()) ||
          project.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        )
        .map(project => ({
          id: project.id,
          title: project.title,
          type: 'project' as const,
          url: `/projects/${project.id}`
        }));
      
      searchResults.push(...matchedProjects);
    }
    
    // TODO: Add blog posts search when implemented
    
    setResults(searchResults);
  }, [query, projects]);

  const handleResultClick = (result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search trigger button */}
      <button
        type="button"
        className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        onClick={() => setIsOpen(true)}
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
      
      {/* Search modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 sm:px-6"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Search container */}
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden"
            >
              {/* Search input */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
                <svg className="w-5 h-5 ml-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full p-4 text-gray-700 dark:text-gray-200 bg-transparent border-none focus:outline-none focus:ring-0"
                  placeholder="Search projects and blog posts..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-md mr-4">
                  ESC
                </div>
              </div>
              
              {/* Search results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <ul className="py-2">
                    {results.map((result) => (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          onClick={() => handleResultClick(result)}
                        >
                          <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            result.type === 'project' 
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          }`}>
                            {result.type === 'project' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            )}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{result.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{result.type}</div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : query.trim() !== '' ? (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Type to search projects and blog posts
                  </div>
                )}
              </div>
              
              {/* Search footer */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <div>
                  <span className="font-medium">Pro tip:</span> Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">K</kbd> to open search
                </div>
                <div>
                  {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
