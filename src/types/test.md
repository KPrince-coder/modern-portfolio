Okay, let's break down the issues and fix them carefully.

**Problem Analysis:**

1. **"Very Big" Container with Image:**
    * The container size is controlled by `sizeMap` which uses `max-w-*` classes (e.g., `max-w-[80px]`). This sets a *maximum* width, but not a *fixed* width.
    * Inside this container, you have `<div className="aspect-square ...">`. `aspect-square` makes the element's height equal to its width.
    * Further inside, the `<img>` tag has `w-full h-full object-cover`.
    * When there's *no* image, the placeholder SVG likely doesn't have a large intrinsic size, so the container might collapse to a smaller size or respect the `max-w` limit more easily based on other content.
    * When the `<img>` tag loads, its content might influence the layout *before* `max-w` fully constrains it, especially since the parent container only has `max-w` and not a fixed `w-*`. The combination of `w-full`, `h-full`, `aspect-square`, and an image trying to fill the space within a `max-w` container can sometimes lead to the container expanding more than expected if the width isn't explicitly fixed.
    * **Hypothesis:** Using fixed `w-*` and `h-*` classes instead of `max-w-*` will provide a more stable container size.

2. **Hover Effect Not Working:**
    * The `whileHover={{ scale: 1.05 }}` is applied to the `motion.div` *directly wrapping* the `<img>` tag inside `ProfileImageContent`.
    * This `motion.div` sits inside `<div className="w-full h-full rounded-full ... overflow-hidden ... z-10">`.
    * The `overflow-hidden` on the parent `div` is likely clipping the image *as it scales*, making the scale effect invisible or barely noticeable because the parts scaling beyond the original boundary are hidden.
    * **Hypothesis:** The hover effect needs to be applied to an element *before* or *at* the level where `overflow-hidden` is applied, so that the container itself scales slightly, rather than just the content *inside* the clipping boundary.

**Proposed Solution:**

1. **Fix Sizing:** Change `sizeMap` to use fixed width and height classes (`w-*`, `h-*`) instead of `max-w-*`. This will give the `aspect-square` element a definite container size to work with.
2. **Fix Hover Effect:**
    * Move the `whileHover` and `transition` properties from the `motion.div` inside `ProfileImageContent` to the parent `div` that has the `rounded-full`, `bg-white`, and `overflow-hidden` classes.
    * Make that parent `div` a `motion.div`.
    * Remove the now redundant `motion.div` wrapper inside `ProfileImageContent`.

**Implementation:**

