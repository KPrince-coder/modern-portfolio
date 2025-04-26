import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCodeBlockProps {
  className?: string;
  codeSnippets?: string[];
  typingSpeed?: number;
  opacity?: number;
}

const defaultCodeSnippets = [
  `function optimizePerformance(code) {
  const optimized = analyze(code);
  return optimized.applyBestPractices();
}`,
  `const createComponent = ({ props, state }) => {
  return {
    render: () => <div>{state.value}</div>,
    update: (newProps) => {...}
  };
}`,
  `async function fetchData() {
  try {
    const response = await api.get('/data');
    return response.data;
  } catch (error) {
    console.error(error);
  }
}`,
  `class AIAssistant {
  constructor(model) {
    this.model = model;
    this.context = [];
  }
  
  async generateResponse(prompt) {
    return this.model.predict(prompt, this.context);
  }
}`
];

const AnimatedCodeBlock: React.FC<AnimatedCodeBlockProps> = ({
  className = '',
  codeSnippets = defaultCodeSnippets,
  typingSpeed = 30,
  opacity = 0.1
}) => {
  const [currentSnippetIndex, setCurrentSnippetIndex] = useState(0);
  const [displayedCode, setDisplayedCode] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  // For performance optimization
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const adjustedTypingSpeed = isMobile ? typingSpeed * 2 : typingSpeed;
  
  useEffect(() => {
    if (!isTyping) return;
    
    const currentSnippet = codeSnippets[currentSnippetIndex];
    
    if (displayedCode.length < currentSnippet.length) {
      const timeout = setTimeout(() => {
        setDisplayedCode(currentSnippet.substring(0, displayedCode.length + 1));
      }, adjustedTypingSpeed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsTyping(false);
      const timeout = setTimeout(() => {
        setIsTyping(true);
        setDisplayedCode('');
        setCurrentSnippetIndex((prevIndex) => (prevIndex + 1) % codeSnippets.length);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [displayedCode, currentSnippetIndex, codeSnippets, isTyping, adjustedTypingSpeed]);
  
  return (
    <motion.div
      className={`font-mono text-xs sm:text-sm md:text-base whitespace-pre-wrap ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1 }}
      style={{ lineHeight: 1.5 }}
    >
      {displayedCode}
      <span className="inline-block w-2 h-4 ml-1 bg-current animate-cursor-blink"></span>
    </motion.div>
  );
};

export default AnimatedCodeBlock;
