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

function getMobinFallbackReply(userText = "") {
  const q = userText.toLowerCase();

  if (q.includes("how it works") || q.includes("how does it work") || q.includes("work") || q.includes("process")) {
    return `Here is how Mob'in works:\n\n**For Students & Renters:**\n1. **Browse Listings:** Find verified dormitories, bedspaces, studios, and boarding houses near university campuses (e.g. Urgello, Sambag, Cebu City).\n2. **Direct Inquiries:** Send inquiries straight to property owners without middlemen.\n3. **Schedule Visits:** Chat with verified landlords to arrange viewing appointments.\n\n**For Landlords:**\n1. **Create Account:** Log in to your Landlord Dashboard.\n2. **Post Properties:** Upload photos, set rental rates, and pin your map location.\n3. **Get Verified:** Mob'in reviews your listing for authentic safety badges.`;
  }

  if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("plan") || q.includes("subscription")) {
    return `**Mob'in Landlord Plans:**\n- **Landlord Starter (₱299/mo):** 1 listing, verified badge, direct messaging, and standard search algorithm.\n- **Landlord Portfolio (₱599/mo):** Up to 5 listings, 2x search priority, viewing scheduler, and lead analytics.\n- **Complex Operator (₱1,299/mo):** Up to 25 listings, top algorithm rank, multi-staff access, and dedicated account specialist.\n\nRenters and students can search and browse for free!`;
  }

  if (q.includes("verify") || q.includes("verification") || q.includes("legit") || q.includes("safe")) {
    return `Mob'in protects renters and landlords through our **Verification Process**:\n- Every landlord undergoes identity and property ownership confirmation.\n- Accommodations are verified before earning the Verified Landlord badge.\n- This prevents rental scams, fake listings, and duplicate down payment fraud.`;
  }

  if (q.includes("contact") || q.includes("support") || q.includes("help") || q.includes("email")) {
    return `You can reach our team anytime at **support@mobin.ph** or visit our office in Cebu City. We usually respond within 24 hours!`;
  }

  return `Hello! I'm Mob'in AI. I can help you find student dorms, bedspaces, and apartments in Cebu City, guide you on how to list properties, or explain our landlord subscription plans. What would you like to know?`;
}

export async function sendChatMessageToCloudflareAI(messages) {
  const lastUserMessage = [...messages].reverse().find(
    (m) => m.role === "user" || (!m.role && (m.text || m.content))
  );
  const userText = lastUserMessage?.text || lastUserMessage?.content || "";

  try {
    const formattedMessages = [
      { role: "system", content: MOBIN_SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === "ai" || m.role === "assistant" ? "assistant" : "user",
        content: m.text || m.content || "",
      })),
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

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
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI server returned ${response.status}`);
    }

    const data = await response.json();

    // Cloudflare Workers AI standard response shape:
    let reply = "";
    if (data?.result?.response) {
      reply = data.result.response;
    } else if (data?.result?.choices?.[0]?.message?.content) {
      reply = data.result.choices[0].message.content;
    } else if (typeof data?.result === "string") {
      reply = data.result;
    }

    if (reply && reply.trim().length > 0) {
      return {
        success: true,
        reply: reply.trim(),
      };
    }

    return {
      success: true,
      reply: getMobinFallbackReply(userText),
    };
  } catch (error) {
    console.warn("Cloudflare AI request notice, using Mob'in Knowledge Engine fallback:", error.message);
    return {
      success: true,
      reply: getMobinFallbackReply(userText),
    };
  }
}
