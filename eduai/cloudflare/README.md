# Cloudflare Deployment

This repo is now ready for Cloudflare Pages for the React frontend.

## What Cloudflare Runs

Cloudflare Pages should serve:

- Vite React client from `eduai/client/dist`
- SPA fallback from `eduai/client/public/_redirects`

The current Express/Ollama API does **not** run on Cloudflare Pages as-is. Keep the API on a Node host for now, then point the Pages frontend to it with `VITE_API_BASE_URL`.

## Pages Settings

Create a Cloudflare Pages project connected to:

```text
https://github.com/aaryan1107/prometheus-eduai
```

Use:

```text
Build command: npm --prefix eduai/client install && npm --prefix eduai/client run build
Build output directory: eduai/client/dist
Root directory: /
```

Set this Pages environment variable:

```text
VITE_API_BASE_URL=https://your-api-domain.example.com
```

For local development, leave `VITE_API_BASE_URL` blank. Vite proxies `/api` to `http://localhost:4000`.

## Backend CORS

On the Node API host, set:

```text
CLIENT_ORIGIN=https://prometheus-eduai.pages.dev,https://your-custom-domain.example.com
```

Multiple origins are comma-separated.

## Later Production Options

Best final architecture:

- Cloudflare Pages: React frontend
- Supabase/Postgres: persistent app data
- Supabase/R2: uploaded PDFs and images
- Node host or Cloudflare Workers rewrite: API

Promi's current local Ollama integration needs a machine that can run Ollama. Cloudflare Workers cannot directly run local Ollama, so either host the API on a machine/server with Ollama or later swap Promi to Workers AI/OpenAI-compatible inference.
