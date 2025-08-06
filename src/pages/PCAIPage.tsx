// src/pages/PCAIPage.tsx
import React, { useState } from 'react';
import { askGPT } from '../lib/gptService';

export default function PCAIPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, `🧑 You: ${userMessage}`]);
    setInput('');
    setLoading(true);

    try {
      const response = await askGPT(userMessage);
      setMessages(prev => [...prev, `🤖 GPT: ${response}`]);
    } catch (err) {
      setMessages(prev => [...prev, `❌ Error talking to GPT`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button onClick={onBackToHome} className="text-red-400 hover:underline mb-4">← Back to Home</button>
      
      <h1 className="text-2xl font-bold mb-6">💬 PC AI Assistant</h1>

      <div className="bg-black/20 p-4 rounded-lg mb-4 h-[400px] overflow-y-auto space-y-2">
        {messages.map((msg, idx) => (
          <p key={idx} className="text-sm">{msg}</p>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
          placeholder="Ask something like: Build me a $1500 gaming PC"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
