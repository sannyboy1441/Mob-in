import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

function cloudflareAiPlugin(accountId, apiToken, aiModel) {
  return {
    name: 'cloudflare-ai-plugin',
    configureServer(server) {
      server.middlewares.use('/api/cloudflare-ai', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${aiModel}`;
              const cfRes = await fetch(url, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${apiToken}`,
                  'Content-Type': 'application/json',
                },
                body: body,
              });
              const data = await cfRes.json();
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = cfRes.status;
              res.end(JSON.stringify(data));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 200;
          res.end();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const accountId = env.VITE_CLOUDFLARE_ACCOUNT_ID || '';
  const apiToken = env.CLOUDFLARE_API_TOKEN || '';
  const aiModel = env.VITE_CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct';

  return {
    plugins: [react(), tailwindcss(), cloudflareAiPlugin(accountId, apiToken, aiModel)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
})
