import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Plus, 
  MessageCircle, 
  Loader2, 
  Edit3, 
  Check, 
  X,
  Trash2,
  Bot,
  User,
  ThumbsUp,
  ThumbsDown,
  Package
} from 'lucide-react';
import { GPTService, ChatMessage, BuildSuggestion, ChatSession } from '../services/gptService';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface PCAIPageProps {
  onBackToHome: () => void;
  onAddToMyBuilds: (build: BuildSuggestion) => void;
}

export default function PCAIPage({ onBackToHome, onAddToMyBuilds }: PCAIPageProps) {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const gptService = GPTService.getInstance();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load chat sessions on mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  // Load current session messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      const session = chatSessions.find(s => s.id === currentSessionId);
      if (session) {
        setMessages(session.messages);
      }
    }
  }, [currentSessionId, chatSessions]);

  const loadChatSessions = () => {
    // For now, use localStorage. Later we can integrate with Supabase
    const savedSessions = localStorage.getItem('pcai-chat-sessions');
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        created_at: new Date(session.created_at),
        updated_at: new Date(session.updated_at),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setChatSessions(sessions);
      
      // Set current session to the most recent one
      if (sessions.length > 0 && !currentSessionId) {
        setCurrentSessionId(sessions[0].id);
      }
    }
  };

  const saveChatSessions = (sessions: ChatSession[]) => {
    localStorage.setItem('pcai-chat-sessions', JSON.stringify(sessions));
    setChatSessions(sessions);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: 'New Chat',
      messages: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    const updatedSessions = [newSession, ...chatSessions];
    saveChatSessions(updatedSessions);
    setCurrentSessionId(newSession.id);
    setMessages([]);
  };

  const deleteChat = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this chat?')) {
      const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
      saveChatSessions(updatedSessions);
      
      if (currentSessionId === sessionId) {
        if (updatedSessions.length > 0) {
          setCurrentSessionId(updatedSessions[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    }
  };

  const updateSessionName = (sessionId: string, newName: string) => {
    const updatedSessions = chatSessions.map(session => 
      session.id === sessionId 
        ? { ...session, name: newName.trim() || 'Unnamed Chat', updated_at: new Date() }
        : session
    );
    saveChatSessions(updatedSessions);
    setEditingSessionId(null);
    setEditingName('');
  };

  const updateCurrentSession = (newMessages: ChatMessage[]) => {
    if (!currentSessionId) return;

    const updatedSessions = chatSessions.map(session => {
      if (session.id === currentSessionId) {
        const updatedSession = {
          ...session,
          messages: newMessages,
          updated_at: new Date()
        };

        // Auto-generate name if it's still "New Chat" and we have enough messages
        if (session.name === 'New Chat' && newMessages.length >= 2) {
          updatedSession.name = gptService.generateChatName(newMessages);
        }

        return updatedSession;
      }
      return session;
    });

    saveChatSessions(updatedSessions);
    setMessages(newMessages);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const aiResponse = await gptService.sendMessage(inputMessage.trim(), messages);
      const finalMessages = [...newMessages, aiResponse];
      updateCurrentSession(finalMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      updateCurrentSession([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleBuildAction = async (build: BuildSuggestion, action: 'add' | 'reject') => {
    if (action === 'add') {
      try {
        // Add to My Builds
        onAddToMyBuilds(build);
        
        // Add confirmation message
        const confirmMessage: ChatMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `Great! I've added "${build.name}" to your My Builds. You can find it there whenever you're ready to purchase or make modifications. Is there anything else you'd like me to help you with?`,
          timestamp: new Date()
        };
        
        const updatedMessages = [...messages, confirmMessage];
        updateCurrentSession(updatedMessages);
        
      } catch (error) {
        console.error('Error adding build:', error);
      }
    } else {
      // Handle rejection - ask for feedback
      const feedbackMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: "I understand this build isn't quite right for you. What would you like me to improve? For example:\n\n• Different budget range?\n• Better gaming performance?\n• Different brand preferences?\n• Specific components you'd like changed?\n\nLet me know what adjustments you'd like and I'll create a better build for you!",
        timestamp: new Date()
      };
      
      const updatedMessages = [...messages, feedbackMessage];
      updateCurrentSession(updatedMessages);
    }
  };

  const currentSession = chatSessions.find(s => s.id === currentSessionId);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800/50 border-r border-gray-700/50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBackToHome}
              className="flex items-center space-x-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
          
          <button
            onClick={createNewChat}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat Sessions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {chatSessions.map(session => (
            <div
              key={session.id}
              className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                currentSessionId === session.id
                  ? 'bg-red-600/20 border border-red-500/30'
                  : 'bg-gray-700/30 hover:bg-gray-700/50'
              }`}
              onClick={() => setCurrentSessionId(session.id)}
            >
              {editingSessionId === session.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 bg-gray-600 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateSessionName(session.id, editingName);
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSessionName(session.id, editingName);
                    }}
                    className="text-green-400 hover:text-green-300"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSessionId(null);
                      setEditingName('');
                    }}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-2 mb-1">
                    <MessageCircle className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <h3 className="font-medium text-white truncate flex-1">
                      {session.name}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-400">
                    {session.messages.length} messages • {session.updated_at.toLocaleDateString()}
                  </p>
                  
                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSessionId(session.id);
                        setEditingName(session.name);
                      }}
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <Edit3 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(session.id);
                      }}
                      className="text-gray-400 hover:text-red-400 p-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {chatSessions.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No chats yet</p>
              <p className="text-gray-500 text-xs">Start a new conversation!</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat Header */}
            <div className="bg-black/50 backdrop-blur-sm border-b border-red-900/20 p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-full">
                  <Bot className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {currentSession.name}
                  </h1>
                  <p className="text-sm text-gray-400">
                    PC AI Assistant • Powered by GPT-5 Thinking
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6 mx-auto">
                    <Bot className="h-10 w-10 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Welcome to PC AI Assistant
                  </h2>
                  <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    I'm here to help you build the perfect PC! Ask me about components, get build recommendations, or let me create a custom build for your needs.
                  </p>
                  
                  {/* Quick Start Suggestions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {[
                      "I want to build a gaming PC for $1500",
                      "What's the best CPU for video editing?",
                      "Help me choose a graphics card for 1440p gaming",
                      "I need a workstation for 3D rendering"
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(suggestion)}
                        className="text-left p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-red-500/30 transition-all duration-200"
                      >
                        <p className="text-white text-sm">{suggestion}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex space-x-4 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full flex-shrink-0">
                        <Bot className="h-5 w-5 text-red-400" />
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div
                        className={`p-4 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-red-600 text-white ml-auto'
                            : 'bg-gray-800/50 text-white'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Build Suggestion Card */}
                        {message.buildSuggestion && (
                          <div className="mt-4 bg-gray-700/50 rounded-xl border border-gray-600/50 overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-white">
                                  {message.buildSuggestion.name}
                                </h3>
                                <span className="text-xl font-bold text-green-400">
                                  ${message.buildSuggestion.total_price.toFixed(2)}
                                </span>
                              </div>
                              
                              <p className="text-gray-300 text-sm mb-4">
                                {message.buildSuggestion.description}
                              </p>

                              {/* Components Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                                {Object.entries(message.buildSuggestion.components).map(([category, component]: [string, any]) => (
                                  <div key={category} className="bg-gray-600/30 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                                      {category}
                                    </p>
                                    <p className="text-white text-sm font-medium line-clamp-2">
                                      {component.title}
                                    </p>
                                    <p className="text-green-400 text-sm font-semibold">
                                      ${component.price.value.toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleBuildAction(message.buildSuggestion!, 'add')}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                                >
                                  <Package className="h-5 w-5" />
                                  <span>Add to My Builds</span>
                                </button>
                                <button
                                  onClick={() => handleBuildAction(message.buildSuggestion!, 'reject')}
                                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2"
                                >
                                  <ThumbsDown className="h-5 w-5" />
                                  <span>Not Right for Me</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className={`mt-2 text-xs text-gray-500 ${
                        message.role === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-600 rounded-full flex-shrink-0">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex space-x-4 justify-start">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-full flex-shrink-0">
                    <Bot className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="bg-gray-800/50 p-4 rounded-2xl">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                      <span className="text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-700/50 p-4">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about PC building..."
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors resize-none"
                    rows={1}
                    style={{
                      minHeight: '48px',
                      maxHeight: '120px',
                      height: Math.min(120, Math.max(48, inputMessage.split('\n').length * 24))
                    }}
                    disabled={isLoading}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 flex items-center space-x-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="flex items-center justify-center w-20 h-20 bg-red-500/10 rounded-full mb-6 mx-auto">
                <MessageCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Select a chat or start a new one
              </h2>
              <p className="text-gray-400 mb-8">
                Choose from your existing conversations or create a new chat to get started.
              </p>
              <button
                onClick={createNewChat}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>Start New Chat</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}