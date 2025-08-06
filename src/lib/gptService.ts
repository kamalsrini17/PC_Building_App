export async function askGPT(prompt: string): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4", // You can change to "gpt-3.5-turbo" if you want it faster/cheaper
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Something went wrong.";
}
