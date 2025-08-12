// src/pages/PCAIPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Send, Plus, Bot, User, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// -------------------- Types --------------------
type Msg = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  quickReplies?: string[]; // optional chips under assistant messages
};

type Collected = {
  useCase?: string;
  budget?: number;
  resolution?: '1080p' | '1440p' | '4K';
  frameRate?: number;
};

type Build = {
  id: string;
  name: string;
  description: string;
  components: Record<string, any>;
  total_price: number;
  created_at?: string;
};

// -------------------- Copy & helpers --------------------
const INFO: Record<keyof Collected, string> = {
  useCase: 'Use-case helps me balance CPU vs GPU and features.',
  budget: 'Budget lets me maximize performance per dollar.',
  resolution: 'Target resolution drives GPU choice and VRAM needs.',
  frameRate: 'Your FPS target helps size the CPU and GPU.'
};

const questionFor = (missing: keyof Collected): { q: string; quick: string[] } => {
  switch (missing) {
    case 'useCase':
      return {
        q: 'What will you primarily use this PC for?',
        quick: ['Gaming', 'Video editing', 'Streaming', 'Software dev', 'General use']
      };
    case 'budget':
      return {
        q: "What's your approximate budget (USD)?",
        quick: ['$800', '$1,000', '$1,200', '$1,500', '$2,000']
      };
    case 'resolution':
      return {
        q: 'What resolution will you target?',
        quick: ['1080p', '1440p', '4K']
      };
    case 'frameRate':
      return {
        q: 'Any frame rate goal?',
        quick: ['60 fps', '120 fps', '144 fps', '240 fps']
      };
    default:
      return { q: '', quick: [] };
  }
};

const REQUIRED_ORDER: (keyof Collected)[] = ['useCase', 'budget', 'resolution', 'frameRate'];

function summary(c: Collected): string {
  const parts = [
    c.useCase && `use-case: ${c.useCase}`,
    c.budget && `budget: $${c.budget.toLocaleString()}`,
    c.resolution && `resolution: ${c.resolution}`,
    c.frameRate && `fps target: ${c.frameRate}`
  ].filter(Boolean) as string[];
  return parts.join(', ');
}

function nextMissing(c: Collected): keyof Collected | null {
  return REQUIRED_ORDER.find((k) => !c[k]) ?? null;
}

// -------------------- Lightweight NLU --------------------
function parseInput(msg: string): Partial<Collected> {
  const lower = msg.toLowerCase();
  const out: Partial<Collected> = {};

  // budget (e.g., 1200, $1,200, 1.5k, 1000-1500)
  const money = msg.match(/(\$?\s?(\d{3,5})(?:\s?-\s?\$?\d{3,5})?|\d+(?:\.\d+)?\s?k)/i);
  if (money) {
    let v = money[0].toLowerCase().replace(/[^0-9.k-]/g, '');
    if (v.includes('-')) v = v.split('-')[1]; // take upper bound if range
    let n = 0;
    if (v.endsWith('k')) n = Math.round(parseFloat(v) * 1000);
    else n = parseInt(v.replace(/\D/g, ''), 10);
    if (!Number.isNaN(n) && n >= 300) out.budget = n;
  }

  // use case
  if (/\bgam(e|ing)\b|valorant|fortnite|cs2|cod|elden/.test(lower)) out.useCase = 'gaming';
  else if (/video edit|premiere|davinci|after effects|content creat/.test(lower)) out.useCase = 'video editing';
  else if (/stream(ing)?/.test(lower)) out.useCase = 'streaming';
  else if (/3d|blender|render|cad|solidworks/.test(lower)) out.useCase = '3D/rendering';
  else if (/software|coding|programming|developer|dev/.test(lower)) out.useCase = 'software development';
  else if (/office|brows|school|general/.test(lower)) out.useCase = 'general use';

  // resolution
  if (/4k|3840x2160/.test(lower)) out.resolution = '4K';
  else if (/1440p|2560x1440|qhd/.test(lower)) out.resolution = '1440p';
  else if (/1080p|1920x1080|fhd/.test(lower)) out.resolution = '1080p';

  // frame rate
  const fps = lower.match(/(\d{2,3})\s*fps|\b(60|75|120|144|165|240)\b/);
  if (fps) {
    const n = parseInt((fps[1] || fps[2]) as string, 10);
    if (!Number.isNaN(n)) out.frameRate = n;
  }

  // allow quick reply phrases like "144 fps"
  const fps2 = lower.match(/\b(60|75|120|144|165|240)\s*fps\b/);
  if (fps2) out.frameRate = parseInt(fps2[1], 10);

  return out;
}

