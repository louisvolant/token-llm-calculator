# Token LLM Calculator

![Calculator Icon](public/icon_calculator.png)

An intuitive online tool to estimate token counts for Large Language Models (LLMs) from popular providers like OpenAI and Hugging Face, and to perform code minification.

## ✨ Features

* **LLM Token Estimation:**
    * Calculate token counts for **OpenAI** models (using `cl100k_base` encoding via `js-tiktoken`, compatible with GPT-3.5 Turbo, GPT-4, GPT-4o, etc.).
    * Calculate token counts for **Hugging Face** models (e.g., Llama, Mistral) by leveraging `@huggingface/tokenizers`.
* **Code Minification:**
    * **Remove spaces:** Instantly minify code by eliminating all whitespace and comments.
    * **Rewrite names:** Advanced minification using Terser (JS) or Sucrase + Terser (TS/TSX).
    * **CSS minification:** with `clean-css`.
* **Theming:** Seamless Dark/Light mode toggle, with preference persisted in local storage.
* **Installable PWA:** Service worker with offline navigation fallback, update-only reloads, and background revalidation that survives page unloads.
* **Lightweight Footer:** a single compact line with the copyright, the Personal Page / Portfolio links and the theme toggle.
* **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
* **Edge & Serverless Ready:** Runs entirely on Cloudflare Workers via OpenNext.

## Technologies Used

* **Next.js 16** (App Router — UI + API Route Handlers)
* **@opennextjs/cloudflare** (Next.js adapter for Cloudflare Workers)
* **Cloudflare Workers & Wrangler 4** (Edge runtime & deployment CLI)
* **React 19** (UI Library)
* **TypeScript 6**
* **Tailwind CSS** (Utility-first CSS Framework)
* **`js-tiktoken`**: Pure JavaScript port of OpenAI's `tiktoken` for accurate and portable token calculation.
* **`@huggingface/tokenizers`**: Lightweight tokenizer library for Hugging Face models (e.g., Llama, Mistral).
* **`sucrase` + `terser`**: Pure JavaScript TypeScript transpilation and AST minification.
* **`clean-css`**: CSS minification.
* **`winston`**: Structured JSON logging routed to Cloudflare Workers console and Logpush.

## Architecture

Full-stack Next.js app running on Cloudflare Workers: the UI and the `/api/*` endpoints live in the same codebase and are bundled by OpenNext.

```
src/app/          React pages + layouts
src/app/api/       API Route Handlers (tokenize + minify)
src/components/    React components
src/context/       React context providers (theme, language)
src/services/      Client-side API calls
src/lib/           Shared server utils (logger, minify helpers)
wrangler.jsonc     Cloudflare Workers configuration
open-next.config.ts OpenNext build configuration
```

## Getting Started

### Prerequisites

* Node.js 24+
* npm (comes with Node.js)
* Cloudflare account (for deployment)

### Installation

```bash
git clone https://github.com/louisvolant/token-llm-calculator.git
cd token-llm-calculator
npm install
cp .env.example .env.local
```

### Running the Project Locally

#### Next.js Development Server:
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

#### Cloudflare Workers Local Preview:
To test the production build in the local Cloudflare Workers environment (`workerd`):
```bash
npm run preview
```
The preview will be available at `http://localhost:8787`.

#### Unit Tests:
```bash
npm test
```
Runs the route-handler helper tests with the built-in Node.js test runner.

## API Endpoints

Each endpoint is served by a Next.js Route Handler under `src/app/api/`.

* **`POST /api/tokenize/openai`**
    * Calculates the token count using OpenAI's encoding via `js-tiktoken`.
    * Request Body: `{ "text": "Your input text here.", "model": "cl100k_base" }` (`model` optional)
    * `model` accepts an encoding name (`cl100k_base`, `o200k_base`, ...) or a model id (`gpt-4o`, `gpt-3.5-turbo`, ...). Unknown values fall back to `cl100k_base`.
    * Response: `{ "tokenCount": 123 }`

