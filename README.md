# Token LLM Calculator

![Calculator Icon](public/icon_calculator.png)

An intuitive online tool to estimate token counts for Large Language Models (LLMs) from popular providers like OpenAI and Hugging Face, and to perform code minification.

## ✨ Features

* **LLM Token Estimation:**
    * Calculate token counts for **OpenAI** models (using `cl100k_base` encoding, compatible with GPT-3.5 Turbo, GPT-4, etc.).
    * Calculate token counts for **Hugging Face** models (e.g., Llama, Mistral) by leveraging `@huggingface/transformers`.
* **Code Minification:**
    * **Remove spaces:** Instantly minify code by eliminating all whitespace and comments.
    * **Rewrite names:** Advanced minification using Terser (JS) or SWC (TS/TSX).
    * **CSS minification:** with `clean-css`.
* **Theming:** Seamless Dark/Light mode toggle, with preference persisted in local storage.
* **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
* **Single app:** UI and API are served by a single Next.js server.

## Technologies Used

* **Next.js 16** (App Router — UI + API Route Handlers)
* **React 19** (UI Library)
* **TypeScript 6**
* **Tailwind CSS** (Utility-first CSS Framework)
* **`@dqbd/tiktoken`**: JavaScript port of OpenAI's `tiktoken` for accurate token calculation.
* **`@huggingface/transformers`**: For loading and using Hugging Face tokenizers.
* **`terser` / `@swc/core`**: JavaScript/TypeScript minification.
* **`clean-css`**: CSS minification.

## Architecture

Full-stack Next.js app: the UI and the `/api/*` endpoints live in the same codebase and are served by one server.

```
src/app/          React pages + layouts
src/app/api/       API Route Handlers (tokenize + minify)
src/components/    React components
src/context/       React context providers (theme, language)
src/services/      Client-side API calls
src/lib/           Shared server utils (logger, minify helpers)
```

## Getting Started

### Prerequisites

* Node.js 24+
* npm (comes with Node.js)

### Installation

```bash
git clone https://github.com/louisvolant/token-llm-calculator.git
cd token-llm-calculator
npm install
cp .env.example .env.local
```

### Running the project

```bash
npm run dev
```

The app is then available at `http://localhost:3000` — UI and API endpoints included.

## API Endpoints

Each endpoint is served by a Next.js Route Handler under `src/app/api/`.

* **`POST /api/tokenize/openai`**
    * Calculates the token count using OpenAI's `tiktoken` encoding.
    * Request Body: `{ "text": "Your input text here.", "model": "cl100k_base" }` (`model` optional)
    * Response: `{ "tokenCount": 123 }`

* **`POST /api/tokenize/hf`**
    * Calculates the token count using a Hugging Face tokenizer.
    * Request Body: `{ "text": "Your input text here.", "modelName": "Xenova/llama-tokenizer" }`
    * Response: `{ "tokenCount": 456 }`
    * Note: the first call to a new `modelName` downloads the tokenizer (can be slow).

* **`POST /api/minify/remove-spaces-and-comments`**
    * Request Body: `{ "code": "function   hello ( ) { return  'world' ; }" }`
    * Response: `{ "minifiedCode": "function hello ( ) { return 'world' ; }" }`

* **`POST /api/minify/rewrite-javascript`**
    * Minifies with Terser (JS) or SWC (TS/TSX).
    * Request Body: `{ "code": "function add(a,b){return a+b;}" }`
    * Response: `{ "minifiedCode": "function n(n,r){return n+r}n(1,2);" }`

* **`POST /api/minify/css`**
    * Request Body: `{ "code": "body { color: red; }" }`
    * Response: `{ "minifiedCode": "body{color:red}" }`

* **`POST /api/minify/typescript`**
    * Minifies TS/TSX explicitly with SWC.
    * Request Body: `{ "code": "interface Foo { bar: string } const x: Foo = {bar: 'hi'}" }`
    * Response: `{ "minifiedCode": "var x={bar:\"hi\"};" }`

## Deployment (Vercel)

The application is deployed on Vercel as a full-stack Next.js project.

### Serverless Function Size Optimization (`/api/tokenize/hf`)
Vercel enforces a maximum uncompressed Serverless Function bundle size limit of **250 MB**. Using `@huggingface/transformers` can easily exceed this limit (~361 MB) because of `onnxruntime-web` (~130 MB WASM) and `onnxruntime-node` multi-platform binaries (~210 MB).

The following configuration in `next.config.js` keeps the bundle size well within limits:
1. **`serverExternalPackages`**: Only `@huggingface/transformers` is retained. `onnxruntime-node` and `onnxruntime-web` are excluded from `serverExternalPackages` so Vercel does not blindly copy their entire `node_modules` folders.
2. **`outputFileTracingIncludes`**: Retains only the single native binary required by Vercel's runtime environment (`linux/x64`, ~34 MB).
3. **`outputFileTracingExcludes`**: Excludes unused `onnxruntime-web` WASM files and platform binaries for Windows, macOS, and Linux ARM64.
4. **Result**: Total uncompressed function size drops from **361.19 MB down to ~60 MB**, safely below the 250 MB limit while maintaining fast build times and lower cold start latency.

## Customization

* **Hugging Face Model:** change the `hfModelName` constant in `src/app/page.tsx` to use another tokenizer.
* **Localization:** expand the `t` function in `src/context/LanguageContext.tsx`.
* **Metadata:** update the `metadata` object in `src/app/layout.tsx` (domain, social shares, etc.).

## License

MIT