// -------------------- Mock search + inventory --------------------
const CPU = {
  entry: { name: 'AMD Ryzen 5 5600', price: 130 },
  mid: { name: 'Intel Core i5-13400F', price: 210 },
  upper: { name: 'Intel Core i5-13600K', price: 320 },
  high: { name: 'AMD Ryzen 7 7800X3D', price: 420 }
} as const;

const GPU = {
  '1080p-entry': { name: 'Radeon RX 6600', price: 200 },
  '1080p-mid': { name: 'GeForce RTX 3060 Ti', price: 330 },
  '1440p-mid': { name: 'Radeon RX 6700 XT', price: 360 },
  '1440p-upper': { name: 'GeForce RTX 4070 Super', price: 600 },
  '4K-upper': { name: 'GeForce RTX 4080 Super', price: 1100 }
} as const;

const OUR_PARTS = {
  cpus: new Set(['AMD Ryzen 5 5600', 'Intel Core i5-13600K', 'AMD Ryzen 7 7800X3D']),
  gpus: new Set(['Radeon RX 6600', 'Radeon RX 6700 XT', 'GeForce RTX 4070 Super'])
};

function pickTier(budget: number) {
  if (budget < 900) return 'entry' as const;
  if (budget < 1300) return 'mid' as const;
  if (budget < 1800) return 'upper' as const;
  return 'high' as const;
}

async function fetchCandidateBuilds(c: Collected): Promise<Build[]> {
  await new Promise((r) => setTimeout(r, 800));

  const tier = pickTier(c.budget ?? 1200);
  let gpuKey: keyof typeof GPU = '1080p-mid';
  switch (c.resolution) {
    case '1080p':
      gpuKey = tier === 'entry' ? '1080p-entry' : '1080p-mid';
      break;
    case '1440p':
      gpuKey = tier === 'upper' ? '1440p-upper' : '1440p-mid';
      break;
    case '4K':
      gpuKey = '4K-upper';
      break;
  }

  const base = [
    {
      name: 'Balanced',
      cpu: CPU[tier],
      gpu: GPU[gpuKey],
      ram: { name: '16GB DDR4/DDR5', price: 55 },
      storage: { name: '1TB NVMe SSD', price: 70 },
      psu: { name: '650W 80+ Gold', price: 80 },
      case: { name: 'ATX Airflow Case', price: 80 },
      cooler: { name: 'Tower Air Cooler', price: 40 },
      motherboard: { name: tier === 'high' ? 'AM5 B650' : 'B660 mATX', price: 140 }
    },
    {
      name: 'Performance',
      cpu: tier === 'upper' || tier === 'high' ? CPU.high : CPU.upper,
      gpu: GPU[gpuKey],
      ram: { name: '32GB DDR5', price: 110 },
      storage: { name: '2TB NVMe SSD', price: 130 },
      psu: { name: '750W 80+ Gold', price: 110 },
      case: { name: 'ATX Mesh Case', price: 100 },
      cooler: { name: '240mm AIO', price: 120 },
      motherboard: { name: 'AM5 B650 / Z790', price: 200 }
    },
    {
      name: 'Value',
      cpu: CPU[tier === 'entry' ? 'entry' : 'mid'],
      gpu: GPU[gpuKey],
      ram: { name: '16GB DDR4', price: 45 },
      storage: { name: '1TB NVMe SSD', price: 70 },
      psu: { name: '550W 80+ Bronze', price: 55 },
      case: { name: 'mATX Case', price: 60 },
      cooler: { name: 'Stock / Budget Tower', price: 0 },
      motherboard: { name: 'B660/B550 mATX', price: 110 }
    },
    {
      name: 'Quiet/Compact',
      cpu: CPU[tier],
      gpu: GPU[gpuKey],
      ram: { name: '32GB Low-profile', price: 120 },
      storage: { name: '1TB NVMe SSD', price: 70 },
      psu: { name: '650W SFX 80+ Gold', price: 130 },
      case: { name: 'Mini-ITX Quiet Case', price: 140 },
      cooler: { name: 'Low-profile Air', price: 60 },
      motherboard: { name: 'Mini-ITX board', price: 220 }
    }
  ];

  const builds: Build[] = base.map((b, i) => {
    const components = {
      CPU: b.cpu.name,
      GPU: b.gpu.name,
      RAM: b.ram.name,
      Storage: b.storage.name,
      PSU: b.psu.name,
      Case: b.case.name,
      Cooler: b.cooler.name,
      Motherboard: b.motherboard.name
    } as const;

    const total =
      b.cpu.price +
      b.gpu.price +
      b.ram.price +
      b.storage.price +
      b.psu.price +
      b.case.price +
      b.cooler.price +
      b.motherboard.price;

    return {
      id: `ai-${Date.now()}-${i}`,
      name: `${b.name} — ${c.resolution} ${c.useCase}`,
      description: `AI-recommended ${c.useCase} build targeting ${c.resolution}${
        c.frameRate ? ` @ ~${c.frameRate}fps` : ''
      }.`,
      components,
      total_price: total
    };
  });

  const budget = c.budget ?? 1200;
  const within = builds.filter((b) => b.total_price <= budget * 1.15);
  return (within.length ? within : builds).slice(0, 4);
}

