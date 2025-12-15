/**
 * Strip HTML tags from a string
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Create a temporary div element
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Return the text content
  return temp.textContent || temp.innerText || '';
};

/**
 * Truncate text to a specific length and add ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};
