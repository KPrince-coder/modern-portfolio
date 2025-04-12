import React, { Fragment, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  static?: boolean;
}

interface DialogOverlayProps {
  onClick?: () => void;
  className?: string;
}

interface DialogPanelProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

// Main Dialog component
const Dialog: React.FC<DialogProps> & {
  Overlay: React.FC<DialogOverlayProps>;
  Panel: React.FC<DialogPanelProps>;
  Title: React.FC<DialogTitleProps>;
  Description: React.FC<DialogDescriptionProps>;
} = ({ open, onClose, children, className = '', static: isStatic = false }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isStatic) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when dialog is open
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling when dialog is closed
    };
  }, [open, onClose, isStatic]);

  // Handle click outside dialog
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dialogRef.current && 
        !dialogRef.current.contains(e.target as Node) && 
        !isStatic
      ) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose, isStatic]);

  return (
    <AnimatePresence>
      {open && (
        <div 
          className={`fixed inset-0 z-50 overflow-y-auto ${className}`}
          aria-modal="true"
          role="dialog"
        >
          <div className="flex min-h-screen items-center justify-center p-4 text-center">
            {children}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Dialog Overlay component
const DialogOverlay: React.FC<DialogOverlayProps> = ({ onClick, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm ${className}`}
      aria-hidden="true"
      onClick={onClick}
    />
  );
};

// Dialog Panel component
const DialogPanel: React.FC<DialogPanelProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Dialog Title component
const DialogTitle: React.FC<DialogTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-medium leading-6 text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

// Dialog Description component
const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className = '' }) => {
  return (
    <div className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </div>
  );
};

// Assign subcomponents
Dialog.Overlay = DialogOverlay;
Dialog.Panel = DialogPanel;
Dialog.Title = DialogTitle;
Dialog.Description = DialogDescription;

export default Dialog;