function filterByInventory(builds: Build[]): Build[] {
  return builds.filter(
    (b) => OUR_PARTS.cpus.has(String(b.components.CPU)) && OUR_PARTS.gpus.has(String(b.components.GPU))
  );
}

// -------------------- Component --------------------
export default function PCAIPage({ onBackToHome }: { onBackToHome: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [collected, setCollected] = useState<Collected>({});
  const [suggestions, setSuggestions] = useState<Build[]>([]);
  const hasGreeted = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Greet once – intro only (wait for the user to start)
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content:
          "Hi! I'm your PC build assistant. Tell me what you’re building (e.g., “$1200 gaming at 1440p”)."
      }
    ]);
  }, []);

  // Auto-scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, suggestions, typing]);

  // Helpers
  const pushAssistant = (content: string, quickReplies?: string[]) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content, quickReplies }]);
  };

  const askNext = (c: Collected) => {
    const missing = nextMissing(c);
    if (!missing) return;
    const info = INFO[missing];
    const { q, quick } = questionFor(missing);
    pushAssistant(`${info}\n\n${q}`, quick);
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    setTimeout(sendMessage, 0);
  };

  const handleUserTurn = async (text: string) => {
    // Parse and update collected info
    const parsed = parseInput(text);
    const updated = { ...collected, ...parsed };
    setCollected(updated);

    const missing = nextMissing(updated);
    if (missing) {
      setTyping(true);
      // small delay to feel chatty
      setTimeout(() => {
        setTyping(false);
        // acknowledge what we learned so far
        const ack = summary(updated);
        if (ack) pushAssistant(`Got it — ${ack}.`);
        askNext(updated);
      }, 450);
      return;
    }

    // We have all required info — generate builds
    setTyping(true);
    pushAssistant(`Great — I have everything I need (${summary(updated)}). Let me search for solid options...`);
    try {
      const candidates = await fetchCandidateBuilds(updated);
      const available = filterByInventory(candidates);
      setSuggestions(available.length ? available : candidates);
      setTyping(false);
      pushAssistant(
        available.length
          ? `Found ${available.length} builds matching your specs and our current inventory!`
          : `Found ${candidates.length} builds for you! (Some parts may need ordering)`
      );
    } catch (error) {
      setTyping(false);
      pushAssistant('Sorry, I encountered an error while searching for builds. Please try again.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'user', content: userMsg }]);
    setLoading(true);
    
    await handleUserTurn(userMsg);
    setLoading(false);
  };

  const saveBuild = async (build: Build) => {
    if (!user) {
      alert('Please sign in to save builds');
      return;
    }

    try {
      const { error } = await supabase.from('builds').insert({
        user_id: user.id,
        name: build.name,
        description: build.description,
        components: build.components,
        total_price: build.total_price
      });

      if (error) throw error;
      alert('Build saved successfully!');
    } catch (error) {
      console.error('Error saving build:', error);
      alert('Failed to save build');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900/20 to-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-sm border-b border-red-500/20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 transition-colors"
          >
            ←
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

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-100px)]">
        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 mb-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-red-600 text-white ml-auto'
                      : 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickReply(reply)}
                        className="px-3 py-1 text-sm bg-gray-700/50 hover:bg-gray-600/50 rounded-full border border-gray-600/50 transition-colors"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
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

          {/* Build Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-400 mb-4">Recommended Builds</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {suggestions.map((build) => (
                  <div
                    key={build.id}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-semibold text-lg">{build.name}</h4>
                      <span className="text-2xl font-bold text-red-400">${build.total_price.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{build.description}</p>
                    <div className="space-y-2 text-sm">
                      {Object.entries(build.components).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-gray-400">{key}:</span>
                          <span>{String(value)}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => saveBuild(build)}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Save Build
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tell me about your ideal PC build..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-white placeholder-gray-400"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
