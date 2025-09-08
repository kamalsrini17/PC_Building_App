import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  buildSuggestion?: BuildSuggestion;
}

interface BuildSuggestion {
  id: string;
  name: string;
  description: string;
  components: Record<string, any>;
  total_price: number;
  reasoning: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

export class GPTService {
  private static instance: GPTService;

  private constructor() {}

  static getInstance(): GPTService {
    if (!GPTService.instance) {
      GPTService.instance = new GPTService();
    }
    return GPTService.instance;
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[]): Promise<ChatMessage> {
    const messageId = uuidv4();

    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/openai-chat`;

      const response = await fetch(edgeFunctionUrl, {
      }
      )
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured');
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/openai-chat`;

      // Prepare messages for the API
      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: 'user', content: message }
      ];

      const response = await fetch(edgeFunctionUrl, {
          messages: [
            ...conversationHistory.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: 'user', content: message }
          ],
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error calling Supabase Edge Function:', errorData);
        throw new Error(errorData.error || 'Failed to get response from AI');
      }

      const data = await response.json();
      const assistantContent = data.content;
      const buildSuggestion = data.buildSuggestion;

      return {
        id: messageId,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        buildSuggestion: buildSuggestion ? { ...buildSuggestion, id: uuidv4() } : undefined
      };

    } catch (error) {
      console.error('Error sending message to AI:', error);
      return {
        id: messageId,
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI service. Please try again later.',
        timestamp: new Date()
      };
    }
  }

  generateChatName(messages: ChatMessage[]): string {
    if (messages.length === 0) return "New Chat";
    
    // Analyze messages to create a descriptive name
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('gaming') && allText.includes('budget')) {
      return "Gaming PC Budget Build";
    }
    if (allText.includes('4k') || allText.includes('high-end')) {
      return "High-End 4K Gaming Build";
    }
    if (allText.includes('work') || allText.includes('productivity')) {
      return "Workstation Build Discussion";
    }
    if (allText.includes('streaming')) {
      return "Streaming PC Build";
    }
    if (allText.includes('first') || allText.includes('beginner')) {
      return "First PC Build Help";
    }
    
    // Extract budget if mentioned
    const budgetMatch = allText.match(/\$?(\d{3,5})/);
    if (budgetMatch) {
      return `$${budgetMatch[1]} PC Build`;
    }
    
    // Default based on first user message
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    const words = firstUserMessage.split(' ').slice(0, 3).join(' ');
    return words.length > 0 ? `${words}...` : "PC Build Chat";
  }
}

export type { ChatMessage, BuildSuggestion, ChatSession };