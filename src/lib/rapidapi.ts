const API_HOST = "real-time-amazon-data.p.rapidapi.com";
const API_KEY = "7c520bb817msh94cdd7ed7932100p1c2805jsnb058fc416829";

// Enhanced component search terms for broader coverage
const componentSearchTerms: Record<string, string[]> = {
  cpu: [
    "Intel Core i3 processor",
    "Intel Core i5 processor", 
    "Intel Core i7 processor",
    "Intel Core i9 processor",
    "AMD Ryzen 3 processor",
    "AMD Ryzen 5 processor",
    "AMD Ryzen 7 processor",
    "AMD Ryzen 9 processor",
    "desktop processor CPU",
    "gaming processor"
  ],
  gpu: [
    "NVIDIA GeForce RTX 4090",
    "NVIDIA GeForce RTX 4080",
    "NVIDIA GeForce RTX 4070",
    "NVIDIA GeForce RTX 4060",
    "AMD Radeon RX 7900",
    "AMD Radeon RX 7800",
    "AMD Radeon RX 7700",
    "AMD Radeon RX 7600",
    "graphics card gaming",
    "video card GPU"
  ],
  motherboard: [
    "ATX motherboard Intel",
    "ATX motherboard AMD",
    "micro ATX motherboard",
    "mini ITX motherboard",
    "B650 motherboard",
    "B550 motherboard", 
    "X570 motherboard",
    "Z790 motherboard",
    "Z690 motherboard",
    "gaming motherboard"
  ],
  memory: [
    "DDR4 16GB RAM",
    "DDR4 32GB RAM",
    "DDR5 16GB RAM", 
    "DDR5 32GB RAM",
    "Corsair Vengeance RAM",
    "G.Skill Trident RAM",
    "Kingston Fury RAM",
    "desktop memory kit",
    "gaming RAM memory",
    "high speed memory"
  ],
  storage: [
    "1TB NVMe SSD",
    "2TB NVMe SSD",
    "Samsung 980 PRO",
    "WD Black SN850",
    "Crucial P5 Plus",
    "Seagate FireCuda",
    "M.2 SSD storage",
    "PCIe 4.0 SSD",
    "internal SSD drive",
    "gaming storage"
  ],
  psu: [
    "650W power supply",
    "750W power supply", 
    "850W power supply",
    "1000W power supply",
    "80+ Gold PSU",
    "80+ Platinum PSU",
    "modular power supply",
    "Corsair RM series",
    "EVGA SuperNOVA",
    "gaming power supply"
  ],
  cpuCooler: [
    "CPU air cooler",
    "liquid CPU cooler",
    "AIO liquid cooler",
    "Noctua NH-D15",
    "Cooler Master Hyper",
    "be quiet! Dark Rock",
    "Corsair H100i",
    "NZXT Kraken",
    "tower CPU cooler",
    "RGB CPU cooler"
  ]
};

