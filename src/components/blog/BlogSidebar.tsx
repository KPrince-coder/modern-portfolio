import React from 'react';
import BlogTableOfContents from './BlogTableOfContents';
import BlogAuthorInfo from './BlogAuthorInfo';
import BlogRelatedPosts from './BlogRelatedPosts';
import BlogNewsletterSignup from './BlogNewsletterSignup';

interface BlogSidebarProps {
  postId: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
  aiGenerated?: boolean;
}

/**
 * Component for the blog post sidebar
 */
const BlogSidebar: React.FC<BlogSidebarProps> = ({
  postId,
  contentRef,
  aiGenerated = false
}) => {
  return (
    <div className="space-y-8">
      {/* Table of Contents */}
      <BlogTableOfContents contentRef={contentRef} />

      {/* Author Info */}
      <BlogAuthorInfo aiGenerated={aiGenerated} />

      {/* Related Posts */}
      <BlogRelatedPosts postId={postId} />

      {/* Newsletter Signup */}
      <BlogNewsletterSignup />
    </div>
  );
};

export default BlogSidebar;
