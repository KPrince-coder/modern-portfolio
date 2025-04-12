import React from 'react';
import { Helmet } from 'react-helmet-async';
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
    <Helmet>
      {/* Basic metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={post.meta_keywords} />

      {/* Open Graph metadata for social sharing */}
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      {post.featured_image_url && (
        <meta property="og:image" content={post.featured_image_url} />
      )}
      <meta property="article:published_time" content={post.published_at} />
      <meta property="article:modified_time" content={post.updated_at} />
      {post.category && (
        <meta property="article:section" content={post.category.name} />
      )}
      {post.tags && post.tags.map(tag => (
        <meta key={tag.id} property="article:tag" content={tag.name} />
      ))}

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {post.featured_image_url && (
        <meta name="twitter:image" content={post.featured_image_url} />
      )}

      {/* Structured data for SEO */}
      <script type="application/ld+json">{structuredData}</script>
    </Helmet>
  );
};

export default BlogPostMeta;
