import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

// -------------------- Types --------------------
type Message = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
};

type Build = {
  id: string;
  name: string;
  description: string;
  components: Record<string, any>;
  total_price: number;
  created_at?: string;
};

// -------------------- Mock AI Response Generator --------------------
const generateAIResponse = async (userMessage: string, messageHistory: Message[]): Promise<string> => {
  // Simulate thinking time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const lowerMessage = userMessage.toLowerCase();
  
  // Gaming responses
  if (lowerMessage.includes('gaming') || lowerMessage.includes('game')) {
    const responses = [
      "For gaming, I'd recommend focusing on a strong GPU and CPU combo. What's your budget range? Are you targeting 1080p, 1440p, or 4K gaming?",
      "Gaming builds are my specialty! What games do you primarily play? AAA titles need more power than esports games like Valorant or CS2.",
      "Great choice for gaming! I'd suggest an RTX 4070 or better for 1440p gaming. What's your target frame rate - 60fps, 144fps, or higher?",
      "For a solid gaming experience, you'll want at least 16GB RAM, a modern GPU, and a fast SSD. What's your total budget looking like?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Budget responses
  if (lowerMessage.includes('budget') || lowerMessage.includes('$') || lowerMessage.includes('cheap')) {
    const responses = [
      "Budget builds can still be powerful! What's your target price range? I can help you get the best performance per dollar.",
      "Smart to think about budget first! For gaming, I'd allocate about 40-50% to the GPU. What's your total budget?",
      "I love budget optimization! Are you looking at $800, $1200, or $1500 range? Each tier opens up different possibilities.",
      "Budget-conscious building is an art! What's your max spend, and what will you primarily use this PC for?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Specific component questions
  if (lowerMessage.includes('cpu') || lowerMessage.includes('processor')) {
    const responses = [
      "For CPUs, AMD Ryzen 7000 series and Intel 13th gen are both excellent. Gaming or productivity focused?",
      "CPU choice depends on your use case. Ryzen 7 7700X is great for gaming, while Ryzen 9 7900X excels at content creation.",
      "Intel vs AMD is closer than ever! What's your primary use case and budget for the CPU?",
      "Modern CPUs are incredibly capable. Are you doing pure gaming, streaming, video editing, or a mix?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  if (lowerMessage.includes('gpu') || lowerMessage.includes('graphics')) {
    const responses = [
      "GPU is crucial for gaming! RTX 4070 hits the sweet spot for 1440p, while RTX 4080 handles 4K well. What resolution are you targeting?",
      "For graphics cards, consider your monitor resolution first. 1080p? RTX 4060 Ti. 1440p? RTX 4070. 4K? RTX 4080 or better.",
      "NVIDIA RTX 40-series and AMD RX 7000 series are both solid choices. Ray tracing important to you?",
      "GPU prices have stabilized nicely! What games do you want to play and at what settings?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const responses = [
      "Hey there! I'm here to help you build the perfect PC. What kind of build are you thinking about?",
      "Hello! Ready to build something awesome? Tell me about your dream PC setup!",
      "Hi! I'm your PC building assistant. Gaming rig, workstation, or something else in mind?",
      "Hey! Let's build you an amazing PC. What's your main use case and budget range?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Help/general responses
  if (lowerMessage.includes('help') || lowerMessage.includes('start') || lowerMessage.includes('begin')) {
    return "I'm here to help you build the perfect PC! Tell me:\n\n• What will you use it for? (gaming, work, content creation)\n• What's your budget range?\n• Any specific requirements or preferences?\n\nI'll guide you through choosing the best components!";
  }
  
  // Default responses for general questions
  const defaultResponses = [
    "That's a great question! To give you the best advice, could you tell me more about your specific needs and budget?",
    "Interesting! What's your primary use case for this PC? Gaming, work, content creation, or general use?",
    "I'd love to help with that! What's your budget range and what will you mainly use the PC for?",
    "Good point! To recommend the best components, I need to know your budget and intended use case.",
    "Let me help you with that! Are you building for gaming, productivity, or something specific?",
    "That's definitely something I can assist with! What's your target budget and main use case?",
    "Great question! Tell me about your budget and what you'll primarily use this PC for, and I'll give you tailored advice.",
    "I can definitely help! What's your price range and will this be mainly for gaming, work, or general use?"
  ];
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
};

// -------------------- Component --------------------
export default function PCAIPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Initial greeting
  useEffect(() => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: "Hey! I'm your PC building assistant. I'm here to help you choose the perfect components for your build.\n\nTell me what you're looking for - gaming rig, workstation, budget build, or something specific? I'll guide you through the process!",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setTyping(true);
    
    try {
      // Generate AI response
      const aiResponse = await generateAIResponse(userMessage.content, messages);
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setTyping(false);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setTyping(false);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "Sorry, I encountered an error. Please try asking your question again!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-red-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PC AI Assistant</h1>
              <p className="text-sm text-gray-400">Your personal build advisor</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-6 mb-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {/* Avatar */}
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                
                {/* Message Content */}
                <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>

                {/* User Avatar */}
                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {typing && (
              <div className="flex gap-4 justify-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything about PC building..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder-gray-400 max-h-32"
                rows={1}
                disabled={loading}
                style={{
                  minHeight: '24px',
                  height: 'auto'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="p-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {/* Quick Suggestions */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-600/50">
                {[
                  "I want to build a gaming PC for $1200",
                  "What's the best CPU for video editing?",
                  "Help me choose between AMD and Intel",
                  "I need a quiet PC for my bedroom"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="px-3 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 rounded-full border border-gray-600/50 transition-colors text-gray-300 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}