interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  buildSuggestion?: BuildSuggestion;
}

interface BuildSuggestion {
  id: string;
  name: string;
  description: string;
  components: Record<string, any>;
  total_price: number;
  reasoning: string;
}

interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  created_at: Date;
  updated_at: Date;
}

// Mock GPT-5 Thinking service
export class GPTService {
  private static instance: GPTService;
  private mockParts: Record<string, any[]> = {};

  private constructor() {
    this.initializeMockParts();
  }

  static getInstance(): GPTService {
    if (!GPTService.instance) {
      GPTService.instance = new GPTService();
    }
    return GPTService.instance;
  }

  private initializeMockParts() {
    // Initialize with the same mock data from BuildPage
    this.mockParts = {
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
    };
  }

  async sendMessage(message: string, conversationHistory: ChatMessage[]): Promise<ChatMessage> {
    // Simulate thinking delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze conversation context
    const context = this.analyzeConversation(conversationHistory);
    const userMessage = message.toLowerCase();

    // Check if user is asking for a build
    const isBuildRequest = this.isBuildRequest(userMessage, context);
    
    if (isBuildRequest) {
      const buildSuggestion = this.generateBuildSuggestion(context, userMessage);
      return {
        id: messageId,
        role: 'assistant',
        content: this.generateBuildResponse(buildSuggestion, context),
        timestamp: new Date(),
        buildSuggestion
      };
    }

    // Generate conversational response
    const response = this.generateConversationalResponse(userMessage, context);
    
    return {
      id: messageId,
      role: 'assistant',
      content: response,
      timestamp: new Date()
    };
  }

