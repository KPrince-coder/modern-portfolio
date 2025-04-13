import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Enhanced code block component with language display and copy functionality
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';
  
  // Function to copy code to clipboard
  const copyToClipboard = () => {
    if (children) {
      const code = String(children).replace(/\n$/, '');
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // For inline code, just return a simple code element
  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  // For code blocks, return an enhanced component with language display and copy button
  return (
    <div className="code-block-wrapper relative group my-6 rounded-lg overflow-hidden">
      {/* Language badge */}
      <div className="absolute top-0 right-0 bg-gray-800 text-gray-200 text-xs px-2 py-1 rounded-bl-md font-mono z-10">
        {language}
      </div>
      
      {/* Copy button */}
      <motion.button
        className="absolute top-0 right-16 bg-gray-800 text-gray-200 p-1.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={copyToClipboard}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={copied ? "Copied!" : "Copy code"}
        title={copied ? "Copied!" : "Copy code"}
        type="button"
      >
        {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
      </motion.button>
      
      {/* Syntax highlighter */}
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="rounded-md !mt-0 !mb-0 custom-scrollbar"
        wrapLines={true}
        wrapLongLines={true}
        showLineNumbers={language !== 'text' && language !== 'markdown'}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
