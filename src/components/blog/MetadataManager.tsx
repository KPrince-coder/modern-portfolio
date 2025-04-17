import React from 'react';
import Metadata from '../utils/Metadata';

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
    <Metadata
      title={title}
      description={description}
      canonical={canonicalUrl}
      author={author}
      robots="index, follow"
      language={locale.split('_')[0]}
      category={category}
      keywords={tags.length > 0 ? tags : undefined}
      ogType={type}
      ogUrl={canonicalUrl}
      ogTitle={title}
      ogDescription={description}
      ogImage={formattedImageUrl}
      ogSiteName={siteName}
      ogLocale={locale}
      twitterCard="summary_large_image"
      twitterTitle={title}
      twitterDescription={description}
      twitterImage={formattedImageUrl}
      twitterSite="@portfoliosite"
      twitterCreator={author ? `@${author.replace(/\s+/g, '').toLowerCase()}` : undefined}
      articlePublishedTime={type === 'article' ? publishedTime : undefined}
      articleModifiedTime={type === 'article' ? modifiedTime : undefined}
      articleSection={type === 'article' ? category : undefined}
      articleTags={type === 'article' ? tags : undefined}
    >
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
    </Metadata>
  );
};

export default MetadataManager;
