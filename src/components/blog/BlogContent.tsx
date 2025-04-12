import React, { forwardRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';

interface BlogContentProps {
  content: string;
}

const BlogContent = forwardRef<HTMLDivElement, BlogContentProps>(({ content }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="prose prose-lg dark:prose-invert max-w-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Custom rendering for code blocks with syntax highlighting
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom rendering for images
          img({ node, ...props }) {
            return (
              <img
                {...props}
                className="rounded-lg shadow-md my-8 max-w-full h-auto"
                loading="lazy"
              />
            );
          },
          // Custom rendering for links
          a({ node, ...props }) {
            return (
              <a
                {...props}
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              />
            );
          },
          // Custom rendering for headings
          h2({ node, ...props }) {
            const id = props.children?.[0]?.toString().toLowerCase().replace(/\s+/g, '-');
            return <h2 id={id} className="scroll-mt-24" {...props} />;
          },
          h3({ node, ...props }) {
            const id = props.children?.[0]?.toString().toLowerCase().replace(/\s+/g, '-');
            return <h3 id={id} className="scroll-mt-24" {...props} />;
          },
          h4({ node, ...props }) {
            const id = props.children?.[0]?.toString().toLowerCase().replace(/\s+/g, '-');
            return <h4 id={id} className="scroll-mt-24" {...props} />;
          },
          // Custom rendering for blockquotes
          blockquote({ node, ...props }) {
            return (
              <blockquote
                className="border-l-4 border-indigo-500 pl-4 italic text-gray-700 dark:text-gray-300"
                {...props}
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </motion.div>
  );
});

BlogContent.displayName = 'BlogContent';

export default BlogContent;
