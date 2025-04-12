/**
 * Utility functions for extracting structured data from AI-generated blog content
 */

export interface ExtractedBlogData {
  title: string;
  content: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  tags: string[];
  suggestedImages: Array<{
    alt: string;
    placeholder: string;
  }>;
  youtubeEmbeds: string[];
  featuredImageUrl?: string;
  suggestedCategory?: string;
}

/**
 * Extract title from markdown content
 * @param content Markdown content
 * @returns Extracted title or empty string
 */
export const extractTitle = (content: string): string => {
  // Look for the first h1 heading
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : '';
};

/**
 * Extract summary from markdown content
 * @param content Markdown content
 * @returns Extracted summary or empty string
 */
export const extractSummary = (content: string): string => {
  // Look for the summary section at the end
  const summaryMatch = content.match(/SUMMARY:\s*([^\n]+(?:\n[^\n]+)*)/);
  if (summaryMatch) {
    return summaryMatch[1].trim();
  }

  // If no explicit summary, use the first paragraph
  const firstParagraphMatch = content.match(/^(?:(?!#).+)\n\n(.+?)(?:\n\n|$)/s);
  return firstParagraphMatch ? firstParagraphMatch[1].trim() : '';
};

/**
 * Extract meta title from markdown content
 * @param content Markdown content
 * @returns Extracted meta title or empty string
 */
export const extractMetaTitle = (content: string): string => {
  const metaTitleMatch = content.match(/META_TITLE:\s*(.+)(?:\n|$)/);
  return metaTitleMatch ? metaTitleMatch[1].trim() : '';
};

/**
 * Extract meta description from markdown content
 * @param content Markdown content
 * @returns Extracted meta description or empty string
 */
export const extractMetaDescription = (content: string): string => {
  const metaDescriptionMatch = content.match(/META_DESCRIPTION:\s*(.+)(?:\n|$)/);
  return metaDescriptionMatch ? metaDescriptionMatch[1].trim() : '';
};

/**
 * Extract meta keywords from markdown content
 * @param content Markdown content
 * @returns Extracted meta keywords or empty string
 */
export const extractMetaKeywords = (content: string): string => {
  const metaKeywordsMatch = content.match(/META_KEYWORDS:\s*(.+)(?:\n|$)/);
  return metaKeywordsMatch ? metaKeywordsMatch[1].trim() : '';
};

/**
 * Extract tags from markdown content
 * @param content Markdown content
 * @returns Array of extracted tags
 */
export const extractTags = (content: string): string[] => {
  // Look for tags at the end of the content, usually in a list
  const tagsSection = content.match(/(?:Tags:|Related topics:|Keywords:)\s*\n(?:\s*[-*]\s*([^\n]+)\n)+/i);

  if (tagsSection) {
    const tagMatches = tagsSection[0].matchAll(/[-*]\s*([^\n]+)/g);
    return Array.from(tagMatches, match => match[1].trim());
  }

  // If no explicit tags section, extract from META_KEYWORDS
  const keywords = extractMetaKeywords(content);
  if (keywords) {
    return keywords.split(',').map(keyword => keyword.trim());
  }

  return [];
};

/**
 * Extract suggested images from markdown content
 * @param content Markdown content
 * @returns Array of image objects with alt text and placeholder
 */
export const extractSuggestedImages = (content: string): Array<{ alt: string; placeholder: string }> => {
  const imageMatches = content.matchAll(/!\[(.*?)\]\((image_placeholder_\d+)\)/g);
  return Array.from(imageMatches, match => ({
    alt: match[1].trim(),
    placeholder: match[2].trim(),
  }));
};

/**
 * Extract YouTube video IDs from markdown content
 * @param content Markdown content
 * @returns Array of YouTube video IDs
 */
export const extractYoutubeEmbeds = (content: string): string[] => {
  const embedMatches = content.matchAll(/youtube.com\/embed\/([a-zA-Z0-9_-]+)/g);
  return Array.from(embedMatches, match => match[1].trim());
};

/**
 * Clean up the content by removing metadata sections
 * @param content Markdown content
 * @returns Cleaned content
 */
export const cleanupContent = (content: string): string => {
  return content
    .replace(/SUMMARY:\s*[^\n]+(?:\n[^\n]+)*/g, '')
    .replace(/META_TITLE:\s*.+(?:\n|$)/g, '')
    .replace(/META_DESCRIPTION:\s*.+(?:\n|$)/g, '')
    .replace(/META_KEYWORDS:\s*.+(?:\n|$)/g, '')
    .trim();
};

/**
 * Generate a placeholder image URL based on the blog title and keywords
 * @param title Blog title
 * @param keywords Keywords for the blog
 * @returns URL for a placeholder image
 */
export const generateFeaturedImageUrl = (title: string, keywords: string): string => {
  // Use a service like Unsplash Source to generate a relevant image
  // Format: https://source.unsplash.com/1200x630/?keyword1,keyword2
  const searchTerms = keywords ? keywords.split(',').slice(0, 3).join(',') : title;
  const encodedTerms = encodeURIComponent(searchTerms);
  return `https://source.unsplash.com/1200x630/?${encodedTerms}`;
};

/**
 * Suggest a category based on the content and tags
 * @param content Blog content
 * @param tags Blog tags
 * @param categories Available categories
 * @returns Suggested category ID or undefined
 */
export const suggestCategory = (
  content: string,
  tags: string[],
  categories: Array<{ id: string; name: string }>
): string | undefined => {
  if (!categories || categories.length === 0) return undefined;

  // Common category keywords mapping
  const categoryKeywords: Record<string, string[]> = {
    'technology': ['tech', 'technology', 'programming', 'code', 'software', 'hardware', 'developer', 'development', 'app', 'application'],
    'design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic', 'visual', 'creative'],
    'business': ['business', 'startup', 'entrepreneur', 'marketing', 'sales', 'finance', 'management', 'leadership'],
    'lifestyle': ['lifestyle', 'life', 'health', 'fitness', 'wellness', 'travel', 'food', 'fashion'],
    'education': ['education', 'learning', 'teaching', 'school', 'university', 'college', 'course', 'tutorial'],
    'news': ['news', 'current events', 'update', 'announcement'],
  };

  // Score each category based on content and tags
  const scores: Record<string, number> = {};

  // Initialize scores
  categories.forEach(category => {
    scores[category.id] = 0;
  });

  // Score based on category keywords in content
  Object.entries(categoryKeywords).forEach(([categoryName, keywords]) => {
    // Find matching categories by name (case insensitive)
    const matchingCategories = categories.filter(category =>
      category.name.toLowerCase().includes(categoryName.toLowerCase())
    );

    if (matchingCategories.length > 0) {
      // Check if any keywords appear in the content
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          matchingCategories.forEach(category => {
            scores[category.id] += matches.length;
          });
        }
      });
    }
  });

  // Score based on tags matching category names
  tags.forEach(tag => {
    categories.forEach(category => {
      if (category.name.toLowerCase().includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(category.name.toLowerCase())) {
        scores[category.id] += 5; // Higher weight for tag matches
      }
    });
  });

  // Find the category with the highest score
  let highestScore = 0;
  let suggestedCategoryId: string | undefined = undefined;

  Object.entries(scores).forEach(([categoryId, score]) => {
    if (score > highestScore) {
      highestScore = score;
      suggestedCategoryId = categoryId;
    }
  });

  return suggestedCategoryId;
};

