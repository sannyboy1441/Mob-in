export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const accountId = env.CLOUDFLARE_ACCOUNT_ID || '';
    const apiToken = env.CLOUDFLARE_API_TOKEN || '';
    const model = env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';

    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await aiResponse.json();
    return new Response(JSON.stringify(data), {
      status: aiResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