* **`POST /api/tokenize/hf`**
    * Calculates the token count using a Hugging Face tokenizer.
    * Request Body: `{ "text": "Your input text here.", "modelName": "Xenova/llama-tokenizer" }`
    * Response: `{ "tokenCount": 456 }`
    * `modelName` must be an `organization/model` id. The first call for a model downloads its definition (15-second timeout), and concurrent calls share a single download.
    * Returns `502` when the tokenizer cannot be downloaded and `504` when Hugging Face does not answer in time.

* **`POST /api/minify/remove-spaces-and-comments`**
    * Request Body: `{ "code": "function   hello ( ) { return  'world' ; }" }`
    * Response: `{ "minifiedCode": "function hello ( ) { return 'world' ; }" }`

* **`POST /api/minify/rewrite-javascript`**
    * Minifies with Terser (plain JS) or Sucrase + Terser (TS/TSX).
    * Request Body: `{ "code": "function add(a,b){return a+b;}" }`
    * Response: `{ "minifiedCode": "function n(n,r){return n+r}" }`

* **`POST /api/minify/css`**
    * Request Body: `{ "code": "body { color: red; }" }`
    * Response: `{ "minifiedCode": "body{color:red}" }`

* **`POST /api/minify/typescript`**
    * Transpiles and minifies TS/TSX using Sucrase + Terser.
    * Request Body: `{ "code": "interface Foo { bar: string } const x: Foo = {bar: 'hi'}" }`
    * Response: `{ "minifiedCode": "const x={bar:\"hi\"};" }`

### Error Handling and Limits

All endpoints return JSON errors and validate their input:

* `400` for an empty or invalid JSON body, a missing/non-string field, or an unsupported value.
* `413` when the JSON body exceeds 4 MB, `text` exceeds 500,000 characters, or `code` exceeds 200,000 characters.
* `500` for unexpected server errors. The response includes a `details` field.

Request bodies are parsed through a shared helper that catches malformed or aborted uploads, so they return a `4xx` response instead of crashing the Worker with an `Uncaught Exception (1101)`. The web UI displays the API `error` and `details` fields instead of a generic HTTP status.

## Deployment (Cloudflare Workers)

The application is migrated from Vercel to **Cloudflare Workers** using [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare).

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Deploy to Cloudflare Workers

```bash
npm run deploy
```

This runs `opennextjs-cloudflare build` to create the worker bundle and then deploys it directly to your Cloudflare account.

### Configuration Highlights

* **Preserve Dashboard Variables (`keep_vars = true`)**:
  In `wrangler.jsonc`, `"keep_vars": true` is set. When deploying via Wrangler, any environment variables or secrets set manually through the Cloudflare Dashboard are retained and not overwritten.
* **Pure JavaScript Runtime Compatibility**:
  Cloudflare Workers runs on the V8 engine (`workerd`) without access to Node.js native `.node` binary addons or local filesystem writes. The app has been optimized:
  * Replaced native `@swc/core` with `sucrase` + `terser` (100% pure JS transpilation and minification).
  * Replaced `@dqbd/tiktoken` (which depended on `fs.readFileSync` for wasm) with `js-tiktoken` (pure JS, zero wasm, zero fs).
  * Logging uses Winston console transport, integrating seamlessly with Cloudflare Workers Observability and Logpush.
* **Static Asset Caching**:
  Static assets are uploaded to Cloudflare Workers Assets and cached with immutable cache headers via `public/_headers`.

## Customization

* **Hugging Face Model:** change the `hfModelName` constant in `src/app/page.tsx` to use another tokenizer.
* **Localization:** expand the `t` function in `src/context/LanguageContext.tsx`.
* **Metadata:** update the `metadata` object in `src/app/layout.tsx` (domain, social shares, etc.).
* **Footer Links:** configure the Personal Page / Portfolio links in `src/lib/links.ts` (kept short so the footer stays on a single line).

## License

MIT