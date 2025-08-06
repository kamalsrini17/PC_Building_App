import React, { useState, useRef, useEffect } from 'react';
import { askGPT } from '../lib/gptService';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function PCAIPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a PC build assistant. Answer only PC-related questions.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askGPT(messages.map(m => m.content).join('\n') + '\nUser: ' + userMsg.content);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Error talking to GPT' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between bg-gray-800 px-6 py-4">
        <button onClick={onBackToHome} className="text-red-400 hover:underline">← Home</button>
        <h1 className="text-lg font-semibold">PC AI Assistant</h1>
        <div />
      </header>

      {/* Chat Window */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, idx) => {
          if (msg.role === 'system') return null;
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`max-w-xl mx-auto flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg whitespace-pre-wrap ${
                  isUser
                    ? 'bg-red-600 text-white rounded-br-none'
                    : 'bg-gray-700 text-gray-100 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="max-w-xl mx-auto flex justify-start">
            <div className="animate-pulse p-3 bg-gray-700 text-gray-100 rounded-lg rounded-bl-none">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-gray-800 p-4">
        <div className="flex items-center max-w-4xl mx-auto">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className="flex-1 bg-gray-700 text-white rounded-md px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ask about PC builds..."
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="ml-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-md"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
