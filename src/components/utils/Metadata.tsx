import React from 'react';
import { Helmet } from 'react-helmet-async';

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
  ogImageAlt?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageType?: string;
  ogSiteName?: string;
  ogLocale?: string;
  fbAppId?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  twitterSite?: string;
  twitterCreator?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  favicon?: string;
  themeColor?: string;
  viewport?: string;
  alternate?: Array<{lang: string, url: string}>;
  children?: React.ReactNode;
}

/**
 * Metadata component using react-helmet-async for managing document head
 */
const Metadata: React.FC<MetadataProps> = ({
  title,
  description,
  canonical,
  author,
  keywords,
  robots = 'index, follow',
  language = 'en',
  category,
  ogTitle,
  ogDescription,
  ogType = 'website',
  ogUrl,
  ogImage,
  ogImageAlt,
  ogImageWidth = 1200,
  ogImageHeight = 630,
  ogImageType = 'image/jpeg',
  ogSiteName = 'Modern Portfolio',
  ogLocale = 'en_US',
  fbAppId,
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  twitterImageAlt,
  twitterSite = '@modernportfolio',
  twitterCreator,
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  articleTags,
  favicon = '/favicon.ico',
  themeColor = '#6366f1', // Indigo color from Tailwind
  viewport = 'width=device-width, initial-scale=1.0',
  alternate,
  children,
}) => {
  // Format keywords if they're an array
  const formattedKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{title}</title>
      <meta name="viewport" content={viewport} />
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      {author && <meta name="author" content={author} />}
      {formattedKeywords && <meta name="keywords" content={formattedKeywords} />}
      <meta name="language" content={language} />
      {category && <meta name="category" content={category} />}

      {/* Favicon and theme color */}
      <link rel="icon" href={favicon} />
      <meta name="color-scheme" content="light dark" />
      <meta name="theme-color" content={themeColor} media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content={themeColor} media="(prefers-color-scheme: dark)" />
      <meta name="msapplication-TileColor" content={themeColor} />
      <meta name="msapplication-navbutton-color" content={themeColor} />

      {/* Open Graph metadata */}
      <meta property="og:title" content={ogTitle ?? title} />
      <meta property="og:description" content={ogDescription ?? description ?? ''} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl ?? canonical ?? window.location.href} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:width" content={String(ogImageWidth)} />}
      {ogImage && <meta property="og:image:height" content={String(ogImageHeight)} />}
      {ogImage && <meta property="og:image:type" content={ogImageType} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      <meta property="og:site_name" content={ogSiteName} />
      <meta property="og:locale" content={ogLocale} />
      {fbAppId && <meta property="fb:app_id" content={fbAppId} />}

      {/* Twitter Card metadata */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle ?? ogTitle ?? title} />
      <meta name="twitter:description" content={twitterDescription ?? ogDescription ?? description ?? ''} />
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}
      {twitterImageAlt && <meta name="twitter:image:alt" content={twitterImageAlt} />}
      <meta name="twitter:site" content={twitterSite} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      <meta name="twitter:domain" content={window.location.hostname} />

      {/* Article metadata (for og:type="article") */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {articleTags?.map(tag => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Alternate language versions */}
      {alternate?.map(alt => (
        <link key={alt.lang} rel="alternate" hrefLang={alt.lang} href={alt.url} />
      ))}

      {/* Additional metadata */}
      {children}
    </Helmet>
  );
};

export default Metadata;