/**
 * Extract all blog data from AI-generated content
 * @param content Markdown content
 * @param categories Optional array of available categories
 * @returns Structured blog data
 */
export const extractBlogData = (
  content: string,
  categories?: Array<{ id: string; name: string }>
): ExtractedBlogData => {
  const title = extractTitle(content);
  const summary = extractSummary(content);
  const metaTitle = extractMetaTitle(content) || title;
  const metaDescription = extractMetaDescription(content) || summary;
  const metaKeywords = extractMetaKeywords(content);
  const tags = extractTags(content);
  const suggestedImages = extractSuggestedImages(content);
  const youtubeEmbeds = extractYoutubeEmbeds(content);
  const cleanedContent = cleanupContent(content);

  // Generate a featured image URL based on the content
  const featuredImageUrl = generateFeaturedImageUrl(title, metaKeywords);

  // Suggest a category if categories are provided
  const suggestedCategory = categories ? suggestCategory(content, tags, categories) : undefined;

  return {
    title,
    content: cleanedContent,
    summary,
    metaTitle,
    metaDescription,
    metaKeywords,
    tags,
    suggestedImages,
    youtubeEmbeds,
    featuredImageUrl,
    suggestedCategory,
  };
};

export default {
  extractBlogData,
  extractTitle,
  extractSummary,
  extractMetaTitle,
  extractMetaDescription,
  extractMetaKeywords,
  extractTags,
  extractSuggestedImages,
  extractYoutubeEmbeds,
  cleanupContent,
};
