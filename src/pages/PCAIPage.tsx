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
      const available
