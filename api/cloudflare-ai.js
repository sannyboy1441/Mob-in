export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Only POST is accepted." });
  }

  try {
    const accountId =
      process.env.VITE_CLOUDFLARE_ACCOUNT_ID ||
      process.env.CLOUDFLARE_ACCOUNT_ID;

    const apiToken =
      process.env.CLOUDFLARE_API_TOKEN ||
      process.env.VITE_CLOUDFLARE_API_TOKEN;

    const aiModel =
      process.env.VITE_CLOUDFLARE_AI_MODEL ||
      process.env.CLOUDFLARE_AI_MODEL ||
      "@cf/meta/llama-3.1-8b-instruct";

    if (!accountId || !apiToken) {
      return res.status(503).json({
        error: "AI credentials not configured in environment.",
      });
    }

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${aiModel}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const cfRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body || {}),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await cfRes.json().catch(() => ({}));
    return res.status(cfRes.status).json(data);
  } catch (err) {
    console.error("Vercel AI handler error:", err);
    return res.status(500).json({
      error: err.message || "Failed to process request with AI provider",
    });
  }
}