  private analyzeConversation(messages: ChatMessage[]): any {
    const context = {
      budget: null as number | null,
      useCase: null as string | null,
      resolution: null as string | null,
      preferences: [] as string[],
      previousBuilds: [] as BuildSuggestion[]
    };

    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      
      // Extract budget
      const budgetMatch = content.match(/\$?(\d{3,5})/);
      if (budgetMatch && !context.budget) {
        context.budget = parseInt(budgetMatch[1]);
      }

      // Extract use case
      if (content.includes('gaming') && !context.useCase) context.useCase = 'gaming';
      if (content.includes('work') || content.includes('productivity') && !context.useCase) context.useCase = 'work';
      if (content.includes('streaming') && !context.useCase) context.useCase = 'streaming';
      if (content.includes('editing') && !context.useCase) context.useCase = 'editing';

      // Extract resolution
      if (content.includes('1080p') || content.includes('1920x1080')) context.resolution = '1080p';
      if (content.includes('1440p') || content.includes('2560x1440')) context.resolution = '1440p';
      if (content.includes('4k') || content.includes('3840x2160')) context.resolution = '4k';

      // Extract preferences
      if (content.includes('amd') && !context.preferences.includes('amd')) context.preferences.push('amd');
      if (content.includes('intel') && !context.preferences.includes('intel')) context.preferences.push('intel');
      if (content.includes('nvidia') && !context.preferences.includes('nvidia')) context.preferences.push('nvidia');
      if (content.includes('rgb') && !context.preferences.includes('rgb')) context.preferences.push('rgb');

      // Store previous builds
      if (msg.buildSuggestion) {
        context.previousBuilds.push(msg.buildSuggestion);
      }
    });

    return context;
  }

  private isBuildRequest(message: string, context: any): boolean {
    const buildKeywords = [
      'build', 'suggest', 'recommend', 'create', 'make', 'generate',
      'show me', 'what should', 'help me', 'pc for', 'computer for'
    ];

    return buildKeywords.some(keyword => message.includes(keyword)) && 
           (context.budget || context.useCase || message.includes('$'));
  }

  private generateBuildSuggestion(context: any, userMessage: string): BuildSuggestion {
    const buildId = `build-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Select components based on context
    const selectedComponents: Record<string, any> = {};
    let totalPrice = 0;

    // CPU Selection
    if (context.preferences.includes('amd') || context.budget < 800) {
      selectedComponents.cpu = this.mockParts.cpu[2]; // Ryzen 7 7700X
    } else {
      selectedComponents.cpu = this.mockParts.cpu[1]; // Intel i9-13900K
    }
    totalPrice += selectedComponents.cpu.price.value;

    // GPU Selection based on budget and resolution
    if (context.budget > 2000 || context.resolution === '4k') {
      selectedComponents.gpu = this.mockParts.gpu[0]; // RTX 4090
    } else {
      selectedComponents.gpu = this.mockParts.gpu[1]; // RTX 4080
    }
    totalPrice += selectedComponents.gpu.price.value;

    // Motherboard (compatible with CPU)
    if (selectedComponents.cpu.socket === 'AM5') {
      selectedComponents.motherboard = this.mockParts.motherboard[0]; // ASUS X670E
    } else {
      selectedComponents.motherboard = this.mockParts.motherboard[1]; // MSI Z790
    }
    totalPrice += selectedComponents.motherboard.price.value;

    // RAM (compatible with motherboard)
    if (selectedComponents.motherboard.ramType === 'DDR5') {
      selectedComponents.ram = this.mockParts.ram[1]; // DDR5
    } else {
      selectedComponents.ram = this.mockParts.ram[0]; // DDR4
    }
    totalPrice += selectedComponents.ram.price.value;

    // Storage
    selectedComponents.storage = this.mockParts.storage[0];
    totalPrice += selectedComponents.storage.price.value;

    // PSU (based on power requirements)
    const estimatedWattage = Object.values(selectedComponents).reduce((sum: number, component: any) => {
      return sum + (component.estimatedWattage || 0);
    }, 0);
    
    if (estimatedWattage > 600) {
      selectedComponents.psu = this.mockParts.psu[0]; // 850W
    } else {
      selectedComponents.psu = this.mockParts.psu[1]; // 750W
    }
    totalPrice += selectedComponents.psu.price.value;

    // Cooler
    selectedComponents.cooler = this.mockParts.cooler[0]; // Noctua NH-D15
    totalPrice += selectedComponents.cooler.price.value;

    // Case
    selectedComponents.case = this.mockParts.case[0];
    totalPrice += selectedComponents.case.price.value;

    const buildName = this.generateBuildName(context, selectedComponents);
    const reasoning = this.generateBuildReasoning(context, selectedComponents);

    return {
      id: buildId,
      name: buildName,
      description: `Custom ${context.useCase || 'performance'} build for ${context.resolution || 'high-res'} gaming`,
      components: selectedComponents,
      total_price: totalPrice,
      reasoning
    };
  }

  private generateBuildName(context: any, components: any): string {
    const useCase = context.useCase || 'Performance';
    const gpu = components.gpu.title.includes('4090') ? 'Ultimate' : 'Pro';
    const cpu = components.cpu.title.includes('AMD') ? 'AMD' : 'Intel';
    
    return `${useCase.charAt(0).toUpperCase() + useCase.slice(1)} ${gpu} ${cpu} Build`;
  }

  private generateBuildReasoning(context: any, components: any): string {
    let reasoning = "Here's why I selected these components:\n\n";
    
    reasoning += `🔥 **${components.cpu.title.split(' ').slice(0, 4).join(' ')}**: Perfect for ${context.useCase || 'high-performance'} tasks with excellent multi-core performance.\n\n`;
    
    reasoning += `🎮 **${components.gpu.title.split(' ').slice(0, 4).join(' ')}**: Delivers exceptional ${context.resolution || '1440p+'} gaming performance with ray tracing support.\n\n`;
    
    reasoning += `⚡ **${components.motherboard.title.split(' ').slice(0, 3).join(' ')}**: High-quality motherboard with ${components.motherboard.ramType} support and excellent connectivity.\n\n`;
    
    reasoning += `💾 **${components.ram.title.split(' ').slice(0, 4).join(' ')}**: Fast ${components.ram.ramType} memory for smooth multitasking and gaming.\n\n`;
    
    reasoning += `💿 **${components.storage.title.split(' ').slice(0, 4).join(' ')}**: Lightning-fast NVMe storage for quick boot times and game loading.`;
    
    return reasoning;
  }

  private generateBuildResponse(build: BuildSuggestion, context: any): string {
    const responses = [
      `Perfect! I've created a custom build tailored to your needs. This ${build.name} is designed for ${context.useCase || 'high-performance'} computing`,
      `Great choice! Here's a ${build.name} I've put together based on your requirements`,
      `Excellent! I've crafted this ${build.name} specifically for your ${context.useCase || 'performance'} needs`,
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return `${response} with a total budget of $${build.total_price.toFixed(2)}.\n\n${build.reasoning}\n\nWhat do you think? Would you like me to add this to your builds or would you prefer some adjustments?`;
  }

  private generateConversationalResponse(message: string, context: any): string {
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm your PC building assistant powered by GPT-5 Thinking. I'm here to help you create the perfect PC build! What kind of computer are you looking to build today?";
    }

    // Budget questions
    if (message.includes('budget') && !context.budget) {
      return "Great question! What's your budget range for this build? This will help me recommend the best components for your money. Are you thinking around $800, $1200, $1800, or higher?";
    }

    // Use case questions
    if (!context.useCase) {
      return "What will you primarily use this PC for? Gaming, work/productivity, content creation, streaming, or a mix of everything? This helps me prioritize the right components for your needs.";
    }

    // Resolution questions
    if (context.useCase === 'gaming' && !context.resolution) {
      return "What resolution do you plan to game at? 1080p, 1440p, or 4K? This will help me choose the right GPU for smooth performance at your target resolution.";
    }

    // General PC building advice
    if (message.includes('cpu') || message.includes('processor')) {
      return "For CPUs, I'd recommend either AMD Ryzen or Intel Core processors depending on your budget and use case. AMD typically offers better value for gaming and productivity, while Intel excels in single-core performance. What's your budget and primary use case?";
    }

    if (message.includes('gpu') || message.includes('graphics')) {
      return "Graphics cards are crucial for gaming performance! NVIDIA RTX 40-series offers excellent ray tracing and DLSS, while AMD RX 7000 series provides great value. What resolution do you want to game at?";
    }

    // Default helpful response
    const helpfulResponses = [
      "I'd be happy to help you with that! Could you tell me more about what you're looking for in your PC build?",
      "That's a great question! To give you the best recommendation, what's your budget and what will you use the PC for?",
      "I can definitely help with that! What specific aspect of PC building would you like to know more about?",
      "Let me help you with that! Are you looking to build a gaming PC, workstation, or something else?"
    ];

    return helpfulResponses[Math.floor(Math.random() * helpfulResponses.length)];
  }

  generateChatName(messages: ChatMessage[]): string {
    if (messages.length === 0) return "New Chat";
    
    // Analyze messages to create a descriptive name
    const allText = messages.map(m => m.content).join(' ').toLowerCase();
    
    if (allText.includes('gaming') && allText.includes('budget')) {
      return "Gaming PC Budget Build";
    }
    if (allText.includes('4k') || allText.includes('high-end')) {
      return "High-End 4K Gaming Build";
    }
    if (allText.includes('work') || allText.includes('productivity')) {
      return "Workstation Build Discussion";
    }
    if (allText.includes('streaming')) {
      return "Streaming PC Build";
    }
    if (allText.includes('first') || allText.includes('beginner')) {
      return "First PC Build Help";
    }
    
    // Extract budget if mentioned
    const budgetMatch = allText.match(/\$?(\d{3,5})/);
    if (budgetMatch) {
      return `$${budgetMatch[1]} PC Build`;
    }
    
    // Default based on first user message
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || '';
    const words = firstUserMessage.split(' ').slice(0, 3).join(' ');
    return words.length > 0 ? `${words}...` : "PC Build Chat";
  }
}

export type { ChatMessage, BuildSuggestion, ChatSession };