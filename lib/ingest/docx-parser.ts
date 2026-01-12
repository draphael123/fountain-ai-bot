import mammoth from "mammoth";
import fs from "fs";
import path from "path";

export interface ParsedSection {
  heading: string;
  level: number;
  content: string;
  startOffset: number;
  endOffset: number;
}

interface HtmlElement {
  type: "heading" | "paragraph" | "list";
  level?: number;
  text: string;
}

/**
 * Parse DOCX file and extract structured sections with headings
 */
export async function parseDocx(filePath: string): Promise<ParsedSection[]> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Document not found: ${absolutePath}`);
  }

  const buffer = fs.readFileSync(absolutePath);
  const result = await mammoth.convertToHtml({ buffer });

  if (result.messages.length > 0) {
    console.log("DOCX conversion messages:", result.messages);
  }

  const sections = parseHtmlToSections(result.value);
  return sections;
}

/**
 * Parse HTML output from mammoth into structured sections
 */
function parseHtmlToSections(html: string): ParsedSection[] {
  const elements = extractElements(html);
  const sections: ParsedSection[] = [];
  
  let currentHeading = "Document Start";
  let currentLevel = 0;
  let currentContent: string[] = [];
  let currentOffset = 0;
  let sectionStartOffset = 0;

  for (const element of elements) {
    if (element.type === "heading") {
      // Save previous section if it has content
      if (currentContent.length > 0) {
        const content = currentContent.join("\n\n").trim();
        if (content) {
          sections.push({
            heading: currentHeading,
            level: currentLevel,
            content,
            startOffset: sectionStartOffset,
            endOffset: currentOffset,
          });
        }
      }

      // Start new section
      currentHeading = element.text.trim();
      currentLevel = element.level || 1;
      currentContent = [];
      sectionStartOffset = currentOffset;
    } else {
      // Add content to current section
      const text = element.text.trim();
      if (text) {
        currentContent.push(text);
        currentOffset += text.length + 2; // +2 for paragraph break
      }
    }
  }

  // Don't forget the last section
  if (currentContent.length > 0) {
    const content = currentContent.join("\n\n").trim();
    if (content) {
      sections.push({
        heading: currentHeading,
        level: currentLevel,
        content,
        startOffset: sectionStartOffset,
        endOffset: currentOffset,
      });
    }
  }

  return sections;
}

/**
 * Extract elements (headings, paragraphs, lists) from HTML
 */
function extractElements(html: string): HtmlElement[] {
  const elements: HtmlElement[] = [];

  // Match headings (h1-h6)
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
  // Match paragraphs
  const paragraphRegex = /<p[^>]*>(.*?)<\/p>/gi;
  // Match list items
  const listItemRegex = /<li[^>]*>(.*?)<\/li>/gi;

  // Find all elements with their positions
  interface PositionedElement extends HtmlElement {
    position: number;
  }

  const positioned: PositionedElement[] = [];

  let match;

  // Find headings
  while ((match = headingRegex.exec(html)) !== null) {
    positioned.push({
      type: "heading",
      level: parseInt(match[1]),
      text: stripHtml(match[2]),
      position: match.index,
    });
  }

  // Find paragraphs
  while ((match = paragraphRegex.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text) {
      positioned.push({
        type: "paragraph",
        text,
        position: match.index,
      });
    }
  }

  // Find list items
  while ((match = listItemRegex.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text) {
      positioned.push({
        type: "list",
        text: `• ${text}`,
        position: match.index,
      });
    }
  }

  // Sort by position to maintain document order
  positioned.sort((a, b) => a.position - b.position);

  // Remove position property for return
  for (const el of positioned) {
    elements.push({
      type: el.type,
      level: el.level,
      text: el.text,
    });
  }

  return elements;
}

/**
 * Strip HTML tags from a string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Get plain text content from a DOCX file
 */
export async function getPlainText(filePath: string): Promise<string> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Document not found: ${absolutePath}`);
  }

  const buffer = fs.readFileSync(absolutePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}


