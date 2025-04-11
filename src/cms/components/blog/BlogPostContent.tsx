import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '@headlessui/react';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

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

  // Rich text formatting toolbar buttons
  const formatButtons = [
    { label: 'Bold', icon: '𝐁', format: '**', example: '**bold text**' },
    { label: 'Italic', icon: '𝐼', format: '*', example: '*italic text*' },
    { label: 'Heading 1', icon: 'H1', format: '# ', isBlock: true },
    { label: 'Heading 2', icon: 'H2', format: '## ', isBlock: true },
    { label: 'Heading 3', icon: 'H3', format: '### ', isBlock: true },
    { label: 'Quote', icon: '❝', format: '> ', isBlock: true },
    { label: 'Code', icon: '`', format: '`', example: '`code`' },
    { label: 'Link', icon: '🔗', format: '[](url)', handler: insertLink },
    { label: 'Image', icon: '🖼️', format: '![](url)', handler: insertImage },
    { label: 'List', icon: '•', format: '- ', isBlock: true },
    { label: 'Numbered List', icon: '1.', format: '1. ', isBlock: true },
  ];

  // Function to handle inserting a link
  function insertLink(textAreaRef: React.RefObject<HTMLTextAreaElement | null>) {
    if (!textAreaRef.current) return;

    const textarea = textAreaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const linkText = selectedText || 'link text';
    const url = prompt('Enter the URL:', 'https://');

    if (!url) return;

    const linkMarkdown = `[${linkText}](${url})`;
    const newValue = textarea.value.substring(0, start) + linkMarkdown + textarea.value.substring(end);

    onChange(newValue);

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
        alert('Failed to upload image. Please try again.');
      } finally {
        setIsUploading(false);
      }
    };
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
            alert('PDF extraction failed. This feature works best with server-side processing. Please try a TXT or DOCX file instead.');
            setIsUploading(false);
          }
        };
        reader.readAsText(file); // Just to keep the reader busy
      } else {
        alert('Unsupported file type. Please upload a TXT, DOCX, or PDF file.');
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
  const applyFormatting = (format: string, example?: string, isBlock = false) => {
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
      if (format === '`' || format === '**' || format === '*') {
        newText = textarea.value.substring(0, start) +
                 format + selectedText + format +
                 textarea.value.substring(end);
        newCursorPos = end + 2 * format.length;
      } else {
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

      <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Write
          </Tab>
          <Tab
            className={({ selected }) =>
              `w-full rounded-lg py-2.5 text-sm font-medium leading-5
              ${
                selected
                  ? 'bg-white dark:bg-gray-800 shadow text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/[0.12] hover:text-gray-900 dark:hover:text-white'
              }`
            }
          >
            Preview
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <Tab.Panel>
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
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border border-gray-300 dark:border-gray-600">
                    {formatButtons.map((button, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => button.handler ? button.handler(textAreaRef) : applyFormatting(button.format, button.example, button.isBlock)}
                        className="px-2 py-1 text-sm font-medium rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                        title={button.label}
                      >
                        {button.icon}
                      </button>
                    ))}
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
          </Tab.Panel>
          <Tab.Panel>
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 min-h-[500px] prose dark:prose-invert max-w-none overflow-auto">
              {content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-500 dark:text-gray-400 italic">
                  No content to preview
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">
            <div>
              <p>Use the toolbar above to format your text</p>
              <p>Select text and click B for bold formatting</p>
              <p>Select text and click I for italic formatting</p>
              <p>Click H1, H2, or H3 to create headings</p>
            </div>
            <div>
              <p>Click the link icon to insert a link</p>
              <p>Click the image icon to upload and insert an image</p>
              <p>Click the list icons to create bulleted or numbered lists</p>
              <p>All formatting is done using Markdown syntax</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostContent;
