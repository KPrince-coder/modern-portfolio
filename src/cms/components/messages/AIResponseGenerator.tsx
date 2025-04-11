import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  status: string;
  ai_response?: string;
  notes?: string;
}

interface AIResponseGeneratorProps {
  message: ContactMessage;
  initialResponse?: string;
  onSave: (response: string) => void;
  onCancel: () => void;
}

const AIResponseGenerator: React.FC<AIResponseGeneratorProps> = ({
  message,
  initialResponse,
  onSave,
  onCancel,
}) => {
  const [response, setResponse] = useState(initialResponse || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with initial response if provided
  useEffect(() => {
    if (initialResponse) {
      setResponse(initialResponse);
    }
  }, [initialResponse]);

  // Generate AI response mutation
  const generateResponseMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      setError(null);
      
      try {
        // In a real implementation, this would call the Groq API
        // For now, we'll simulate a response
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a response based on the message content
        const aiResponse = `Dear ${message.name},

Thank you for reaching out to me. I appreciate you taking the time to contact me.

${generateContextAwareResponse(message.message)}

If you have any further questions or need additional information, please don't hesitate to ask.

Best regards,
[Your Name]`;
        
        return aiResponse;
      } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('Failed to generate AI response. Please try again later.');
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      setResponse(data);
    },
    onError: (error) => {
      setError((error as Error).message);
    },
  });

  // Generate a context-aware response based on the message content
  const generateContextAwareResponse = (messageContent: string) => {
    const lowerCaseMessage = messageContent.toLowerCase();
    
    if (lowerCaseMessage.includes('project') || lowerCaseMessage.includes('work')) {
      return "Regarding your inquiry about my projects, I'd be happy to discuss my work in more detail. My portfolio showcases a variety of projects that demonstrate my skills and experience in web development and design.";
    } else if (lowerCaseMessage.includes('hire') || lowerCaseMessage.includes('job') || lowerCaseMessage.includes('opportunity')) {
      return "I'm always open to discussing new opportunities and potential collaborations. I'd be interested in learning more about what you have in mind. Could you provide more details about the project or position you're considering?";
    } else if (lowerCaseMessage.includes('contact') || lowerCaseMessage.includes('call') || lowerCaseMessage.includes('meet')) {
      return "I'd be happy to schedule a call or meeting to discuss this further. Please let me know what times work best for you, and we can arrange a conversation.";
    } else {
      return "I've received your message and will consider your inquiry carefully. I strive to provide thoughtful responses to all communications.";
    }
  };

  // Handle generating AI response
  const handleGenerateResponse = async () => {
    try {
      await generateResponseMutation.mutateAsync();
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  // Handle saving the response
  const handleSaveResponse = () => {
    if (response.trim()) {
      onSave(response);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="md" text="Generating AI response..." />
          </div>
        ) : (
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={8}
            className="w-full px-4 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            placeholder="AI-generated response will appear here..."
          />
        )}
        
        {error && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerateResponse}
          disabled={isGenerating}
          leftIcon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        >
          {initialResponse ? 'Regenerate Response' : 'Generate Response'}
        </Button>
        
        <div className="space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveResponse}
            disabled={!response.trim() || isGenerating}
          >
            Save Response
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIResponseGenerator;
