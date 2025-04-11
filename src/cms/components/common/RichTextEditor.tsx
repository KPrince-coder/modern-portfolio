import React, { useState, useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  initialValue: string;
  onChange: (content: string) => void;
  error?: string;
  height?: number;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialValue,
  onChange,
  error,
  height = 500,
  placeholder = 'Start typing...',
}) => {
  const [editorContent, setEditorContent] = useState(initialValue);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setEditorContent(initialValue);
  }, [initialValue]);

  const handleEditorChange = (content: string) => {
    setEditorContent(content);
    onChange(content);
  };

  return (
    <div className={`border rounded-md ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}>
      <Editor
        apiKey="your-tinymce-api-key" // Replace with your TinyMCE API key
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue={initialValue}
        value={editorContent}
        onEditorChange={handleEditorChange}
        init={{
          height,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'codesample'
          ],
          toolbar:
            'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | link image media codesample | code fullscreen',
          content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; font-size: 14px }',
          placeholder,
          skin: document.documentElement.classList.contains('dark') ? 'oxide-dark' : 'oxide',
          content_css: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
          promotion: false,
          branding: false,
          images_upload_handler: async (blobInfo, progress) => {
            // This is a placeholder for image upload functionality
            // In a real implementation, you would upload the image to your storage service
            // and return the URL
            return new Promise((resolve, reject) => {
              // Simulate upload delay
              setTimeout(() => {
                // Return a placeholder URL
                resolve(`https://picsum.photos/id/${Math.floor(Math.random() * 1000)}/800/600`);
              }, 2000);
            });
          },
        }}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default RichTextEditor;
