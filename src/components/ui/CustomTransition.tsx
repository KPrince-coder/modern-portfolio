import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionProps {
  show?: boolean;
  appear?: boolean;
  as?: React.ElementType;
  children: ReactNode;
  className?: string;
}

interface TransitionChildProps {
  as?: React.ElementType;
  enter?: string;
  enterFrom?: string;
  enterTo?: string;
  leave?: string;
  leaveFrom?: string;
  leaveTo?: string;
  children: ReactNode;
  className?: string;
}

// Main Transition component
const Transition: React.FC<TransitionProps> & {
  Child: React.FC<TransitionChildProps>;
  Root: React.FC<TransitionProps>;
} = ({ 
  show = true, 
  appear = false, 
  as: Component = React.Fragment, 
  children,
  className = ''
}) => {
  return (
    <AnimatePresence>
      {show && (
        <Component className={className}>
          {children}
        </Component>
      )}
    </AnimatePresence>
  );
};

// Transition Child component
const TransitionChild: React.FC<TransitionChildProps> = ({ 
  as: Component = motion.div,
  enter = 'transition-opacity ease-linear duration-300',
  enterFrom = 'opacity-0',
  enterTo = 'opacity-100',
  leave = 'transition-opacity ease-linear duration-300',
  leaveFrom = 'opacity-100',
  leaveTo = 'opacity-0',
  children,
  className = ''
}) => {
  // Parse the transition classes to create framer-motion variants
  const getVariants = () => {
    // This is a simplified implementation
    // In a real implementation, you would parse the Tailwind classes more thoroughly
    const initial = enterFrom.includes('opacity-0') ? { opacity: 0 } : {};
    const animate = enterTo.includes('opacity-100') ? { opacity: 1 } : {};
    const exit = leaveTo.includes('opacity-0') ? { opacity: 0 } : {};
    
    // Handle transform classes
// @ts-ignore
    if (enterFrom.includes('translate-x-full')) initial.x = '100%';
// @ts-ignore
    if (enterTo.includes('translate-x-0')) animate.x = 0;
// @ts-ignore
    if (leaveTo.includes('translate-x-full')) exit.x = '100%';
    
// @ts-ignore
    if (enterFrom.includes('translate-y-full')) initial.y = '100%';
// @ts-ignore
    if (enterTo.includes('translate-y-0')) animate.y = 0;
// @ts-ignore
    if (leaveTo.includes('translate-y-full')) exit.y = '100%';
    
    if (enterFrom.includes('scale-')) {
      const scaleMatch = enterFrom.match(/scale-(\d+)/);
// @ts-ignore
      if (scaleMatch) initial.scale = parseInt(scaleMatch[1]) / 100;
    }
    
    if (enterTo.includes('scale-')) {
      const scaleMatch = enterTo.match(/scale-(\d+)/);
// @ts-ignore
      if (scaleMatch) animate.scale = parseInt(scaleMatch[1]) / 100;
    }
    
    if (leaveTo.includes('scale-')) {
      const scaleMatch = leaveTo.match(/scale-(\d+)/);
// @ts-ignore
      if (scaleMatch) exit.scale = parseInt(scaleMatch[1]) / 100;
    }
    
    return { initial, animate, exit };
  };
  
  const { initial, animate, exit } = getVariants();
  
  // Parse duration from transition classes
  const getDuration = () => {
    const durationMatch = enter.match(/duration-(\d+)/);
    return durationMatch ? parseInt(durationMatch[1]) / 1000 : 0.3;
  };
  
  return (
    <Component
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{ duration: getDuration() }}
      className={className}
    >
      {children}
    </Component>
  );
};

// Alias for Transition
const TransitionRoot = Transition;

// Assign subcomponents
Transition.Child = TransitionChild;
Transition.Root = TransitionRoot;

export default Transition;
