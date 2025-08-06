// src/pages/PCAIPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import { Cpu, DollarSign, Briefcase, Loader2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Build {
  id: string;
  name: string;
  description: string;
  components: Record<string, any>;
  total_price: number;
  created_at: string;
}

interface PCAIPageProps {
  onBackToHome: () => void;
  onAddToMyBuild: (build: Build) => void;
}

// Mock online search stub
const fetchOnlineBuilds = async (data: { useCase: string; budget: number; }) => {
  // TODO: replace with real API integration
  await new Promise((r) => setTimeout(r, 1000));
  // Return up to 4 mock builds if budget >= 500
  if (data.budget < 500) return [];
  const builds: Build[] = Array.from({ length: 4 }, (_, i) => ({
    id: uuidv4(),
    name: `${data.useCase} PC Build #${i + 1}`,
    description: `A ${data.useCase}-focused build around $${data.budget}.`,
    components: {},
    total_price: data.budget,
    created_at: new Date().toISOString(),
  }));
  return builds;
};

export default function PCAIPage({ onBackToHome, onAddToMyBuild }: PCAIPageProps) {
  // form data
  const [useCase, setUseCase] = useState<string | null>(null);
  const [budget, setBudget] = useState<number | null>(null);

  // conversation
  const [step, setStep] = useState<number>(0);
  const [messages, setMessages] = useState<{ from: 'bot' | 'user'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // search results
  const [builds, setBuilds] = useState<Build[]>([]);

  const questions = [
    "What will you primarily use your PC for? (e.g. gaming, video editing)",
    "What's your budget in USD?"
  ];

  // send a bot message
  const botMessage = (text: string) => {
    setMessages((prev) => [...prev, { from: 'bot', text }]);
  };

  // initialize conversation
  useEffect(() => {
    botMessage("Hello! I'm your PC AI assistant. Let's get started.");
    botMessage(questions[0]);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // record user message
    setMessages((prev) => [...prev, { from: 'user', text: input.trim() }]);
    const answer = input.trim();
    setInput('');

    // collect data based on step
    if (step === 0) {
      setUseCase(answer);
      setStep(1);
      botMessage(questions[1]);
      return;
    }
    if (step === 1) {
      const num = parseFloat(answer.replace(/[^0-9.]/g, ''));
      if (isNaN(num)) {
        botMessage("Sorry, I didn't catch a valid number. Please enter a numeric budget.");
        return;
      }
      setBudget(num);
      setStep(2);

      // all data collected, start search
      setLoading(true);
      botMessage("Great! Let me look for builds that match your requirements...");
      const results = await fetchOnlineBuilds({ useCase: useCase!, budget: num });
      setLoading(false);
      if (results.length === 0) {
        botMessage("Unfortunately, at this time we don't have the build you are looking for. Try again later.");
      } else {
        setBuilds(results);
        botMessage(`I found ${results.length} potential builds:`);
      }
      return;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={onBackToHome} className="text-red-400 hover:underline">
          ← Home
        </button>
        <h1 className="font-bold">PC AI Assistant</h1>
        <div className="w-6" />
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-2xl px-4 py-2 rounded-lg ${
              msg.from === 'bot'
                ? 'bg-gray-800 self-start'
                : 'bg-red-600/70 self-end'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" />
            <span>Searching...</span>
          </div>
        )}
      </div>

      {/* Results grid */}
      {builds.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-4 p-4">
          {builds.map((b) => (
            <div
              key={b.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2 text-white">
                  {b.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {b.description}
                </p>
                <div className="flex items-center text-gray-400 space-x-2">
                  <Cpu />
                  <span>Use Case: {useCase}</span>
                </div>
                <div className="flex items-center text-gray-400 space-x-2">
                  <DollarSign />
                  <span>Budget: ${budget!.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => onAddToMyBuild(b)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg"
              >
                Add to My Builds
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      {step < 2 && (
        <form onSubmit={handleSubmit} className="bg-gray-800 px-4 py-3 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-700 rounded-l-lg px-4 py-2 focus:outline-none"
            placeholder="Type your answer..."
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-r-lg"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
