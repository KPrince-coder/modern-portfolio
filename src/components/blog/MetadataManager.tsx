import React from 'react';
import { Helmet } from 'react-helmet-async';

interface MetadataManagerProps {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
  type?: 'article' | 'website';
}

/**
 * Manages SEO and social sharing metadata
 * Implements Open Graph, Twitter Cards, and standard meta tags
 */
const MetadataManager: React.FC<MetadataManagerProps> = ({
  title,
  description,
  url,
  imageUrl,
  publishedTime,
  modifiedTime,
  author = 'Admin',
  tags = [],
  type = 'article',
}) => {
  // Format the site name
  const siteName = 'Modern Portfolio Blog';
  
  // Format the canonical URL
  const canonicalUrl = url.startsWith('http') ? url : `https://example.com${url}`;
  
  // Format the image URL
  const formattedImageUrl = imageUrl?.startsWith('http') 
    ? imageUrl 
    : imageUrl 
      ? `https://example.com${imageUrl}` 
      : 'https://example.com/default-og-image.jpg';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={formattedImageUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Additional article meta tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      
      {/* Article tags */}
      {type === 'article' && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={formattedImageUrl} />
      
      {/* JSON-LD structured data for articles */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: description,
            image: formattedImageUrl,
            author: {
              '@type': 'Person',
              name: author,
            },
            publisher: {
              '@type': 'Organization',
              name: siteName,
              logo: {
                '@type': 'ImageObject',
                url: 'https://example.com/logo.png',
              },
            },
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': canonicalUrl,
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

export default MetadataManager;
