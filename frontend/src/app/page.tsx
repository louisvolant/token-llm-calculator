// frontend/src/app/page.tsx
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

import { calculateOpenAITokens, calculateHFTokens } from "@/services/tokenizationService";
import {
  minifyCodeRemoveSpacesAndComments,
  minifyCodeRewriteJavascript,
  minifyCodeCss,
  minifyCodeTypescript,
} from "@/services/minificationService";

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

  const onMinifyCodeRemoveSpacesAndComments = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(minifyCodeRemoveSpacesAndComments, inputText);
  }, [inputText, handleApiCall]);

  const onMinifyCodeRewriteNames = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(minifyCodeRewriteJavascript, inputText);
  }, [inputText, handleApiCall]);

  const onMinifyCodeCss = useCallback(() => {
    if (!inputText) {
      setError("Please enter CSS code to minify.");
      return;
    }
    handleApiCall(minifyCodeCss, inputText);
  }, [inputText, handleApiCall]);

  const onMinifyCodeTypescript = useCallback(() => {
    if (!inputText) {
      setError("Please enter TypeScript code to minify.");
      return;
    }
    handleApiCall(minifyCodeTypescript, inputText);
  }, [inputText, handleApiCall]);

  // NEW: Handler for moving minified code to input
  const onMoveMinifiedToInput = useCallback(() => {
    if (minifiedCode) {
      setInputText(minifiedCode);
      setMinifiedCode(""); // Clear minified output after moving it
      setTokenCount(null); // Clear token count as input changed
    }
  }, [minifiedCode]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-4xl">
        <header className="flex items-center justify-center mb-8">
          <Image
            src="/icon_calculator.png"
            alt="Tokenizors.net Logo"
            width={48}
            height={48}
            className="mr-3"
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

        {/* Token Calculation Buttons Group */}
        <section className="mb-8"> {/* Added mb-8 for spacing below this group */}
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Token Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </section>

        {/* Minification Buttons Group */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Code Minification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Adjusted grid layout for 4 buttons */}
            <button
              className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeRemoveSpacesAndComments}
              disabled={loading}
            >
              {loading && error === null ? "Minifying..." : "Minify Code (Remove Spaces)"}
            </button>
            <button
              className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeRewriteNames}
              disabled={loading}
            >
              {loading && error === null ? "Minifying..." : "Minify JavaScript (Rewrite Names)"}
            </button>
            <button
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeCss}
              disabled={loading}
            >
              {loading && error === null ? "Minifying..." : "Minify CSS"}
            </button>
            <button
              className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeTypescript}
              disabled={loading}
            >
              {loading && error === null ? "Minifying..." : "Minify TypeScript"}
            </button>
          </div>
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
            {/* NEW: Button to move content up */}
            <button
              className="mt-4 w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
              onClick={onMoveMinifiedToInput}
            >
              Use Minified Code as Input
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default Home;