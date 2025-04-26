import React, { useState, useEffect, useRef } from "react";

interface TypedTextProps {
  strings: string[];
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  startDelay?: number;
  loop?: boolean;
  className?: string;
  cursorChar?: string;
  showCursor?: boolean;
}

const TypedText: React.FC<TypedTextProps> = ({
  strings,
  typeSpeed = 80,
  backSpeed = 50,
  backDelay = 1000,
  startDelay = 300,
  loop = true,
  className = "",
  cursorChar = "|",
  showCursor = true,
}) => {
  // State for the current text being displayed
  const [displayText, setDisplayText] = useState("");
  // State for tracking which string in the array we're currently on
  const [stringIndex, setStringIndex] = useState(0);
  // State for tracking if we're currently typing or deleting
  const [isDeleting, setIsDeleting] = useState(false);
  // We'll use a ref for tracking typing speed (for smoother animation)
  const typingSpeedRef = useRef(typeSpeed);
  // Ref to store the timeout ID for cleanup
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to handle the typing animation
  useEffect(() => {
    // Get the current string from the array
    const currentString = strings[stringIndex];

    // Dynamically adjust typing speed for a more natural feel
    // Humans type at varying speeds, so we'll randomize it slightly
    const getRandomSpeed = (baseSpeed: number) => {
      // Vary speed by ±20% for a more natural typing rhythm
      const variation = baseSpeed * 0.2;
      return baseSpeed - variation + Math.random() * variation * 2;
    };

    // Base typing speed - faster when deleting
    const baseSpeed = isDeleting ? backSpeed : typeSpeed;

    // Function to handle the typing animation
    const handleTyping = () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If we're deleting, remove a character
      if (isDeleting) {
        setDisplayText(currentString.substring(0, displayText.length - 1));

        // If we've deleted everything, move to the next string
        if (displayText.length <= 1) {
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(false);
            // Move to the next string if we're looping, or stay on the last string
            const nextIndex = loop
              ? (stringIndex + 1) % strings.length
              : stringIndex < strings.length - 1
              ? stringIndex + 1
              : stringIndex;
            setStringIndex(nextIndex);
          }, startDelay);
          return;
        }
      } else {
        // If we're typing, add a character
        setDisplayText(currentString.substring(0, displayText.length + 1));

        // If we've typed the whole string, start deleting after a delay
        if (displayText.length === currentString.length) {
          timeoutRef.current = setTimeout(() => {
            setIsDeleting(true);
          }, backDelay);
          return;
        }
      }

      // Randomize the typing speed for a more natural feel
      typingSpeedRef.current = getRandomSpeed(baseSpeed);

      // Schedule the next update with the randomized speed
      timeoutRef.current = setTimeout(handleTyping, typingSpeedRef.current);
    };

    // Start the typing animation with a slight delay
    // Use a shorter delay when transitioning between strings
    const initialDelay = displayText === "" ? startDelay : 100;
    timeoutRef.current = setTimeout(handleTyping, initialDelay);

    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    displayText,
    stringIndex,
    isDeleting,
    strings,
    typeSpeed,
    backSpeed,
    backDelay,
    startDelay,
    loop,
  ]);

  return (
    <span className={className}>
      {displayText}
      {showCursor && (
        <span className="typed-cursor animate-cursor-blink">{cursorChar}</span>
      )}
    </span>
  );
};

export default TypedText;
