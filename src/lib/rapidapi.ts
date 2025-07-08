const API_HOST = "real-time-amazon-data.p.rapidapi.com";
const API_KEY = "7c520bb817msh94cdd7ed7932100p1c2805jsnb058fc416829";

// Map component categories to better search terms
const componentSearchTerms: Record<string, string> = {
  cpu: "Intel AMD processor CPU desktop",
  gpu: "NVIDIA RTX graphics card GPU",
  motherboard: "motherboard ATX micro ITX",
  memory: "DDR4 DDR5 RAM memory desktop",
  storage: "SSD NVMe hard drive storage",
  psu: "power supply PSU 80+ modular",
  cpuCooler: "CPU cooler fan liquid cooling"
};

export const fetchAmazonProducts = async (category: string) => {
  try {
    // Use better search terms for PC components
    const searchQuery = componentSearchTerms[category] || category;
    
    console.log(`Fetching products for category: ${category}, query: ${searchQuery}`);
    
    const response = await fetch(
      `https://${API_HOST}/search?query=${encodeURIComponent(searchQuery)}&country=US&page=1`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST,
        },
      }
    );

    console.log(`API Response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data);
    
    // Check if we have products in the response
    if (data && data.data && data.data.products) {
      console.log(`Found ${data.data.products.length} products`);
      return data.data.products;
    } else if (data && data.products) {
      console.log(`Found ${data.products.length} products`);
      return data.products;
    } else {
      console.log('No products found in response, using fallback data');
      return getFallbackProducts(category);
    }
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    // Return fallback data instead of empty array
    return getFallbackProducts(category);
  }
};

// Fallback data for when API fails
const getFallbackProducts = (category: string) => {
  const fallbackData: Record<string, any[]> = {
    cpu: [
      {
        asin: "fallback-cpu-1",
        product_title: "Intel Core i7-13700K Desktop Processor",
        product_price: "$409.99",
        product_photo: "https://images.unsplash.com/photo-1555617981-dac3880eac6e?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "1.5 x 1.5 x 0.1 inches" }
      },
      {
        asin: "fallback-cpu-2",
        product_title: "AMD Ryzen 7 7700X Desktop Processor",
        product_price: "$349.99",
        product_photo: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "1.5 x 1.5 x 0.1 inches" }
      }
    ],
    gpu: [
      {
        asin: "fallback-gpu-1",
        product_title: "NVIDIA GeForce RTX 4070 Graphics Card",
        product_price: "$599.99",
        product_photo: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "12 x 5.4 x 2.2 inches" }
      },
      {
        asin: "fallback-gpu-2",
        product_title: "AMD Radeon RX 7800 XT Graphics Card",
        product_price: "$499.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "11.2 x 5.1 x 2.1 inches" }
      }
    ],
    motherboard: [
      {
        asin: "fallback-mb-1",
        product_title: "ASUS ROG STRIX B650-A Gaming WiFi Motherboard",
        product_price: "$229.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "12 x 9.6 x 2.4 inches" }
      }
    ],
    memory: [
      {
        asin: "fallback-ram-1",
        product_title: "Corsair Vengeance LPX 32GB DDR4 3200MHz",
        product_price: "$89.99",
        product_photo: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "5.3 x 0.3 x 1.4 inches" }
      }
    ],
    storage: [
      {
        asin: "fallback-ssd-1",
        product_title: "Samsung 980 PRO 1TB NVMe SSD",
        product_price: "$79.99",
        product_photo: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "3.1 x 0.9 x 0.1 inches" }
      }
    ],
    psu: [
      {
        asin: "fallback-psu-1",
        product_title: "Corsair RM850x 850W 80+ Gold PSU",
        product_price: "$139.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "6.3 x 5.9 x 3.4 inches" }
      }
    ],
    cpuCooler: [
      {
        asin: "fallback-cooler-1",
        product_title: "Noctua NH-D15 CPU Cooler",
        product_price: "$109.99",
        product_photo: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400&h=400&fit=crop",
        product_information: { "Product Dimensions": "6.5 x 5.9 x 6.5 inches" }
      }
    ]
  };

  return fallbackData[category] || [];
};