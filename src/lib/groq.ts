/**
 * Groq API integration for AI features
 */

// Define the API base URL and models
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS = {
  LLaMA3_8B: 'llama3-8b-8192',
  LLaMA3_70B: 'llama3-70b-8192',
  MIXTRAL_8x7B: 'mixtral-8x7b-32768',
  GEMMA_7B: 'gemma-7b-it',
} as const;

// Types
export interface AIResponse {
  text: string;
  status: 'success' | 'error';
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface BlogPostPrompt {
  title: string;
  topic: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
  length: 'short' | 'medium' | 'long';
}

export interface EmailResponsePrompt {
  originalMessage: string;
  context?: string;
  tone: 'professional' | 'casual' | 'technical' | 'friendly';
}

// Define types for the Groq API
type GroqModel = typeof GROQ_MODELS[keyof typeof GROQ_MODELS];

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqCompletionRequest {
  model: GroqModel;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

interface GroqCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: GroqMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate a completion using the Groq API
 */
async function generateCompletion(
  request: GroqCompletionRequest
): Promise<GroqCompletionResponse> {
  // In development mode, use a mock response if no API key is available
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_GROQ_API_KEY) {
    console.warn('GROQ_API_KEY is not defined. Using mock response in development mode.');
    return mockGroqResponse(request);
  }

  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not defined in environment variables');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Generate a mock response for development without an API key
 */
function mockGroqResponse(request: GroqCompletionRequest): Promise<GroqCompletionResponse> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Extract the user message
      const userMessage = request.messages.find(m => m.role === 'user')?.content || '';

      // Generate a mock response based on the request
      let responseContent = '';

      if (userMessage.includes('blog post')) {
        responseContent = `# Sample Blog Post Title

## Introduction
This is a sample blog post generated as a mock response. In a real implementation, this would be generated by the Groq API.

## Main Content
Here's some sample content for the blog post. This would normally be much longer and more detailed.

## Conclusion
Thank you for reading this sample blog post!`;
      } else if (userMessage.includes('message') || userMessage.includes('email')) {
        responseContent = `Dear Sender,

Thank you for your message. This is a mock response generated for development purposes.

Best regards,
Portfolio Owner`;
      } else {
        responseContent = `This is a mock response generated for development purposes. In a real implementation, this would be generated by the Groq API.`;
      }

      resolve({
        id: 'mock-response-id',
        object: 'chat.completion',
        created: Date.now(),
        model: request.model,
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: responseContent,
          },
          finish_reason: 'stop',
        }],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 150,
          total_tokens: 250,
        },
      });
    }, 1500); // Simulate a 1.5 second delay
  });
}

// Groq API functions
export const groqAPI = {
  // Generate a blog post
  generateBlogPost: async (prompt: BlogPostPrompt): Promise<AIResponse> => {
    try {
      // Map length to approximate word count
      const wordCounts = {
        short: 500,
        medium: 1000,
        long: 2000,
      };

      const wordCount = wordCounts[prompt.length];

      const systemPrompt = `You are an expert content writer who specializes in creating high-quality blog posts.
      Your task is to write a well-structured, engaging blog post on the provided topic.

      Guidelines:
      - Write in a ${prompt.tone} tone
      - Include the keywords: ${prompt.keywords.join(', ')}
      - Write approximately ${wordCount} words
      - Format the content in Markdown
      - Use the title: ${prompt.title}
      - Include an introduction, several sections with subheadings (H2, H3), and a conclusion
      - Add relevant examples, statistics, or case studies where appropriate
      - Ensure the content is original, informative, and valuable to readers
      - Include a call-to-action at the end

      The blog post should be ready to publish without requiring additional editing.`;

      const userPrompt = `Please write a blog post about: ${prompt.topic}`;

      const completion = await generateCompletion({
        model: GROQ_MODELS.LLaMA3_70B,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      });

      return {
        status: 'success',
        text: completion.choices[0].message.content,
        usage: completion.usage,
      };
    } catch (error) {
      console.error('Error generating blog post:', error);
      return {
        status: 'error',
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // Generate an email response
  generateEmailResponse: async (prompt: EmailResponsePrompt): Promise<AIResponse> => {
    try {
      const systemPrompt = `You are an AI assistant for a professional portfolio website.
      Your task is to generate a helpful, friendly, and professional response to messages received through the contact form.

      ${prompt.context ? `About the portfolio owner:\n${prompt.context}\n\n` : ''}

      Guidelines:
      - Be professional, friendly, and helpful
      - Write in a ${prompt.tone} tone
      - Keep responses concise but informative
      - Address the specific questions or inquiries in the message
      - If the message is about work opportunities, express interest and suggest next steps
      - If the message is unclear or lacks specific questions, provide a general response that encourages further communication
      - Sign off with a professional closing`;

      const userPrompt = `Please generate a response to this message: "${prompt.originalMessage}"`;

      const completion = await generateCompletion({
        model: GROQ_MODELS.LLaMA3_8B,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return {
        status: 'success',
        text: completion.choices[0].message.content,
        usage: completion.usage,
      };
    } catch (error) {
      console.error('Error generating email response:', error);
      return {
        status: 'error',
        text: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  // Get available models
  getModels: () => GROQ_MODELS,
};

export default groqAPI;
