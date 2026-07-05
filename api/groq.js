export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  // =========================
  // ONLY POST
  // =========================
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method Not Allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Message is required"
      });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        error: "Missing GROQ_API_KEY"
      });
    }

    // =========================
    // CALL GROQ
    // =========================
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

    // =========================
    // SAFE PARSE (NO CRASH)
    // =========================
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "Groq returned invalid JSON",
        raw: text
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({
        ok: false,
        error: "Empty response from Groq"
      });
    }

    // =========================
    // SUCCESS
    // =========================
    return res.status(200).json({
      ok: true,
      reply
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message || "Server error"
    });
  }
}
