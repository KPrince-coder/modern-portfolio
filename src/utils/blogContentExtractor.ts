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
 * Extract all blog data from AI-generated content
 * @param content Markdown content
 * @returns Structured blog data
 */
export const extractBlogData = (content: string): ExtractedBlogData => {
  const title = extractTitle(content);
  const summary = extractSummary(content);
  const metaTitle = extractMetaTitle(content) || title;
  const metaDescription = extractMetaDescription(content) || summary;
  const metaKeywords = extractMetaKeywords(content);
  const tags = extractTags(content);
  const suggestedImages = extractSuggestedImages(content);
  const youtubeEmbeds = extractYoutubeEmbeds(content);
  const cleanedContent = cleanupContent(content);
  
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
