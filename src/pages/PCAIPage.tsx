// src/pages/PCAIPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Send, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

// -------------------- Types --------------------
type Msg = { id: string; role: 'assistant' | 'user'; content: string };
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

// -------------------- Interview copy --------------------
const INFO: Record<keyof Collected, string> = {
  useCase: 'Use‑case tells me how to balance CPU vs GPU and what features matter.',
  budget: 'Budget helps me pick parts that maximize performance per dollar.',
  resolution: 'Target resolution drives the GPU choice and VRAM needs.',
  frameRate: 'Your FPS target helps size the CPU and GPU appropriately.'
};

const questionFor = (missing: keyof Collected): string => {
  switch (missing) {
    case 'useCase':
      return 'What will you primarily use your PC for? (gaming, video editing, streaming, software dev, general use)';
    case 'budget':
      return "What's your approximate budget in USD? (e.g., 1200, 1.5k)";
    case 'resolution':
      return 'What resolution will you play/work at? (1080p, 1440p, 4K)';
    case 'frameRate':
      return 'Do you have a frame‑rate target? (60, 120, 144, 240 fps)';
    default:
      return '';
  }
};

const REQUIRED_ORDER: (keyof Collected)[] = ['useCase', 'budget', 'resolution', 'frameRate'];

function summary(c: Collected): string {
  const parts = [
    c.useCase && use‑case: ${c.useCase},
    c.budget && budget: $${c.budget.toLocaleString()},
    c.resolution && resolution: ${c.resolution},
    c.frameRate && fps target: ${c.frameRate}
  ].filter(Boolean);
  return parts.join(', ');
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

  return out;
}

// -------------------- Mock online search + inventory --------------------
const CPU = {
  entry: { name: 'AMD Ryzen 5 5600', price: 130 },
  mid: { name: 'Intel Core i5‑13400F', price: 210 },
  upper: { name: 'Intel Core i5‑13600K', price: 320 },
  high: { name: 'AMD Ryzen 7 7800X3D', price: 420 }
} as const;

const GPU = {
  '1080p-entry': { name: 'Radeon RX 6600', price: 200 },
  '1080p-mid': { name: 'GeForce RTX 3060 Ti', price: 330 },
  '1440p-mid': { name: 'Radeon RX 6700 XT', price: 360 },
  '1440p-upper': { name: 'GeForce RTX 4070 Super', price: 600 },
  '4K-upper': { name: 'GeForce RTX 4080 Super', price: 1100 }
} as const;

// Our current (mock) inventory — swap with real data later
const OUR_PARTS = {
  cpus: new Set(['AMD Ryzen 5 5600', 'Intel Core i5‑13600K', 'AMD Ryzen 7 7800X3D']),
  gpus: new Set(['Radeon RX 6600', 'Radeon RX 6700 XT', 'GeForce RTX 4070 Super'])
};

function pickTier(budget: number) {
  if (budget < 900) return 'entry' as const;
  if (budget < 1300) return 'mid' as const;
  if (budget < 1800) return 'upper' as const;
  return 'high' as const;
}

async function fetchCandidateBuilds(c: Collected): Promise<Build[]> {
  // simulate online search latency
  await new Promise((r) => setTimeout(r, 900));

  // choose parts based on budget+resolution
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
      cpu: tier === 'upper' || tier === 'high' ? CPU['high'] : CPU['upper'],
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
      ram: { name: '32GB Low‑profile', price: 120 },
      storage: { name: '1TB NVMe SSD', price: 70 },
      psu: { name: '650W SFX 80+ Gold', price: 130 },
      case: { name: 'Mini‑ITX Quiet Case', price: 140 },
      cooler: { name: 'Low‑profile Air', price: 60 },
      motherboard: { name: 'Mini‑ITX board', price: 220 }
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
      id: ai-${Date.now()}-${i},
      name: ${b.name} — ${c.resolution} ${c.useCase},
      description: AI‑recommended ${c.useCase} build targeting ${c.resolution}${
        c.frameRate ?  @ ~${c.frameRate}fps : ''
      }.,
      components,
      total_price: total
    };
  });

  // filter by budget with ±15% tolerance
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
  const [collected, setCollected] = useState<Collected>({});
  const [suggestions, setSuggestions] = useState<Build[]>([]);
  const hasGreeted = useRef(false); // prevent StrictMode double‑mount duplicate greeting
  const listRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Greet once
  useEffect(() => {
    if (hasGreeted.current) return;
    hasGreeted.current = true;
    setMessages([
      { id: crypto.randomUUID(), role: 'assistant', content: "Hello! I'm your PC AI assistant. Let's get started." }
    ]);
  }, []);

  // Auto‑scroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, suggestions]);

  const nextMissing = (c: Collected): keyof Collected | null => REQUIRED_ORDER.find((k) => !c[k]) ?? null;

  const askNextQuestion = (c: Collected) => {
    const missing = nextMissing(c);
    if (!missing) return;
    const info = INFO[missing];
    const q = questionFor(missing);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: 'assistant', content: ${info}\n\n${q} }
    ]);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', content: text }]);

    // Parse and update collected info
    const parsed = parseInput(text);
    const updated = { ...collected, ...parsed };
    setCollected(updated);

    const missing = nextMissing(updated);
    if (missing) {
      // provide info + ask next
      setTimeout(() => askNextQuestion(updated), 150);
      return;
    }

    // We have all required info — generate builds
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: Great — I have everything I need (${summary(updated)}). Let me search for solid options...
      }
    ]);

    try {
      const candidates = await fetchCandidateBuilds(updated);
      const available = filterByInventory(candidates);
      setSuggestions(available);

      if (!available.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              "Unfortunately, at this time we don't have the build you are looking for. Try again later."
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: 'Here are up to four builds that match your needs:' }
        ]);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Something went wrong while searching. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const addToMyBuilds = async (b: Build) => {
    if (!user) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Please sign in to save builds to My Builds.' }
      ]);
      return;
    }
    try {
      const { error } = await supabase.from('builds').insert({
        user_id: user.id,
        name: b.name,
        description: b.description,
        components: b.components,
        total_price: b.total_price
      });
      if (error) throw error;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: '✅ Added to My Builds.' }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: ❌ Couldn't save: ${err.message || 'unknown error'} }
      ]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 sticky top-0 bg-gray-900/80 backdrop-blur z-10 flex items-center gap-3">
        <button onClick={onBackToHome} className="text-red-400 hover:text-red-300 transition">← Back</button>
        <h1 className="font-semibold">PC AI Assistant</h1>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={max-w-3xl ${
              m.role === 'assistant' ? 'bg-gray-800/70' : 'bg-red-600/20 border border-red-500/30'
            } rounded-2xl px-4 py-3}
          >
            <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
          </div>
        ))}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="max-w-5xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 mt-4">
              {suggestions.map((b) => (
                <div
                  key={b.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-red-500/30 transition-all duration-300 group"
                >
                  <div className="p-6 pb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-red-300 transition-colors">
                      {b.name}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">{b.description}</p>
                    <div className="mt-4 text-sm text-gray-300 space-y-1">
                      {Object.entries(b.components)
                        .slice(0, 6)
                        .map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-400">{k}</span>
                            <span>{String(v)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="px-6 pb-6 flex items-center justify-between">
                    <span className="font-bold text-red-300">${b.total_price.toFixed(2)}</span>
                    <button
                      onClick={() => addToMyBuilds(b)}
                      className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add to My Builds
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/80">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={loading}
            placeholder="Type your answer..."
            className="flex-1 p-3 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-4 rounded-lg flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}