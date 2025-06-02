# Token LLM Calculator

![Calculator Icon](frontend/public/icon_calculator.png)

An intuitive online tool to estimate token counts for Large Language Models (LLMs) from popular providers like OpenAI and Hugging Face, and to perform basic code minification. This application is built with a decoupled frontend and backend architecture, providing a secure and scalable solution for handling sensitive tokenization logic.

## ✨ Features

* **LLM Token Estimation:**
    * Calculate token counts for **OpenAI** models (using `cl100k_base` encoding, compatible with GPT-3.5 Turbo, GPT-4, etc.).
    * Calculate token counts for **Hugging Face** models (e.g., Llama, Mistral) by leveraging `@xenova/transformers` on the backend.
* **Code Minification:**
    * **Remove spaces:** Instantly minify code by eliminating all whitespace.
    * **Rewrite names (placeholder):** A placeholder for more advanced minification techniques (e.g., renaming variables/methods) which would require a dedicated parser on the backend.
* **Theming:** Seamless Dark/Light mode toggle, with preference persisted in local storage.
* **Responsive Design:** Optimized for various screen sizes using Tailwind CSS.
* **Modern UI:** Clean and user-friendly interface.
* **Decoupled Architecture:** Secure and efficient processing with dedicated frontend and backend services.
* **Extensible:** Built with modularity in mind, making it easy to add new tokenizers or minification methods.

## 🚀 Technologies Used

This project is split into two main parts:

### Frontend

* **Next.js 15+** (React Framework)
* **React 18+** (UI Library)
* **TypeScript** (Typed JavaScript)
* **Tailwind CSS** (Utility-first CSS Framework)
* **Custom Theme Provider:** For managing dark/light mode with local storage persistence.
* **Next/Image:** For optimized image handling (logo, favicon).

### Backend

* **Node.js** (Runtime Environment)
* **Express** (Web Framework for Node.js)
* **TypeScript** (Typed JavaScript)
* **`@dqbd/tiktoken`**: JavaScript port of OpenAI's `tiktoken` for accurate token calculation.
* **`@xenova/transformers`**: For loading and using Hugging Face tokenizers directly in Node.js.
* **`cors`**: Middleware for Cross-Origin Resource Sharing.
* **`dotenv`**: For managing environment variables.

## 💡 Architecture Overview

The application follows a client-server architecture:

* **Frontend (Next.js):** Handles the user interface, input, and displays results. It makes API requests to the backend for all tokenization and minification operations. This keeps sensitive API keys (if any were used for external LLM APIs directly) out of the client-side code and offloads heavy processing.
* **Backend (Node.js/Express):** Provides RESTful API endpoints. It receives requests from the frontend, performs the actual tokenization or minification using the appropriate libraries, and returns the results.

## 📦 Getting Started

To get the project up and running on your local machine, follow these steps:

### Prerequisites

* Node.js (LTS version recommended, e.g., v18 or v20)
* npm (comes with Node.js)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/token-llm-calculator.git](https://github.com/your-username/token-llm-calculator.git)
    cd token-llm-calculator
    ```

2.  **Install Backend Dependencies:**
    ```bash
    cd backend
    npm install
    ```

3.  **Create Backend Environment File:**
    Create a `.env` file in the `backend` directory:
    ```
    PORT=5000
    ```

4.  **Install Frontend Dependencies:**
    ```bash
    cd ../frontend
    npm install
    ```

5.  **Create Frontend Environment File:**
    Create a `.env.local` file in the `frontend` directory:
    ```
    NEXT_PUBLIC_API_URL=http://localhost:3001
    ```

### Running the Project

1.  **Start the Backend Server:**
    Open a terminal, navigate to the `backend` directory, and run:
    ```bash
    cd backend
    npm run dev
    ```
    The backend server will start on `http://localhost:5000` (or your configured `PORT`).

2.  **Start the Frontend Development Server:**
    Open a **new** terminal, navigate to the `frontend` directory, and run:
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend application will typically be accessible at `http://localhost:3000`.

Your Token LLM Calculator should now be fully operational in your browser!

## 🌐 API Endpoints (Backend)

The Node.js backend exposes the following API endpoints:

* **`POST /api/tokenize/openai`**
    * **Description:** Calculates the token count for a given text using OpenAI's `tiktoken` encoding.
    * **Request Body (JSON):**
        ```json
        {
          "text": "Your input text or prompt here.",
          "model": "cl100k_base" // Optional, default is 'cl100k_base'
        }
        ```
    * **Response (JSON):**
        ```json
        {
          "tokenCount": 123
        }
        ```

* **`POST /api/tokenize/hf`**
    * **Description:** Calculates the token count for a given text using a specified Hugging Face tokenizer. The backend will download the tokenizer model if not cached.
    * **Request Body (JSON):**
        ```json
        {
          "text": "Your input text or prompt here.",
          "modelName": "Xenova/llama-tokenizer" // e.g., 'Xenova/mistral-7b-v0.1', 'Xenova/bert-base-uncased'
        }
        ```
    * **Response (JSON):**
        ```json
        {
          "tokenCount": 456
        }
        ```
    * **Note:** The first call to a new `modelName` can be slow as the tokenizer model needs to be downloaded.

* **`POST /api/minify/remove-spaces-and-comments`**
    * **Description:** Minifies the provided code by removing all whitespace characters.
    * **Request Body (JSON):**
        ```json
        {
          "code": "function   hello ( ) { return  'world' ; }"
        }
        ```
    * **Response (JSON):**
        ```json
        {
          "minifiedCode": "functionhello(){return'world';}"
        }
        ```

* **`POST /api/minify/rewrite-javascript`**
    * **Description:** Placeholder endpoint for advanced code minification (e.g., rewriting variable/method names). **Currently returns a placeholder message.**
    * **Request Body (JSON):**
        ```json
        {
          "code": "var longVariableName = 10;"
        }
        ```
    * **Response (JSON):**
        ```json
        {
          "minifiedCode": "/* Minification by renaming is complex. Requires a dedicated parser/minifier. */\nvar longVariableName = 10;"
        }
        ```

## ⚙️ Customization

* **Hugging Face Model:** To change the Hugging Face model used for tokenization, modify the `hfModelName` constant in `frontend/src/app/page.tsx` and ensure the backend can load the specified model.
* **Localization:** The `frontend/src/context/LanguageContext.tsx` is set up as a placeholder. You can expand the `t` function to include more translated strings or integrate a full i18n library.
* **Minification Logic:** The `minifyCodeRewriteJavascript` endpoint on the backend (`backend/src/index.ts`) is a placeholder. To implement actual code rewriting (e.g., variable renaming), you would need to integrate a JavaScript parsing/minification library (like `UglifyJS`, `Terser`, or `SWC`) into your Node.js backend. This is a significantly more complex task than simple string manipulation.
* **Metadata:** Update the `metadata` object in `frontend/src/app/layout.tsx` to reflect your actual domain, Twitter handle, and any custom images for social sharing (Open Graph, Twitter Card).

## 🛣️ Future Enhancements

* Implement robust variable/method renaming for code minification using a dedicated parser on the backend.
* Add support for more specific LLM encodings or custom tokenization rules.
* User interface enhancements (e.g., code highlighting in input/output areas).
* Add more detailed cost estimation based on token count for various LLM providers.
* Implement a caching layer for Hugging Face tokenizers on the backend to reduce download times after initial load.

## 🤝 Contributing

Contributions are welcome! If you have suggestions, bug reports, or want to contribute code, please feel free to open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details (if you have one, otherwise remove this section).