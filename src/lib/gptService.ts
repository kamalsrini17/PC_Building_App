export async function askGPT(prompt: string): Promise<string> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    console.log("[GPT Raw Response]", data);

    if (!response.ok) {
      console.error("[OpenAI Error]", data);
      throw new Error(data?.error?.message || "GPT request failed");
    }

    return data.choices?.[0]?.message?.content || "No reply from GPT.";
  } catch (err: any) {
    console.error("[GPT Exception]", err);
    throw new Error("Error talking to ChatGPT");
  }
}
