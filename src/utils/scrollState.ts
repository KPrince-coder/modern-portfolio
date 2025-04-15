// A simple utility to manage scroll button state across components
let isScrollButtonVisible = false;
const listeners: Array<(visible: boolean) => void> = [];

export const scrollState = {
  // Get current visibility state
  isVisible: () => isScrollButtonVisible,
  
  // Set visibility state and notify listeners
  setVisible: (visible: boolean) => {
    if (isScrollButtonVisible !== visible) {
      console.log(`[scrollState] Setting scroll button visible: ${visible}`);
      isScrollButtonVisible = visible;
      listeners.forEach(listener => listener(visible));
    }
  },
  
  // Subscribe to changes
  subscribe: (listener: (visible: boolean) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
};
