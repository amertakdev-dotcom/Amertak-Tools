export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Missing API key" });
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "llama-3.1-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are a helpful AI assistant."
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content || "No response from AI";

    res.status(200).json({
      reply,
      model: "llama-3.1-70b-versatile"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
