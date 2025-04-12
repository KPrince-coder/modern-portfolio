/**
 * Utility functions for extracting and manipulating blog post sections
 */

export interface BlogSection {
  id: string;
  title: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

/**
 * Extract sections from markdown content based on headings
 * @param content Markdown content
 * @returns Array of blog sections
 */
export const extractSections = (content: string): BlogSection[] => {
  // Regular expression to match headings (## or ###)
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const sections: BlogSection[] = [];
  
  // Find all headings
  let match;
  const headings: { level: number; title: string; index: number }[] = [];
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length, // Number of # characters
      title: match[2].trim(),
      index: match.index,
    });
  }
  
  // Create sections based on headings
  for (let i = 0; i < headings.length; i++) {
    const currentHeading = headings[i];
    const nextHeading = headings[i + 1];
    
    const startIndex = currentHeading.index;
    const endIndex = nextHeading ? nextHeading.index : content.length;
    
    // Extract the section content
    const sectionContent = content.substring(startIndex, endIndex).trim();
    
    sections.push({
      id: `section-${i}`,
      title: currentHeading.title,
      content: sectionContent,
      startIndex,
      endIndex,
    });
  }
  
  // If there are no headings, treat the entire content as one section
  if (sections.length === 0 && content.trim()) {
    sections.push({
      id: 'section-0',
      title: 'Content',
      content: content,
      startIndex: 0,
      endIndex: content.length,
    });
  }
  
  return sections;
};

/**
 * Replace a section in the content with new content
 * @param originalContent Full markdown content
 * @param section Section to replace
 * @param newSectionContent New content for the section
 * @returns Updated content
 */
export const replaceSection = (
  originalContent: string,
  section: BlogSection,
  newSectionContent: string
): string => {
  return (
    originalContent.substring(0, section.startIndex) +
    newSectionContent +
    originalContent.substring(section.endIndex)
  );
};

export default {
  extractSections,
  replaceSection,
};
