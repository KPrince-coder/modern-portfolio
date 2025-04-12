import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
// Using a custom tabs implementation instead of headlessui
import SimpleTabs from '../../../components/ui/SimpleTabs';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { LinkModal, YouTubeModal, TableModal, HtmlModal, ConfirmModal, ImageLinkModal } from '../../../components/ui/modals';

// We'll use dynamic imports for file processing libraries
// These will be imported only when needed

interface BlogPostContentProps {
  content: string;
  error?: string;
  onChange: (content: string) => void;
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({
  content,
  error,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editorMode, setEditorMode] = useState<'markdown' | 'rich'>('markdown');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal states
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [htmlModalOpen, setHtmlModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [imageLinkModalOpen, setImageLinkModalOpen] = useState(false);

  // Selected text state for modals
  const [selectedText, setSelectedText] = useState({
    text: '',
    start: 0,
    end: 0,
    originalAltText: ''
  });

  // Rich text formatting toolbar buttons
  const formatButtons = [
    // Text formatting
    { label: 'Bold', icon: '𝐁', format: '**', example: '**bold text**', group: 'format' },
    { label: 'Italic', icon: '𝐼', format: '*', example: '*italic text*', group: 'format' },
    { label: 'Strikethrough', icon: '𝐒̶', format: '~~', example: '~~strikethrough~~', group: 'format' },
    { label: 'Underline', icon: '𝐔', format: '<u>', closeFormat: '</u>', example: '<u>underlined text</u>', group: 'format' },
    { label: 'Superscript', icon: 'ˣ', format: '<sup>', closeFormat: '</sup>', example: '<sup>superscript</sup>', group: 'format' },
    { label: 'Subscript', icon: 'ₓ', format: '<sub>', closeFormat: '</sub>', example: '<sub>subscript</sub>', group: 'format' },
    { label: 'Highlight', icon: '🖌️', format: '<mark>', closeFormat: '</mark>', example: '<mark>highlighted text</mark>', group: 'format' },

    // Headings
    { label: 'Heading 1', icon: 'H1', format: '# ', isBlock: true, group: 'heading' },
    { label: 'Heading 2', icon: 'H2', format: '## ', isBlock: true, group: 'heading' },
    { label: 'Heading 3', icon: 'H3', format: '### ', isBlock: true, group: 'heading' },
    { label: 'Heading 4', icon: 'H4', format: '#### ', isBlock: true, group: 'heading' },

    // Block elements
    { label: 'Quote', icon: '❝', format: '> ', isBlock: true, group: 'block' },
    { label: 'Code Block', icon: '{ }', format: '```\n', closeFormat: '\n```', example: '```\ncode block\n```', group: 'block' },
    { label: 'Horizontal Rule', icon: '―', format: '\n---\n', isBlock: true, group: 'block' },

    // Lists
    { label: 'Bullet List', icon: '•', format: '- ', isBlock: true, group: 'list' },
    { label: 'Numbered List', icon: '1.', format: '1. ', isBlock: true, group: 'list' },
    { label: 'Task List', icon: '☑️', format: '- [ ] ', isBlock: true, group: 'list' },

    // Media
    { label: 'Link', icon: '🔗', format: '[](url)', handler: insertLink, group: 'media' },
    { label: 'Image', icon: '🖼️', format: '![](url)', handler: insertImage, group: 'media' },
    { label: 'YouTube Video', icon: '▶️', handler: insertYouTubeVideo, group: 'media' },

    // Tables
    { label: 'Table', icon: '⊞', handler: insertTable, group: 'table' },

    // Advanced
    { label: 'HTML', icon: '</>', handler: insertHTML, group: 'advanced' },
    { label: 'Clear Formatting', icon: 'Aa', handler: clearFormatting, group: 'advanced' },
  ];

  // Function to handle inserting a link
  function insertLink(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);

    // Save selected text info for the modal
    setSelectedText({ text, start, end, originalAltText: text });

    // Open the link modal
    setLinkModalOpen(true);
  }

  // Handle link confirmation from modal
  const handleLinkConfirm = (url: string, linkText: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { start, end } = selectedText;

    const finalLinkText = linkText || selectedText.text || 'link text';
    const linkMarkdown = `[${finalLinkText}](${url})`;
    const newValue = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);

    onChange(newValue);

    // Close the modal
    setLinkModalOpen(false);

    // Set cursor position after the inserted link
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + linkMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Function to handle inserting an image
  function insertImage(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const altText = textarea.value.substring(start, end) || 'image';

    // Show options for image insertion
    // Store the original alt text and cursor position
    const originalAltText = altText;

    // Set the selected text for the modal
    setSelectedText({
      text: 'How would you like to add an image?',
      start,
      end,
      originalAltText // Store the original alt text as a property
    });

    // Open the modal
    setConfirmModalOpen(true);
  }

  // Handle image from URL
  const handleImageFromUrl = () => {
    setConfirmModalOpen(false);
    setImageLinkModalOpen(true);
  }

  // Handle image from local file
  const handleImageFromFile = () => {
    setConfirmModalOpen(false);

    if (!textAreaRef.current) return;
    const textarea = textAreaRef.current;
    const { start, end } = selectedText;
    const altText = selectedText.text || 'image';

    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.click();

    input.onchange = async () => {
      if (!input.files || !input.files[0]) return;

      try {
        setIsUploading(true);

        // Create a unique file name
        const file = input.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `blog_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `blog_images/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('portfolio')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('portfolio')
          .getPublicUrl(filePath);

        // Insert image markdown
        const imageMarkdown = `![${altText}](${publicUrl})`;
        const newValue = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(end);
        onChange(newValue);

        // Set cursor position after the inserted image
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + imageMarkdown.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      } catch (error) {
        console.error('Error uploading image:', error);
        // Show error in a modal instead of alert
        setSelectedText({
          text: 'Failed to upload image. Please try again.',
          start: 0,
          end: 0,
          originalAltText: ''
        });
        setConfirmModalOpen(true);
      } finally {
        setIsUploading(false);
      }
    };
  }

  // Handle image link confirmation from modal
  const handleImageLinkConfirm = (imageUrl: string, altText: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { start, end } = selectedText;

    // Insert image markdown
    const imageMarkdown = `![${altText}](${imageUrl})`;
    const newValue = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(end);
    onChange(newValue);

    // Close the modal
    setImageLinkModalOpen(false);

    // Set cursor position after the inserted image
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + imageMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Handle file upload for content extraction
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(10);

      let extractedText = '';
      const fileType = file.type;
      const reader = new FileReader();

      // Process different file types
      if (fileType === 'text/plain') {
        // Handle TXT files
        reader.onload = (event) => {
          extractedText = event.target?.result as string;
          setUploadProgress(100);
          onChange(extractedText);
          setIsUploading(false);
        };
        reader.readAsText(file);
      } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Handle DOCX files
        reader.onload = async (event) => {
          try {
            setUploadProgress(30);
            // Dynamically import mammoth.js
            const mammoth = await import('mammoth');
            setUploadProgress(50);

            const arrayBuffer = event.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            extractedText = result.value;
            setUploadProgress(100);
            onChange(extractedText);
            setIsUploading(false);
          } catch (error) {
            console.error('Error extracting text from DOCX:', error);
            setIsUploading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else if (fileType === 'application/pdf') {
        // Handle PDF files
        reader.onload = async () => {
          try {
            setUploadProgress(30);
            // PDF parsing in the browser is challenging without server-side help
            // For now, we'll use a simple text extraction approach
            const text = await extractTextFromPdf(file);
            setUploadProgress(100);
            onChange(text);
            setIsUploading(false);
          } catch (error) {
            console.error('Error extracting text from PDF:', error);
            // Show error in a modal instead of alert
            setSelectedText({
              text: 'PDF extraction failed. This feature works best with server-side processing. Please try a TXT or DOCX file instead.',
              start: 0,
              end: 0,
              originalAltText: ''
            });
            setConfirmModalOpen(true);
            setIsUploading(false);
          }
        };
        reader.readAsText(file); // Just to keep the reader busy
      } else {
        // Show error in a modal instead of alert
        setSelectedText({
          text: 'Unsupported file type. Please upload a TXT, DOCX, or PDF file.',
          start: 0,
          end: 0,
          originalAltText: ''
        });
        setConfirmModalOpen(true);
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
    }
  };

  // Create a reference for the textarea
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Function to apply formatting to selected text
  const applyFormatting = (format: string, example?: string, isBlock = false, closeFormat?: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let newText = '';
    let newCursorPos = 0;

    if (isBlock) {
      // For block-level formatting (headings, lists, etc.)
      const lineStart = textarea.value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = textarea.value.indexOf('\n', end);
      const currentLine = textarea.value.substring(lineStart, lineEnd === -1 ? textarea.value.length : lineEnd);

      newText = textarea.value.substring(0, lineStart) +
               format +
               currentLine +
               textarea.value.substring(lineEnd === -1 ? textarea.value.length : lineEnd);

      newCursorPos = lineStart + format.length + currentLine.length;
    } else if (selectedText) {
      // For inline formatting with selected text
      if (closeFormat) {
        // For formats with different opening and closing tags (like HTML)
        newText = textarea.value.substring(0, start) +
                 format + selectedText + closeFormat +
                 textarea.value.substring(end);
        newCursorPos = end + format.length + closeFormat.length;
      } else if (format === '`' || format === '**' || format === '*' || format === '~~') {
        // For symmetric markdown formatting
        newText = textarea.value.substring(0, start) +
                 format + selectedText + format +
                 textarea.value.substring(end);
        newCursorPos = end + 2 * format.length;
      } else {
        // For other formats like links
        newText = textarea.value.substring(0, start) +
                 format.replace('(url)', `(https://example.com)`) +
                 textarea.value.substring(end);
        newCursorPos = start + format.length;
      }
    } else if (example) {
      // For inline formatting without selected text
      newText = textarea.value.substring(0, start) +
               example +
               textarea.value.substring(end);
      newCursorPos = start + example.length;
    } else if (closeFormat) {
      // For block elements with opening and closing tags but no selection
      newText = textarea.value.substring(0, start) +
               format + '\n' + closeFormat +
               textarea.value.substring(end);
      newCursorPos = start + format.length + 1; // Position cursor after opening tag and newline
    } else {
      // Default case
      newText = textarea.value.substring(0, start) +
               format +
               textarea.value.substring(end);
      newCursorPos = start + format.length;
    }

    if (newText) {
      onChange(newText);

      // Set cursor position after formatting is applied
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };



  // Function to insert a YouTube video
  function insertYouTubeVideo(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Save selected text info for the modal
    setSelectedText({ text: '', start, end, originalAltText: '' });

    // Open the YouTube modal
    setYoutubeModalOpen(true);
  }

  // Handle YouTube video confirmation from modal
  const handleYouTubeConfirm = (videoId: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { start, end } = selectedText;

    // Create markdown for embedding YouTube video
    const embedCode = `<div class="video-container">
  <iframe
    width="560"
    height="315"
    src="https://www.youtube.com/embed/${videoId}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>`;

    const newValue = textarea.value.substring(0, start) + embedCode + textarea.value.substring(end);
    onChange(newValue);

    // Close the modal
    setYoutubeModalOpen(false);

    // Set cursor position after the inserted video
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + embedCode.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Function to insert a table
  function insertTable(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Save selected text info for the modal
    setSelectedText({ text: '', start, end, originalAltText: '' });

    // Open the table modal
    setTableModalOpen(true);
  }

  // Handle table confirmation from modal
  const handleTableConfirm = (rows: number, cols: number) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { start, end } = selectedText;

    // Create markdown table
    let tableMarkdown = '\n';

    // Header row
    tableMarkdown += '| ';
    for (let i = 0; i < cols; i++) {
      tableMarkdown += `Header ${i+1} | `;
    }
    tableMarkdown += '\n';

    // Separator row
    tableMarkdown += '| ';
    for (let i = 0; i < cols; i++) {
      tableMarkdown += '--- | ';
    }
    tableMarkdown += '\n';

    // Data rows
    for (let i = 0; i < rows; i++) {
      tableMarkdown += '| ';
      for (let j = 0; j < cols; j++) {
        tableMarkdown += `Cell ${i+1},${j+1} | `;
      }
      tableMarkdown += '\n';
    }

    const newValue = textarea.value.substring(0, start) + tableMarkdown + textarea.value.substring(end);
    onChange(newValue);

    // Close the modal
    setTableModalOpen(false);

    // Set cursor position after the inserted table
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + tableMarkdown.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Function to insert HTML
  function insertHTML(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value.substring(start, end);

    // Save selected text info for the modal
    setSelectedText({ text, start, end, originalAltText: text });

    // Open the HTML modal
    setHtmlModalOpen(true);
  }

  // Handle HTML confirmation from modal
  const handleHtmlConfirm = (htmlCode: string) => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { start, end } = selectedText;

    const newValue = textarea.value.substring(0, start) + htmlCode + textarea.value.substring(end);
    onChange(newValue);

    // Close the modal
    setHtmlModalOpen(false);

    // Set cursor position after the inserted HTML
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + htmlCode.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Function to clear formatting
  function clearFormatting(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      // Show error message in modal
      setConfirmModalOpen(true);
      return;
    }

    const text = textarea.value.substring(start, end);

    // Save selected text info for the modal
    setSelectedText({ text, start, end, originalAltText: text });

    // Open the confirm modal
    setConfirmModalOpen(true);
  }

  // Handle clear formatting confirmation from modal
  const handleClearFormattingConfirm = () => {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const { text, start, end } = selectedText;

    if (!text) return;

    // Remove markdown and HTML formatting
    let plainText = text
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove markdown headings
      .replace(/^#+\s+/gm, '')
      // Remove markdown bold/italic
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      // Remove markdown links
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      // Remove markdown images
      .replace(/!\[(.+?)\]\(.+?\)/g, '$1')
      // Remove markdown code
      .replace(/`(.+?)`/g, '$1')
      // Remove markdown blockquotes
      .replace(/^>\s+/gm, '')
      // Remove markdown lists
      .replace(/^\s*[\*\-+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove markdown strikethrough
      .replace(/~~(.+?)~~/g, '$1');

    const newValue = textarea.value.substring(0, start) + plainText + textarea.value.substring(end);
    onChange(newValue);

    // Close the modal
    setConfirmModalOpen(false);

    // Set cursor position after the cleared text
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + plainText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  // Simple PDF text extraction function
  // Note: This is a fallback and won't work well for all PDFs
  // A better solution would be server-side processing
  const extractTextFromPdf = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      // For now, we'll just return a placeholder message
      // In a production app, you would implement server-side PDF parsing
      resolve(
        `# Content from ${file.name}

PDF content extraction requires server-side processing.

In a production environment, you would:
1. Upload the PDF to the server
2. Process it with a PDF parsing library
3. Return the extracted text

For now, please manually copy and paste the content or use a TXT/DOCX file instead.`
      );
    });
  };

  // Handle switching between editor modes
  const handleEditorModeChange = (mode: 'markdown' | 'rich') => {
    // We're using a simplified approach now - both modes use markdown
    // Just update the mode state
    setEditorMode(mode);
  };

  return (
    <div className="space-y-4">
      {/* Editor Mode Selector */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleEditorModeChange('markdown')}
            className={`px-3 py-1.5 text-sm font-medium rounded ${editorMode === 'markdown' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Markdown Editor
          </button>
          <button
            type="button"
            onClick={() => handleEditorModeChange('rich')}
            className={`px-3 py-1.5 text-sm font-medium rounded ${editorMode === 'rich' ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            Rich Text Editor
          </button>
        </div>

        {/* File Upload Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".txt,.docx,.pdf"
            onChange={handleFileUpload}
            aria-label="Upload document file"
            title="Upload document file"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <LoadingSpinner size="sm" text="" />
                <span className="ml-2">{uploadProgress}%</span>
              </>
            ) : (
              'Upload Document'
            )}
          </Button>
        </div>
      </div>

      <SimpleTabs.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <SimpleTabs.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          <SimpleTabs.Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Write
          </SimpleTabs.Tab>
          <SimpleTabs.Tab
            className={({ selected }: { selected: boolean }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Preview
          </SimpleTabs.Tab>
        </SimpleTabs.List>
        <SimpleTabs.Panels className="mt-2">
          <SimpleTabs.Panel>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Content *
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {editorMode === 'markdown' ? 'Markdown supported' : 'Rich text formatting'}
                </div>
              </div>

              <div className="space-y-2">
                {editorMode === 'rich' && (
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border border-gray-300 dark:border-gray-600 space-y-2">
                    {/* Group buttons by category */}
                    <div className="flex flex-wrap gap-1 border-b border-gray-300 dark:border-gray-600 pb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-center">Format:</span>
                      {formatButtons.filter(button => button.group === 'format').map((button, index) => (
                        <button
                          key={`format-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 border-b border-gray-300 dark:border-gray-600 pb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-center">Headings:</span>
                      {formatButtons.filter(button => button.group === 'heading').map((button, index) => (
                        <button
                          key={`heading-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1 border-b border-gray-300 dark:border-gray-600 pb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-center">Lists:</span>
                      {formatButtons.filter(button => button.group === 'list').map((button, index) => (
                        <button
                          key={`list-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}

                      <span className="text-xs text-gray-500 dark:text-gray-400 mx-2 self-center">|</span>

                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-center">Blocks:</span>
                      {formatButtons.filter(button => button.group === 'block').map((button, index) => (
                        <button
                          key={`block-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2 self-center">Insert:</span>
                      {formatButtons.filter(button => button.group === 'media').map((button, index) => (
                        <button
                          key={`media-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}

                      {formatButtons.filter(button => button.group === 'table').map((button, index) => (
                        <button
                          key={`table-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}

                      <span className="text-xs text-gray-500 dark:text-gray-400 mx-2 self-center">|</span>

                      {formatButtons.filter(button => button.group === 'advanced').map((button, index) => (
                        <button
                          key={`advanced-${index}`}
                          type="button"
                          onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock, button.closeFormat)}
                          className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          title={button.label}
                        >
                          {button.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <textarea
                  id="content"
                  ref={textAreaRef}
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  rows={20}
                  className={`w-full px-4 py-2 rounded-lg ${editorMode === 'rich' ? 'rounded-t-none' : ''} border ${
                    error
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono`}
                  placeholder="Write your post content here..."
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>
          </SimpleTabs.Panel>
          <SimpleTabs.Panel>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[500px] prose dark:prose-invert max-w-none overflow-auto">
              {/* Add CSS for responsive video container */}
              <style>
                {`
                  .video-container {
                    position: relative;
                    padding-bottom: 56.25%; /* 16:9 aspect ratio */
                    height: 0;
                    overflow: hidden;
                    max-width: 100%;
                    margin: 1.5rem 0;
                  }
                  .video-container iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                  }
                `}
              </style>
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    // Custom renderer for div elements to handle YouTube embeds
                    div: ({ node, className, children, ...props }) => {
                      if (className === 'video-container') {
                        return <div className="video-container" {...props}>{children}</div>;
                      }
                      return <div className={className} {...props}>{children}</div>;
                    },
                    // Pass iframe elements through without modification
                    iframe: ({ node, ...props }) => <iframe {...props} />
                  }}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No content to preview
                </div>
              )}
            </div>
          </SimpleTabs.Panel>
        </SimpleTabs.Panels>
      </SimpleTabs.Group>

      {editorMode === 'markdown' && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Markdown Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <p><code># Heading 1</code> - Main heading</p>
              <p><code>## Heading 2</code> - Section heading</p>
              <p><code>### Heading 3</code> - Sub-section heading</p>
              <p><code>**bold text**</code> - <strong>bold text</strong></p>
              <p><code>*italic text*</code> - <em>italic text</em></p>
              <p><code>~~strikethrough~~</code> - <del>strikethrough</del></p>
            </div>
            <div>
              <p><code>[link text](https://example.com)</code> - <a href="#" className="text-indigo-600 dark:text-indigo-400">link text</a></p>
              <p><code>![alt text](image-url.jpg)</code> - Image</p>
              <p><code>- List item</code> - Bulleted list</p>
              <p><code>1. List item</code> - Numbered list</p>
              <p><code>```code block```</code> - Code block</p>
              <p><code>| Table | Header |</code> - Tables</p>
            </div>
          </div>
        </div>
      )}

      {editorMode === 'rich' && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rich Text Editor Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium mb-1">Text Formatting</h4>
              <p>• Select text and click B for bold</p>
              <p>• Select text and click I for italic</p>
              <p>• Use strikethrough for deleted text</p>
              <p>• Add highlights to emphasize text</p>
              <p>• Create superscript and subscript text</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Media & Tables</h4>
              <p>• Insert images by clicking the image icon</p>
              <p>• Embed YouTube videos with the video icon</p>
              <p>• Create tables with custom dimensions</p>
              <p>• Add links to external resources</p>
              <p>• Insert HTML for advanced formatting</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Structure</h4>
              <p>• Use H1-H4 for section headings</p>
              <p>• Create bulleted and numbered lists</p>
              <p>• Add task lists with checkboxes</p>
              <p>• Use blockquotes for citations</p>
              <p>• Insert code blocks for code snippets</p>
            </div>
          </div>
        </div>
      )}

      {/* Custom Modals */}
      <LinkModal
        isOpen={linkModalOpen}
        onClose={() => setLinkModalOpen(false)}
        onConfirm={handleLinkConfirm}
        initialText={selectedText.text}
        initialUrl="https://"
      />

      <YouTubeModal
        isOpen={youtubeModalOpen}
        onClose={() => setYoutubeModalOpen(false)}
        onConfirm={handleYouTubeConfirm}
      />

      <TableModal
        isOpen={tableModalOpen}
        onClose={() => setTableModalOpen(false)}
        onConfirm={handleTableConfirm}
      />

      <HtmlModal
        isOpen={htmlModalOpen}
        onClose={() => setHtmlModalOpen(false)}
        onConfirm={handleHtmlConfirm}
        initialHtml={selectedText.text ? selectedText.text : '<div class="custom-element">\n  Your content here\n</div>'}
      />

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={selectedText.text === 'How would you like to add an image?'
          ? handleImageFromFile
          : handleClearFormattingConfirm}
        title={selectedText.text === 'How would you like to add an image?'
          ? "Insert Image"
          : selectedText.start === selectedText.end
            ? "Error"
            : "Clear Formatting"}
        message={selectedText.text === 'How would you like to add an image?'
          ? "How would you like to add an image?"
          : selectedText.start === selectedText.end
            ? "Please select text to clear formatting."
            : "Are you sure you want to remove all formatting from the selected text? This will remove bold, italic, links, and other formatting."}
        confirmLabel={selectedText.text === 'How would you like to add an image?'
          ? "Upload from Device"
          : selectedText.start === selectedText.end
            ? "OK"
            : "Clear Formatting"}
        secondaryAction={selectedText.text === 'How would you like to add an image?'
          ? {
              label: "Insert from URL",
              onClick: handleImageFromUrl
            }
          : undefined}
        variant={selectedText.text === 'How would you like to add an image?'
          ? "primary"
          : selectedText.start === selectedText.end
            ? "primary"
            : "danger"}
        icon={
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {selectedText.text === 'How would you like to add an image?'
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              : selectedText.start === selectedText.end
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            }
          </svg>
        }
      />

      <ImageLinkModal
        isOpen={imageLinkModalOpen}
        onClose={() => setImageLinkModalOpen(false)}
        onConfirm={handleImageLinkConfirm}
        initialAltText={selectedText.originalAltText || ''}
        initialUrl="https://"
      />
    </div>
  );
};

export default BlogPostContent;
