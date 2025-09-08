import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const { messages } = await req.json()

    // Mock parts data (kept in sync with BuildPage)
    const mockParts = {
      cpu: [
        {
          asin: 'cpu-1',
          title: 'AMD Ryzen 9 7950X 16-Core, 32-Thread Unlocked Desktop Processor',
          price: { value: 699.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 1250,
          link: '#',
          socket: 'AM5',
          estimatedWattage: 170,
          chipset: 'X670E'
        },
        {
          asin: 'cpu-2',
          title: 'Intel Core i9-13900K Gaming Desktop Processor 24 cores',
          price: { value: 589.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 890,
          link: '#',
          socket: 'LGA1700',
          estimatedWattage: 125,
          chipset: 'Z790'
        },
        {
          asin: 'cpu-3',
          title: 'AMD Ryzen 7 7700X 8-Core, 16-Thread Unlocked Desktop Processor',
          price: { value: 399.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 756,
          link: '#',
          socket: 'AM5',
          estimatedWattage: 105,
          chipset: 'X670E'
        }
      ],
      gpu: [
        {
          asin: 'gpu-1',
          title: 'NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card',
          price: { value: 1599.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 432,
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 450,
          gpuLength: 336
        },
        {
          asin: 'gpu-2',
          title: 'NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card',
          price: { value: 1199.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 298,
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 320,
          gpuLength: 310
        }
      ],
      motherboard: [
        {
          asin: 'mb-1',
          title: 'ASUS ROG Strix X670E-E Gaming WiFi AMD AM5 ATX Motherboard',
          price: { value: 499.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.3,
          ratings_total: 167,
          link: '#',
          socket: 'AM5',
          ramType: 'DDR5',
          pcieVersion: 'PCIe 5.0',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamCapacity: 128,
          chipset: 'X670E',
          estimatedWattage: 25
        },
        {
          asin: 'mb-2',
          title: 'MSI MAG Z790 TOMAHAWK WiFi Intel LGA1700 ATX Motherboard',
          price: { value: 279.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 234,
          link: '#',
          socket: 'LGA1700',
          ramType: 'DDR5',
          pcieVersion: 'PCIe 5.0',
          formFactor: 'ATX',
          ramSlots: 4,
          maxRamCapacity: 128,
          chipset: 'Z790',
          estimatedWattage: 25
        }
      ],
      ram: [
        {
          asin: 'ram-1',
          title: 'Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz C16',
          price: { value: 179.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 2341,
          link: '#',
          ramType: 'DDR4',
          estimatedWattage: 10
        },
        {
          asin: 'ram-2',
          title: 'G.Skill Trident Z5 32GB (2x16GB) DDR5-6000 CL36',
          price: { value: 249.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 1456,
          link: '#',
          ramType: 'DDR5',
          estimatedWattage: 12
        }
      ],
      storage: [
        {
          asin: 'storage-1',
          title: 'Samsung 980 PRO 2TB PCIe 4.0 NVMe M.2 Internal SSD',
          price: { value: 199.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.7,
          ratings_total: 1876,
          link: '#',
          pcieVersion: 'PCIe 4.0',
          estimatedWattage: 8
        }
      ],
      psu: [
        {
          asin: 'psu-1',
          title: 'Corsair RM850x 850W 80 PLUS Gold Fully Modular ATX Power Supply',
          price: { value: 149.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          ratings_total: 934,
          link: '#',
          wattage: 850,
          estimatedWattage: 0
        },
        {
          asin: 'psu-2',
          title: 'EVGA SuperNOVA 750 G6 750W 80 Plus Gold Fully Modular',
          price: { value: 119.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.6,
          ratings_total: 567,
          link: '#',
          wattage: 750,
          estimatedWattage: 0
        }
      ],
      cooler: [
        {
          asin: 'cooler-1',
          title: 'Noctua NH-D15 Premium CPU Cooler with Dual NF-A15 140mm Fans',
          price: { value: 99.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.9,
          ratings_total: 567,
          link: '#',
          coolerHeight: 165,
          estimatedWattage: 5
        },
        {
          asin: 'cooler-2',
          title: 'Corsair H100i RGB PLATINUM 240mm Liquid CPU Cooler',
          price: { value: 159.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.5,
          ratings_total: 789,
          link: '#',
          coolerHeight: 27,
          estimatedWattage: 15
        }
      ],
      case: [
        {
          asin: 'case-1',
          title: 'Fractal Design Define 7 ATX Mid Tower Computer Case',
          price: { value: 169.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.4,
          ratings_total: 234,
          link: '#',
          formFactor: 'ATX',
          caseMaxGpuLength: 440,
          caseMaxCoolerHeight: 185,
          estimatedWattage: 0
        },
        {
          asin: 'case-2',
          title: 'NZXT H7 Flow RGB ATX Mid Tower Case',
          price: { value: 139.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.3,
          ratings_total: 456,
          link: '#',
          formFactor: 'ATX',
          caseMaxGpuLength: 381,
          caseMaxCoolerHeight: 165,
          estimatedWattage: 0
        }
      ],
      fans: [
        {
          asin: 'fan-1',
          title: 'Noctua NF-A12x25 PWM Premium Quiet Fan 120mm',
          price: { value: 29.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.8,
          ratings_total: 1456,
          link: '#',
          estimatedWattage: 3
        }
      ],
      accessories: [
        {
          asin: 'acc-1',
          title: 'Cable Management Kit with Velcro Straps and Zip Ties',
          price: { value: 19.99, currency: 'USD' },
          image: 'https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg?auto=compress&cs=tinysrgb&w=400',
          rating: 4.2,
          ratings_total: 789,
          link: '#',
          estimatedWattage: 0
        }
      ]
    }

    // System prompt for the AI
    const systemPrompt = `You are a helpful PC building assistant powered by GPT-4. Your goal is to help users build the perfect PC based on their needs, budget, and preferences.

IMPORTANT: You can ONLY recommend components from the available stock listed below. If a component is not in this list, you cannot suggest it.

Available Components:
${JSON.stringify(mockParts, null, 2)}

When you want to suggest a complete PC build, you MUST include a JSON code block with the following exact structure:

\`\`\`json
{
  "name": "Build Name (e.g., Gaming Beast 2025)",
  "description": "Brief description of the build and its purpose",
  "components": {
    "cpu": {"asin": "cpu-1", "title": "AMD Ryzen 9 7950X...", "price": {"value": 699.99, "currency": "USD"}},
    "gpu": {"asin": "gpu-1", "title": "NVIDIA GeForce RTX 4090...", "price": {"value": 1599.99, "currency": "USD"}},
    "motherboard": {"asin": "mb-1", "title": "ASUS ROG Strix X670E-E...", "price": {"value": 499.99, "currency": "USD"}},
    "ram": {"asin": "ram-2", "title": "G.Skill Trident Z5 32GB...", "price": {"value": 249.99, "currency": "USD"}},
    "storage": {"asin": "storage-1", "title": "Samsung 980 PRO 2TB...", "price": {"value": 199.99, "currency": "USD"}},
    "psu": {"asin": "psu-1", "title": "Corsair RM850x 850W...", "price": {"value": 149.99, "currency": "USD"}},
    "cooler": {"asin": "cooler-1", "title": "Noctua NH-D15 Premium...", "price": {"value": 99.99, "currency": "USD"}},
    "case": {"asin": "case-1", "title": "Fractal Design Define 7...", "price": {"value": 169.99, "currency": "USD"}}
  },
  "total_price": 3568.93,
  "reasoning": "Detailed explanation of why these components were chosen and how they work together."
}
\`\`\`

Rules:
1. Only use components from the available stock
2. Ensure compatibility (CPU socket matches motherboard, RAM type matches motherboard, etc.)
3. Calculate total_price accurately by summing all component prices
4. Provide reasoning for your choices
5. Consider power requirements and ensure PSU can handle the build
6. If you cannot create a build with available parts, explain conversationally

Be helpful, knowledgeable, and ask clarifying questions about budget, use case, preferences, etc.`

    // Prepare messages for OpenAI
    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ]

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices[0].message.content

    // Extract build suggestion if present
    let buildSuggestion = null
    const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch && jsonMatch[1]) {
      try {
        buildSuggestion = JSON.parse(jsonMatch[1])
      } catch (e) {
        console.error('Failed to parse JSON from AI response:', e)
      }
    }

    return new Response(
      JSON.stringify({
        content: assistantMessage,
        buildSuggestion: buildSuggestion
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})