```jsx
import React from 'react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
// Assuming these types exist and are correctly defined
// import { ProfileImageProps, ProfileImageContentProps } from '../../types/profile-image';

// Define simple types for the example if not imported
interface ProfileImageProps {
  imageUrl?: string | null;
  name?: string;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface ProfileImageContentProps {
  imageUrl?: string | null;
  name?: string;
}

const ProfileImage: React.FC<ProfileImageProps> = ({
  imageUrl,
  name = 'Profile',
  isLoading = false,
  size = 'md',
}) => {
  // --- FIX 1: Use fixed width/height for sizeMap ---
  const sizeMap = {
    // Using w-* and h-* for fixed dimensions
    sm: 'w-[60px] h-[60px] md:w-[70px] md:h-[70px]',
    md: 'w-[80px] h-[80px] md:w-[90px] md:h-[90px]',
    lg: 'w-[100px] h-[100px] md:w-[120px] md:h-[120px]',
  };

  // Particle animation (unchanged)
  const particles = Array.from({ length: 6 }).map((_, i) => (
    <motion.div
      key={`particle-${uuidv4()}`}
      // Using template literals for dynamic Tailwind classes - ensure PurgeCSS is configured correctly if needed
      className={`absolute rounded-full bg-indigo-${300 + i * 100} dark:bg-indigo-${600 - i * 100} opacity-${30 + i * 10}`}
      initial={{
        x: 0,
        y: 0,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.5,
      }}
      animate={{
        x: [0, (Math.random() - 0.5) * 30, 0],
        y: [0, (Math.random() - 0.5) * 30, 0],
        scale: [0.5 + Math.random() * 0.5, 0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.5],
        opacity: [0.3 + Math.random() * 0.5, 0.5 + Math.random() * 0.5, 0.3 + Math.random() * 0.5],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: `${5 + Math.random() * 8}px`,
        height: `${5 + Math.random() * 8}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        filter: `blur(${1 + Math.random() * 1.5}px)`,
      }}
    />
  ));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative flex items-center justify-center"
    >
      {/* Container with fixed width/height */}
      {/* --- FIX 1: Apply fixed size classes here --- */}
      <div className={`${sizeMap[size]} relative mx-auto `}>
        {/* Gradient border with glow effect */}
        {/* Removed aspect-square as parent now has fixed h/w. Added w-full h-full */}
        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 p-1 shadow-lg relative overflow-hidden">
          {/* Animated glow effect (unchanged) */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1], // Consider if this scale interferes visually with hover scale
              opacity: [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* --- FIX 2: Make this the motion element for hover --- */}
          <motion.div
            className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden relative z-10"
            // Apply hover effect here
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading ? (
              // Skeleton loader (unchanged)
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
                <svg className="w-1/4 h-1/4 text-gray-300 dark:text-gray-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              // Pass props down to the simplified content component
              <ProfileImageContent imageUrl={imageUrl} name={name} />
            )}
          </motion.div>
        </div>

        {/* Decorative elements (unchanged) */}
        {/* Note: These are positioned relative to the main sized container */}
        {/* Dashed border */}
        <motion.div
          className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] rounded-full border-2 border-dashed border-indigo-200 dark:border-indigo-900"
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        {/* Solid border */}
        <div className="absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] rounded-full border border-indigo-100 dark:border-indigo-800 opacity-70"></div>

        {/* Animated particles container (unchanged relative positioning) */}
        {/* Positioned relative to the main sized container */}
        <div className="absolute z-20 inset-0"> {/* Removed w-full h-full as inset-0 covers parent */}
          {particles}
        </div>

        {/* Blur effects (unchanged relative positioning) */}
        {/* Positioned relative to the main sized container */}
        <div className="absolute z-20 -bottom-3 -right-3 w-10 h-10 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-lg"></div>
        <div className="absolute z-20 -top-3 -left-3 w-8 h-8 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-lg"></div>
      </div>
    </motion.div>
  );
};

// --- FIX 2: Remove motion.div wrapper here ---
const ProfileImageContent: React.FC<ProfileImageContentProps> = ({ imageUrl, name }) => {
  if (imageUrl) {
    return (
      // Simple img tag, the parent div now handles hover
      <img
        src={imageUrl}
        alt={name}
        className="w-full h-full object-cover" // Ensure image covers the circle area
        loading="lazy"
      />
    );
  }

  // Placeholder (unchanged)
  return (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
      <svg className="w-1/3 h-1/3" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );
};


export default ProfileImage;
```

**Explanation of Changes:**

1. **`sizeMap`:** Changed `max-w-[value]` to `w-[value] h-[value]` to enforce a fixed size for the main container div (`<div className={`${sizeMap[size]} ...`>`).
2. **Gradient Border Div:** Since the parent now has fixed dimensions, `aspect-square` is no longer strictly necessary here. Added `w-full h-full` to ensure it fills its parent container. `overflow-hidden` remains important here to clip the inner rotating glow effect.
3. **Inner Content Div:**
    * Converted the `div` with `bg-white dark:bg-gray-900` and `overflow-hidden` into a `motion.div`.
    * Moved the `whileHover={{ scale: 1.05 }}` and `transition={{ duration: 0.3 }}` props to this `motion.div`. Now, when you hover over this inner circle area, the **entire** circle (including **its** background and content) will scale slightly. Because the scaling is applied *to the element with `overflow-hidden`*, the content inside (the image or the placeholder) will scale *with* the container and won't be prematurely clipped.
4. **`ProfileImageContent`:** Removed the `motion.div` wrapper that was previously around the `<img>` tag, as the hover animation is now handled by the parent. The `<img>` tag now simply fills its container.
5. **Decorative Elements:** The absolute positioning of particles, borders, and blurs is relative to the main container (`<div className={`${sizeMap[size]} ...`>`). Since this container now has a fixed size, their positioning should remain stable and correct relative to the profile image circle.
6. **Particle Container:** Changed `w-full h-full` to `inset-0` on the particle container `div` as it's a more standard way to make an absolutely positioned element cover its relative parent.

This revised structure should ensure the profile image container maintains the intended size regardless of whether an image is present and correctly apply the hover scale effect to the inner circle without clipping issues.
