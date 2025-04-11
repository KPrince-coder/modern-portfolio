import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Tab } from '@headlessui/react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Import file processing libraries
const mammoth = typeof window !== 'undefined' ? require('mammoth') : null;
const pdfParse = typeof window !== 'undefined' ? require('pdf-parse') : null;

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

  // Configure Quill modules and formats
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet',
    'script',
    'indent',
    'direction',
    'color', 'background',
    'font',
    'align',
    'link', 'image', 'video'
  ];

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
        reader.onload = async (event) => {
          try {
            setUploadProgress(50);
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const data = new Uint8Array(arrayBuffer);
            const result = await pdfParse(data);
            extractedText = result.text;
            setUploadProgress(100);
            onChange(extractedText);
            setIsUploading(false);
          } catch (error) {
            console.error('Error extracting text from PDF:', error);
            setIsUploading(false);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert('Unsupported file type. Please upload a TXT, DOCX, or PDF file.');
        setIsUploading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setIsUploading(false);
    }
  };

  // Handle image upload for the rich text editor
  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      try {
        setIsUploading(true);

        // Create a unique file name
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

        // Insert image URL at cursor position in Quill editor
        const quill = (document.querySelector('.ql-editor') as any)?.quill;
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', publicUrl);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setIsUploading(false);
      }
    };
  };

  // Convert HTML to Markdown when switching from rich editor to markdown
  const convertHtmlToMarkdown = (html: string): string => {
    // This is a simple conversion. For a more robust solution, consider using a library like turndown
    let markdown = html;

    // Replace heading tags
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
    markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n');
    markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n');

    // Replace paragraph tags
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

    // Replace bold tags
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');

    // Replace italic tags
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

    // Replace links
    markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Replace images
    markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, '![$2]($1)');
    markdown = markdown.replace(/<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']*)["'][^>]*>/gi, '![$1]($2)');
    markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*>/gi, '![]($1)');

    // Replace unordered lists
    markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gis, function(match, content) {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    });

    // Replace ordered lists
    markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gis, function(match, content) {
      let index = 1;
      return content.replace(/<li[^>]*>(.*?)<\/li>/gi, function(match, item) {
        return `${index++}. ${item}\n`;
      });
    });

    // Replace blockquotes
    markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');

    // Replace code blocks
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>(.*?)<\/code><\/pre>/gi, '```\n$1\n```\n');

    // Replace inline code
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Replace horizontal rules
    markdown = markdown.replace(/<hr[^>]*>/gi, '---\n');

    // Remove remaining HTML tags
    markdown = markdown.replace(/<[^>]*>/g, '');

    // Decode HTML entities
    markdown = markdown.replace(/&lt;/g, '<');
    markdown = markdown.replace(/&gt;/g, '>');
    markdown = markdown.replace(/&amp;/g, '&');
    markdown = markdown.replace(/&quot;/g, '"');
    markdown = markdown.replace(/&#39;/g, "'");

    return markdown;
  };

  // Handle switching between editor modes
  const handleEditorModeChange = (mode: 'markdown' | 'rich') => {
    if (mode === 'markdown' && editorMode === 'rich') {
      // Convert HTML to Markdown when switching from rich to markdown
      const htmlContent = document.querySelector('.ql-editor')?.innerHTML || '';
      const markdownContent = convertHtmlToMarkdown(htmlContent);
      onChange(markdownContent);
    }
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

              {editorMode === 'markdown' ? (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  rows={20}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    error
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 font-mono`}
                  placeholder="Write your post content here..."
                />
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={onChange}
                    modules={quillModules}
                    formats={quillFormats}
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-[500px] overflow-y-auto"
                  />
                </div>
              )}

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
              <p>Insert images by clicking the image icon</p>
              <p>Add links by selecting text and clicking the link icon</p>
              <p>Create lists using the bullet or numbered list icons</p>
            </div>
            <div>
              <p>Embed videos by clicking the video icon</p>
              <p>Format code blocks using the code block button</p>
              <p>Change text alignment with the alignment buttons</p>
              <p>Switch to Markdown editor for more advanced formatting</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostContent;
