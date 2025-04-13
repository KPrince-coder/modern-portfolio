import React from 'react';
import BlogPostSkeleton from './BlogPostSkeleton';

/**
 * Custom suspense fallback for blog posts
 * Uses the same skeleton as the loading state for consistency
 */
const BlogSuspenseFallback: React.FC = () => {
  return <BlogPostSkeleton />;
};

export default BlogSuspenseFallback;
