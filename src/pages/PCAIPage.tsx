import React, { useState, useEffect, useRef } from 'react';
import { askGPT } from '../lib/gptService';

export type Message = { role: 'user' | 'assistant'; text: string };

export default function PCAIPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Initialize with assistant prompts once
  useEffect(() => {
    setMessages([
      { role: 'assistant', text: "Hello! I'm your PC AI assistant. Let's get started." },
      { role: 'assistant', text: 'What will you primarily use your PC for? (e.g. gaming, video editing)' },
    ]);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setLoading(true);

    try {
      const reply = await askGPT(userText);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '❌ Error talking to GPT' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-900 text-white">
      <button
        onClick={onBackToHome}
        className="self-start m-4 text-red-400 hover:underline"
      >
        ← Back to Home
      </button>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`
              max-w-[70%] px-4 py-2 rounded-lg break-words
              ${m.role === 'assistant'
                ? 'bg-gray-800 self-start'
                : 'bg-red-700 self-end text-white'}
            `}
          >
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center p-4 border-t border-gray-700 bg-gray-800">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
          placeholder="Type your answer…"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="ml-4 px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 transition"
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
