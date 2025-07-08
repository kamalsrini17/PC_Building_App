const API_HOST = "real-time-amazon-data.p.rapidapi.com";
const API_KEY = "7c520bb817msh94cdd7ed7932100p1c2805jsnb058fc416829";

export const fetchAmazonProducts = async (query: string) => {
  try {
    const response = await fetch(
      `https://${API_HOST}/search?query=${encodeURIComponent(query)}&country=US`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": API_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Amazon products:', error);
    throw error;
  }
};