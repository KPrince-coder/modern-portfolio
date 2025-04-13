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
  readingTime?: string;
  category?: string;
  locale?: string;
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
  readingTime,
  category,
  locale = 'en_US',
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
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content={locale.split('_')[0]} />
      {category && <meta name="category" content={category} />}
      {tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={formattedImageUrl} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      {readingTime && <meta property="og:reading_time" content={readingTime} />}

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
      <meta name="twitter:image:alt" content={title} />
      <meta name="twitter:site" content="@portfoliosite" />
      {author && <meta name="twitter:creator" content={`@${author.replace(/\s+/g, '').toLowerCase()}`} />}

      {/* JSON-LD structured data */}
      {type === 'article' ? (
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
            ...(readingTime && { timeRequired: `PT${readingTime.replace(/\D/g, '')}M` }),
            ...(category && { articleSection: category }),
            ...(tags.length > 0 && { keywords: tags.join(', ') }),
          })}
        </script>
      ) : (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: canonicalUrl,
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
          })}
        </script>
      )}
    </Helmet>
  );
};

export default MetadataManager;
