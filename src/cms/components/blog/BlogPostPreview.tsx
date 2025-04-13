import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import BlogLayout from '../../../layouts/BlogLayout';
import BlogContent from '../../../components/blog/BlogContent';
import MetadataManager from '../../../components/blog/MetadataManager';
import Button from '../../../components/ui/Button';
import { FiX } from 'react-icons/fi';

interface BlogPostPreviewProps {
  post: {
    id: string;
    title: string;
    slug: string;
    summary?: string;
    content: string;
    featured_image_url?: string;
    category?: { id: string; name: string; slug: string } | null;
    reading_time_minutes?: number;
    is_featured: boolean;
    status: 'draft' | 'published' | 'archived';
    published_at?: string;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
    ai_generated: boolean;
    created_at: string;
    updated_at: string;
    tags?: { id: string; name: string; slug: string }[];
  };
  onClose: () => void;
}

const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post, onClose }) => {
  const [readTime, setReadTime] = useState<string>('');
  const currentUrl = window.location.href;

  // Calculate reading time
  useEffect(() => {
    if (post.reading_time_minutes) {
      setReadTime(`${post.reading_time_minutes} min`);
    } else {
      // Calculate reading time if not provided
      const wordsPerMinute = 200;
      const wordCount = post.content.trim().split(/\s+/).length;
      const minutes = Math.ceil(wordCount / wordsPerMinute) || 1;
      setReadTime(`${minutes} min`);
    }
  }, [post]);

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Draft';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full h-full bg-white dark:bg-gray-900 overflow-y-auto"
      >
        {/* Preview header with close button */}
        <div className="sticky top-0 z-50 bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center">
            <span className="font-bold mr-2">Preview Mode:</span>
            <span className="text-white/80">{post.title}</span>
          </div>
          <Button
            variant="secondary"
            onClick={onClose}
            className="!bg-white/20 hover:!bg-white/30 !border-transparent"
          >
            <FiX className="mr-2" />
            Close Preview
          </Button>
        </div>

        {/* Blog post preview content */}
        <div className="preview-container">
          <BlogLayout
            title={post.title}
            author={'Admin'}
            date={formatDate(post.published_at)}
            readTime={readTime}
            coverImage={post.featured_image_url}
            slug={post.slug}
            summary={post.summary}
            tags={post.tags}
            category={post.category}
            postId={post.id}
            prevPost={null}
            nextPost={null}
          >
            {/* SEO and Social Sharing Metadata */}
            <MetadataManager
              title={`${post.title} (Preview)`}
              description={post.summary || `Preview: ${post.title}`}
              url={currentUrl}
              imageUrl={post.featured_image_url}
              publishedTime={post.published_at}
              modifiedTime={post.updated_at}
              author={'Admin'}
              tags={post.tags?.map(tag => tag.name) || []}
              type="article"
              readingTime={readTime}
              category={post.category?.name}
            />

            {/* Blog content */}
            <BlogContent content={post.content} />
          </BlogLayout>
        </div>
      </motion.div>
    </div>
  );
};

export default BlogPostPreview;
