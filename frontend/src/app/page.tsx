// frontend/src/app/page.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image"; // Import Next.js Image component

import { calculateOpenAITokens, calculateHFTokens } from "@/services/tokenizationService";

const Home = () => {
  const [inputText, setInputText] = useState("");
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [minifiedCode, setMinifiedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generic handler for API calls
  const handleApiCall = useCallback(async (apiFunction: (...args: any[]) => Promise<any>, ...args: any[]) => {
    setLoading(true);
    setError(null);
    setTokenCount(null); // Clear previous results
    setMinifiedCode(""); // Clear previous results

    try {
      const data = await apiFunction(...args);
      // Determine what to set based on the function called
      if (data && typeof data.tokenCount === 'number') {
        setTokenCount(data.tokenCount);
      } else if (data && typeof data.minifiedCode === 'string') {
        setMinifiedCode(data.minifiedCode);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("API call error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onCalculateOpenAITokens = useCallback(() => {
    if (!inputText) {
      setError("Please enter text to calculate tokens.");
      return;
    }
    handleApiCall(calculateOpenAITokens, inputText, "cl100k_base");
  }, [inputText, handleApiCall]);

  const onCalculateHFTokens = useCallback(() => {
    if (!inputText) {
      setError("Please enter text to calculate tokens.");
      return;
    }
    const hfModelName = "Xenova/llama-tokenizer";
    handleApiCall(calculateHFTokens, inputText, hfModelName);
  }, [inputText, handleApiCall]);

  // Make sure to import these if they are needed elsewhere,
  // but for the onClick handler, we use the useCallback wrappers.
  // import { minifyCodeRemoveSpaces, minifyCodeRewriteNames } from "@/services/minificationService";
  // If you *don't* import them, then you can't use them in the handleApiCall type definition,
  // but since handleApiCall uses `any[]`, it implicitly works.
  // However, it's good practice to import what you use. Let's assume they are imported for clarity.
  // You might need to add them back if handleApiCall's type definition becomes stricter.

  // Assuming you still need these functions for the handleApiCall argument
  // Re-adding the imports to ensure they are available for `handleApiCall`'s first argument type, even if not directly used in onClick.
  const { minifyCodeRemoveSpaces, minifyCodeRewriteNames } = require("@/services/minificationService");


  const onMinifyCodeRemoveSpaces = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(minifyCodeRemoveSpaces, inputText);
  }, [inputText, handleApiCall]);

  const onMinifyCodeRewriteNames = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(minifyCodeRewriteNames, inputText);
  }, [inputText, handleApiCall]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-center mb-8"> {/* Changed to justify-center to center title + logo */}
          {/* Logo */}
          <Image
            src="/icon_calculator.png" // Path to your logo in the public directory
            alt="Tokenizors.net Logo"
            width={48} // Adjust size as needed
            height={48} // Adjust size as needed
            className="mr-3" // Margin to the right of the image
          />
          <h1 className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
            Tokenizors.net
          </h1>
        </header>

        <section className="mb-8 w-full">
          <label htmlFor="code-input" className="block text-lg font-medium mb-2">
            Enter your text or code:
          </label>
          <textarea
            id="code-input"
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y min-h-[200px]"
            placeholder="Paste your code or prompt here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          ></textarea>
        </section>

        {error && (
          <div className="p-3 mb-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-center">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
            onClick={onCalculateOpenAITokens}
            disabled={loading}
          >
            {loading && error === null ? "Calculating..." : "Calculate OpenAI Tokens"}
          </button>
          <button
            className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
            onClick={onCalculateHFTokens}
            disabled={loading}
          >
            {loading && error === null ? "Calculating..." : "Calculate HF Tokens"}
          </button>
          <button
            className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
            onClick={onMinifyCodeRemoveSpaces}
            disabled={loading}
          >
            {loading && error === null ? "Minifying..." : "Minify code (remove spaces)"}
          </button>
          <button
            className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
            onClick={onMinifyCodeRewriteNames}
            disabled={loading}
          >
            {loading && error === null ? "Minifying..." : "Minify code (rewrite names)"}
          </button>
        </section>

        {tokenCount !== null && (
          <section className="mb-8 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg shadow-md text-center">
            <p className="text-xl font-bold">
              Estimated Token Count: {tokenCount}
            </p>
          </section>
        )}

        {minifiedCode && (
          <section className="mb-8">
            <label htmlFor="minified-output" className="block text-lg font-medium mb-2">
              Minified Code:
            </label>
            <textarea
              id="minified-output"
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y min-h-[150px]"
              value={minifiedCode}
              readOnly
            ></textarea>
          </section>
        )}
      </div>
    </div>
  );
}

export default Home;