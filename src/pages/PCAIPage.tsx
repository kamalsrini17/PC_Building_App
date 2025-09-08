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
  
  // Extract context from conversation history
  const conversationText = messageHistory.map(m => m.content.toLowerCase()).join(' ');
  const hasBudget = /\$\d+|\d+\s*dollars?|\d+k|budget.*\d+|under.*\d+|around.*\d+/.test(conversationText);
  const hasUseCase = /gaming|work|productivity|content creation|streaming|video editing|office|general use/.test(conversationText);
  const hasResolution = /1080p|1440p|4k|2160p|resolution/.test(conversationText);
  
  // Gaming responses
  if (lowerMessage.includes('gaming') || lowerMessage.includes('game')) {
    if (hasBudget && hasResolution) {
      const responses = [
        "Perfect! With your budget and resolution target, I'd recommend focusing on these components: For the GPU, consider an RTX 4070 or RX 7800 XT. For CPU, a Ryzen 7 7700X or Intel i5-13600K would pair well.",
        "Great specs! Based on what you've told me, here's what I'd prioritize: 1) GPU (40-50% of budget), 2) CPU (20-25%), 3) 32GB DDR5 RAM, 4) Fast NVMe SSD. Want specific recommendations?",
        "Excellent! For your gaming setup, I'd suggest: RTX 4070 Super for the graphics, Ryzen 7 7700X for processing, 32GB DDR5-6000 RAM, and a 1TB Gen4 NVMe SSD. This should handle everything beautifully!"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else if (hasBudget) {
      const responses = [
        "Great! With your budget in mind, what resolution are you targeting? 1080p, 1440p, or 4K? This will help me recommend the right GPU tier.",
        "Perfect budget info! Are you planning to play competitive esports titles or more demanding AAA games? This affects the GPU and CPU balance I'd recommend.",
        "Nice! For that budget range, what's your monitor situation? High refresh rate 1080p, 1440p gaming, or 4K? This determines our GPU priority."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "Gaming builds are exciting! What's your budget range? This helps me recommend the right performance tier for your needs.",
        "Love helping with gaming builds! What's your target budget? Are you looking at $800, $1200, $1500, or higher?",
        "Gaming setup coming up! To give you the best recommendations, what's your budget range looking like?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  // Budget responses - only if budget not already established
  if ((lowerMessage.includes('budget') || lowerMessage.includes('$') || lowerMessage.includes('cheap')) && !hasBudget) {
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // If budget is mentioned but already established, provide different responses
  if ((lowerMessage.includes('budget') || lowerMessage.includes('$')) && hasBudget) {
    const responses = [
      "Got it! Based on your budget, let me suggest some specific components. What aspect would you like to focus on first - GPU, CPU, or overall system balance?",
      "Perfect! With that budget established, I can recommend some great component combinations. Are you more interested in maximizing gaming performance or getting a balanced workstation?",
      "Excellent budget planning! Now let's talk components. Would you like me to suggest a complete build breakdown or focus on specific parts first?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Specific component questions
  if (lowerMessage.includes('cpu') || lowerMessage.includes('processor')) {
    if (hasUseCase && hasBudget) {
      const responses = [
        "Based on your use case and budget, I'd recommend: For gaming - Ryzen 7 7700X or Intel i5-13600K. For productivity - Ryzen 9 7900X or Intel i7-13700K. Both offer excellent performance in their price ranges.",
        "Perfect! Given what you've told me, here are my top CPU picks: AMD Ryzen 7 7700X for excellent gaming performance, or if you need more cores for productivity, the Ryzen 9 7900X is fantastic.",
        "Great question! For your setup, I'd suggest the Intel i5-13600K for pure gaming (great price/performance) or the Ryzen 7 7700X for a good gaming/productivity balance."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "CPUs are crucial! To recommend the best one, what will you primarily use this PC for? Gaming, content creation, or general productivity?",
        "Great question! Modern CPUs are amazing. Are you leaning toward gaming performance, productivity work, or a balanced approach?",
        "CPU selection depends on your needs. What's your main use case - gaming, streaming, video editing, or general use?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  }
  
  if (lowerMessage.includes('gpu') || lowerMessage.includes('graphics')) {
    if (hasResolution && hasBudget) {
      const responses = [
        "Perfect! Based on your resolution and budget, here are my GPU recommendations: RTX 4070 for excellent 1440p gaming, RTX 4060 Ti for solid 1080p, or RTX 4080 if you're targeting 4K.",
        "Great info! For your setup, I'd suggest: 1080p gaming - RTX 4060 Ti or RX 7700 XT, 1440p - RTX 4070 or RX 7800 XT, 4K - RTX 4080 or better.",
        "Excellent! With your resolution target and budget, the RTX 4070 hits the sweet spot for most users. It handles 1440p beautifully and has great ray tracing support."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        "GPU is the heart of gaming! What resolution will you be playing at? 1080p, 1440p, or 4K? This determines which tier to recommend.",
        "Graphics cards are my favorite topic! What's your target resolution and refresh rate? This helps me suggest the perfect GPU tier.",
        "Great question! To recommend the right GPU, what resolution are you targeting? Also, do you care about ray tracing?"
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Handle specific budget amounts
  if (/\$\d+|\d+\s*dollars?|\d+k/.test(lowerMessage)) {
    const responses = [
      "Great budget! That opens up some excellent options. What will you primarily use this PC for? Gaming, work, content creation, or a mix?",
      "Perfect budget range! Now I can give you targeted recommendations. Are you building for gaming, productivity, or general use?",
      "Excellent! With that budget, we can build something really nice. What's your main use case - gaming, work, or something specific?"
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
  
  // Context-aware default responses
  if (hasBudget && hasUseCase) {
    const responses = [
      "Based on what you've told me, I can suggest some specific components! Would you like me to recommend a complete build or focus on particular parts?",
      "Great! I have enough info to make solid recommendations. Want me to suggest a full system or dive into specific components first?",
      "Perfect! With your budget and use case, I can recommend some excellent options. Shall we start with the core components like CPU and GPU?"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default responses for general questions
  const defaultResponses = [
    "That's interesting! Can you tell me more about what you're looking for?",
    "I'd love to help with that! What specific aspect would you like to know more about?",
    "Good question! Could you give me a bit more detail about what you're thinking?",
    "Let me help you with that! What would you like to focus on?",
    "That's definitely something I can assist with! Tell me more about your needs.",
    "Great point! What specific information would be most helpful for you?",
    "I can help with that! What aspect interests you most?",
    "Absolutely! What would you like to dive deeper into?"
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