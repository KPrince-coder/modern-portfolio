/**
 * Utility functions for autosaving form data to localStorage
 */

// Constants
const AUTOSAVE_PREFIX = 'portfolio_autosave_';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds

/**
 * Save data to localStorage with a specific key
 * @param key Unique identifier for the saved data
 * @param data Data to be saved
 */
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const storageKey = `${AUTOSAVE_PREFIX}${key}`;
    const serializedData = JSON.stringify({
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(storageKey, serializedData);
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

/**
 * Load data from localStorage with a specific key
 * @param key Unique identifier for the saved data
 * @returns The saved data or null if not found
 */
export const loadFromLocalStorage = <T>(key: string): { data: T; timestamp: string } | null => {
  try {
    const storageKey = `${AUTOSAVE_PREFIX}${key}`;
    const serializedData = localStorage.getItem(storageKey);
    
    if (!serializedData) {
      return null;
    }
    
    return JSON.parse(serializedData);
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
    return null;
  }
};

/**
 * Clear saved data from localStorage
 * @param key Unique identifier for the saved data
 */
export const clearLocalStorage = (key: string): void => {
  try {
    const storageKey = `${AUTOSAVE_PREFIX}${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error clearing data from localStorage:', error);
  }
};

/**
 * Setup autosave functionality for a form
 * @param key Unique identifier for the form
 * @param getData Function that returns the current form data
 * @returns Cleanup function to stop autosave
 */
export const setupAutosave = <T>(key: string, getData: () => T): () => void => {
  // Initial save
  saveToLocalStorage(key, getData());
  
  // Setup interval for autosave
  const intervalId = setInterval(() => {
    saveToLocalStorage(key, getData());
  }, AUTOSAVE_INTERVAL);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};

/**
 * Format a timestamp into a human-readable string
 * @param timestamp ISO timestamp string
 * @returns Formatted string (e.g., "2 minutes ago")
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Convert to seconds
  const diffSec = Math.floor(diffMs / 1000);
  
  if (diffSec < 60) {
    return `${diffSec} second${diffSec !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to minutes
  const diffMin = Math.floor(diffSec / 60);
  
  if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to hours
  const diffHour = Math.floor(diffMin / 60);
  
  if (diffHour < 24) {
    return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  }
  
  // Convert to days
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
};