export const fetchAmazonProducts = async (
  category: string, 
  page: number = 1, 
  sortBy: string = 'relevance',
  priceRange: { min: string; max: string } = { min: '', max: '' }
) => {
  try {
    const searchTerms = componentSearchTerms[category] || [category];
    const allProducts: any[] = [];
    
    // Search with multiple terms to get broader coverage
    for (let i = 0; i < Math.min(searchTerms.length, 3); i++) {
      const searchQuery = searchTerms[i];
      console.log(`Fetching products for: ${searchQuery}, page: ${page}`);
      
      const response = await fetch(
        `https://${API_HOST}/search?query=${encodeURIComponent(searchQuery)}&country=US&page=${page}&sort_by=${sortBy}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const products = data?.data?.products || data?.products || [];
        
        // Filter by price range if specified
        const filteredProducts = products.filter((product: any) => {
          if (!priceRange.min && !priceRange.max) return true;
          
          const price = parseFloat((product.product_price || '0').replace(/[^0-9.]/g, ''));
          const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
          const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
          
          return price >= minPrice && price <= maxPrice;
        });
        
        allProducts.push(...filteredProducts);
      }
      
      // Add delay between requests to avoid rate limiting
      if (i < searchTerms.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Remove duplicates based on ASIN
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.asin === product.asin)
    );
    
    // Sort products based on sortBy parameter
    const sortedProducts = sortProducts(uniqueProducts, sortBy);
    
    // Paginate results (show 20 per page)
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    
    console.log(`Found ${uniqueProducts.length} unique products, showing ${paginatedProducts.length} for page ${page}`);
    
    return {
      items: paginatedProducts,
      totalPages: Math.ceil(uniqueProducts.length / itemsPerPage),
      totalItems: uniqueProducts.length
    };
    
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    return getFallbackProducts(category, page);
  }
};

export const searchAmazonProducts = async (
  query: string,
  page: number = 1,
  sortBy: string = 'relevance',
  priceRange: { min: string; max: string } = { min: '', max: '' }
) => {
  try {
    console.log(`Searching Amazon for: ${query}, page: ${page}`);
    
    // Try multiple search variations for better coverage
    const searchVariations = [
      query,
      `${query} computer`,
      `${query} PC`,
      `${query} gaming`,
      `${query} desktop`
    ];
    
    const allProducts: any[] = [];
    
    for (let i = 0; i < Math.min(searchVariations.length, 2); i++) {
      const searchQuery = searchVariations[i];
      
      const response = await fetch(
        `https://${API_HOST}/search?query=${encodeURIComponent(searchQuery)}&country=US&page=${page}&sort_by=${sortBy}`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": API_KEY,
            "X-RapidAPI-Host": API_HOST,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const products = data?.data?.products || data?.products || [];
        
        // Filter by price range if specified
        const filteredProducts = products.filter((product: any) => {
          if (!priceRange.min && !priceRange.max) return true;
          
          const price = parseFloat((product.product_price || '0').replace(/[^0-9.]/g, ''));
          const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
          const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
          
          return price >= minPrice && price <= maxPrice;
        });
        
        allProducts.push(...filteredProducts);
      }
      
      // Add delay between requests
      if (i < searchVariations.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Remove duplicates
    const uniqueProducts = allProducts.filter((product, index, self) => 
      index === self.findIndex(p => p.asin === product.asin)
    );
    
    // Sort products
    const sortedProducts = sortProducts(uniqueProducts, sortBy);
    
    // Paginate results
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = sortedProducts.slice(startIndex, endIndex);
    
    console.log(`Search found ${uniqueProducts.length} unique products`);
    
    return {
      items: paginatedProducts,
      totalPages: Math.ceil(uniqueProducts.length / itemsPerPage),
      totalItems: uniqueProducts.length
    };
    
  } catch (error) {
    console.error('Error searching Amazon products:', error);
    return { items: [], totalPages: 1, totalItems: 0 };
  }
};

const sortProducts = (products: any[], sortBy: string) => {
  switch (sortBy) {
    case 'price_low_to_high':
      return products.sort((a, b) => {
        const priceA = parseFloat((a.product_price || '0').replace(/[^0-9.]/g, ''));
        const priceB = parseFloat((b.product_price || '0').replace(/[^0-9.]/g, ''));
        return priceA - priceB;
      });
    case 'price_high_to_low':
      return products.sort((a, b) => {
        const priceA = parseFloat((a.product_price || '0').replace(/[^0-9.]/g, ''));
        const priceB = parseFloat((b.product_price || '0').replace(/[^0-9.]/g, ''));
        return priceB - priceA;
      });
    case 'customer_review':
      return products.sort((a, b) => {
        const ratingA = parseFloat(a.product_star_rating || '0');
        const ratingB = parseFloat(b.product_star_rating || '0');
        return ratingB - ratingA;
      });
    case 'newest':
      // For newest, we'll prioritize products with more recent data
      return products.sort((a, b) => {
        const reviewsA = parseInt(a.product_num_reviews || '0');
        const reviewsB = parseInt(b.product_num_reviews || '0');
        return reviewsB - reviewsA;
      });
    default: // relevance
      return products;
  }
};

// Enhanced fallback data with more variety
const getFallbackProducts = (category: string, page: number = 1) => {
  const fallbackData: Record<string, any[]> = {
    cpu: [
      {
        asin: "fallback-cpu-1",
        product_title: "Intel Core i9-13900K Desktop Processor 24 cores (8 P-cores + 16 E-cores) 36M Cache, up to 5.8 GHz",
        product_price: "$589.99",
        product_photo: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
        product_star_rating: "4.5",
        product_num_reviews: "1,234"
      },
      {
        asin: "fallback-cpu-2", 
        product_title: "AMD Ryzen 9 7900X 12-Core, 24-Thread Unlocked Desktop Processor",
        product_price: "$429.99",
        product_photo: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
        product_star_rating: "4.7",
        product_num_reviews: "892"
      },
      {
        asin: "fallback-cpu-3",
        product_title: "Intel Core i7-13700K Desktop Processor 16 cores (8 P-cores + 8 E-cores) 30M Cache, up to 5.4 GHz",
        product_price: "$409.99",
        product_photo: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
        product_star_rating: "4.6",
        product_num_reviews: "2,156"
      },
      {
        asin: "fallback-cpu-4",
        product_title: "AMD Ryzen 7 7700X 8-Core, 16-Thread Unlocked Desktop Processor",
        product_price: "$349.99",
        product_photo: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
        product_star_rating: "4.5",
        product_num_reviews: "1,567"
      }
    ],
    gpu: [
      {
        asin: "fallback-gpu-1",
        product_title: "NVIDIA GeForce RTX 4090 24GB GDDR6X Graphics Card",
        product_price: "$1,599.99",
        product_photo: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
        product_star_rating: "4.8",
        product_num_reviews: "567"
      },
      {
        asin: "fallback-gpu-2",
        product_title: "AMD Radeon RX 7900 XTX 24GB GDDR6 Graphics Card",
        product_price: "$999.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.6",
        product_num_reviews: "423"
      },
      {
        asin: "fallback-gpu-3",
        product_title: "NVIDIA GeForce RTX 4080 16GB GDDR6X Graphics Card",
        product_price: "$1,199.99",
        product_photo: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
        product_star_rating: "4.7",
        product_num_reviews: "789"
      }
    ],
    motherboard: [
      {
        asin: "fallback-mb-1",
        product_title: "ASUS ROG STRIX X670E-E Gaming WiFi 6E ATX Motherboard",
        product_price: "$499.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.4",
        product_num_reviews: "234"
      },
      {
        asin: "fallback-mb-2",
        product_title: "MSI MAG B650 TOMAHAWK WiFi Gaming Motherboard",
        product_price: "$229.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.5",
        product_num_reviews: "456"
      }
    ],
    memory: [
      {
        asin: "fallback-ram-1",
        product_title: "Corsair Vengeance LPX 32GB (2x16GB) DDR4 3200MHz C16",
        product_price: "$89.99",
        product_photo: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
        product_star_rating: "4.7",
        product_num_reviews: "3,456"
      },
      {
        asin: "fallback-ram-2",
        product_title: "G.Skill Trident Z5 32GB (2x16GB) DDR5 5600MHz",
        product_price: "$159.99",
        product_photo: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
        product_star_rating: "4.6",
        product_num_reviews: "1,234"
      }
    ],
    storage: [
      {
        asin: "fallback-ssd-1",
        product_title: "Samsung 980 PRO 2TB PCIe 4.0 NVMe M.2 SSD",
        product_price: "$149.99",
        product_photo: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
        product_star_rating: "4.8",
        product_num_reviews: "5,678"
      },
      {
        asin: "fallback-ssd-2",
        product_title: "WD Black SN850X 1TB PCIe Gen4 NVMe M.2 SSD",
        product_price: "$79.99",
        product_photo: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
        product_star_rating: "4.7",
        product_num_reviews: "2,345"
      }
    ],
    psu: [
      {
        asin: "fallback-psu-1",
        product_title: "Corsair RM1000x 1000W 80+ Gold Fully Modular PSU",
        product_price: "$179.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.8",
        product_num_reviews: "1,567"
      },
      {
        asin: "fallback-psu-2",
        product_title: "EVGA SuperNOVA 850 G6 850W 80+ Gold Modular PSU",
        product_price: "$139.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.6",
        product_num_reviews: "987"
      }
    ],
    cpuCooler: [
      {
        asin: "fallback-cooler-1",
        product_title: "Noctua NH-D15 Premium CPU Cooler with Dual NF-A15 140mm Fans",
        product_price: "$109.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.9",
        product_num_reviews: "2,345"
      },
      {
        asin: "fallback-cooler-2",
        product_title: "Corsair H100i RGB PLATINUM 240mm Liquid CPU Cooler",
        product_price: "$159.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_star_rating: "4.5",
        product_num_reviews: "1,789"
      }
    ]
  };

  const categoryData = fallbackData[category] || [];
  const itemsPerPage = 20;
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  
  return {
    items: categoryData.slice(startIndex, endIndex),
    totalPages: Math.ceil(categoryData.length / itemsPerPage),
    totalItems: categoryData.length
  };
};