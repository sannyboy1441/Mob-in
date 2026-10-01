/**
 * Cloudflare Workers AI Service for Mob'in
 * Uses @cf/meta/llama-3.1-8b-instruct
 */

const MOBIN_SYSTEM_PROMPT = `You are Mob'in AI, the official intelligent assistant for Mob'in (Mob'in Rental Platform).
Mob'in is a trusted student and worker accommodation platform in the Philippines connecting renters with verified landlords.

Your role:
1. Help students and workers find suitable accommodations (Boarding Houses, Bedspaces, Dormitories, Apartments, Studios).
2. Answer questions about how the platform works, booking inquiries, chat messaging with landlords, and property verification.
3. Guide landlords on how to list properties, pass admin verification, and choose subscription pricing plans.
4. Explain verification safety: Mob'in manually reviews and verifies landlord ownership and property photos before listings go live to prevent scams.
5. Provide concise, friendly, and practical advice. You can speak English and naturally understand Tagalog or Taglish if the user asks in Filipino.

Tone: Warm, welcoming, helpful, professional, and trustworthy. Keep answers concise, clear, and formatted with bullet points when listing steps or recommendations.`;

export async function sendChatMessageToCloudflareAI(messages) {
  try {
    const formattedMessages = [
      { role: "system", content: MOBIN_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "ai" || m.role === "assistant" ? "assistant" : "user",
        content: m.text || m.content || "",
      })),
    ];

    const response = await fetch("/api/cloudflare-ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: formattedMessages,
        max_tokens: 512,
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `AI server returned ${response.status}`);
    }

    const data = await response.json();

    // Cloudflare Workers AI standard response shape:
    // { result: { response: "text" } } or { result: { choices: [{ message: { content: "text" } }] } }
    let reply = "";
    if (data?.result?.response) {
      reply = data.result.response;
    } else if (data?.result?.choices?.[0]?.message?.content) {
      reply = data.result.choices[0].message.content;
    } else if (typeof data?.result === "string") {
      reply = data.result;
    } else {
      reply = "Hello! I am Mob'in AI. How can I assist you with your rental search or property listing today?";
    }

    return {
      success: true,
      reply: reply.trim(),
    };
  } catch (error) {
    console.warn("Cloudflare AI request notice:", error.message);
    return {
      success: false,
      error: error.message,
      reply: "I am having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the issue persists.",
    };
  }
}
