import React from 'react';
import Metadata from '../utils/Metadata';
import { BlogPost } from '../../lib/supabase';
import { generateBlogStructuredData } from '../../utils/blogAnalytics';

interface BlogPostMetaProps {
  post: BlogPost;
  url: string;
}

/**
 * Component for adding metadata to the blog post page
 */
const BlogPostMeta: React.FC<BlogPostMetaProps> = ({ post, url }) => {
  // Generate structured data
  const structuredData = generateBlogStructuredData(post, url);

  // Get meta title and description
  const metaTitle = post.meta_title || post.title;
  const metaDescription = post.meta_description || post.summary;

  return (
    <Metadata
      title={metaTitle}
      description={metaDescription}
      keywords={post.meta_keywords}
      ogTitle={metaTitle}
      ogDescription={metaDescription}
      ogType="article"
      ogUrl={url}
      ogImage={post.featured_image_url}
      twitterCard="summary_large_image"
      twitterTitle={metaTitle}
      twitterDescription={metaDescription}
      twitterImage={post.featured_image_url}
      articlePublishedTime={post.published_at}
      articleModifiedTime={post.updated_at}
      articleSection={post.category?.name}
      articleTags={post.tags?.map(tag => tag.name)}
    >
      {/* Structured data for SEO */}
      <script type="application/ld+json">{structuredData}</script>
    </Metadata>
  );
};

export default BlogPostMeta;
