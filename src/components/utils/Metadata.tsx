import React from 'react';

interface MetadataProps {
  title: string;
  description?: string;
  canonical?: string;
  author?: string;
  keywords?: string | string[];
  robots?: string;
  language?: string;
  category?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogUrl?: string;
  ogImage?: string;
  ogSiteName?: string;
  ogLocale?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  children?: React.ReactNode;
}

/**
 * Metadata component using React 19's native metadata support
 */
const Metadata: React.FC<MetadataProps> = ({
  title,
  description,
  canonical,
  author,
  keywords,
  robots,
  language,
  category,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogUrl,
  ogImage,
  ogSiteName,
  ogLocale,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterSite,
  twitterCreator,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  children,
}) => {
  // Format keywords if they're an array
  const formattedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <>
      {/* Basic metadata */}
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {author && <meta name="author" content={author} />}
      {formattedKeywords && <meta name="keywords" content={formattedKeywords} />}
      {robots && <meta name="robots" content={robots} />}
      {language && <meta name="language" content={language} />}
      {category && <meta name="category" content={category} />}

      {/* Open Graph metadata */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogType && <meta property="og:type" content={ogType} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}
      {ogLocale && <meta property="og:locale" content={ogLocale} />}

      {/* Twitter Card metadata */}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* Article metadata (for og:type="article") */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {articleTags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Additional metadata */}
      {children}
    </>
  );
};

export default Metadata;

