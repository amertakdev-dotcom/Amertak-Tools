
export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  // ===============================
  // TEST MODE (GET allowed)
  // ===============================
  if (req.method === "GET") {
    return res.status(200).json({
      status: "OK",
      message: "Groq API working. Use POST."
    });
  }

  // ===============================
  // ONLY POST ALLOWED
  // ===============================
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed",
      allowed: ["GET", "POST"]
    });
  }

  try {
    const { message } = req.body || {};

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
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data?.choices?.[0]?.message?.content || "No response"
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
