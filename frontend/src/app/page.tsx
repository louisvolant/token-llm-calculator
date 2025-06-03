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
  const [openAITokenCount, setOpenAITokenCount] = useState<number | null>(null);
  const [hfTokenCount, setHFTokenCount] = useState<number | null>(null);
  const [minifiedCodeOutput, setMinifiedCodeOutput] = useState("");

  const [loadingOpenAI, setLoadingOpenAI] = useState(false);
  const [loadingHF, setLoadingHF] = useState(false);
  const [loadingMinifyRemoveSpaces, setLoadingMinifyRemoveSpaces] = useState(false);
  const [loadingMinifyJS, setLoadingMinifyJS] = useState(false);
  const [loadingMinifyCSS, setLoadingMinifyCSS] = useState(false);
  const [loadingMinifyTS, setLoadingMinifyTS] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Generic handler for API calls, now accepts a setter for loading and result
  const handleApiCall = useCallback(async (
    apiFunction: (...args: any[]) => Promise<any>,
    setSpecificLoading: (loading: boolean) => void,
    setSpecificResult: (data: any) => void,
    ...args: any[]
  ) => {
    setSpecificLoading(true);
    setError(null);
    setOpenAITokenCount(null);
    setHFTokenCount(null);
    setMinifiedCodeOutput("");

    try {
      const data = await apiFunction(...args);
      setSpecificResult(data);
    } catch (err: any) {
      // Check if the error is an Axios error with a response
      const errorMessage = err.response?.data?.error?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      console.error("API call error:", err);
    } finally {
      setSpecificLoading(false);
    }
  }, []);


  const onCalculateOpenAITokens = useCallback(() => {
    if (!inputText) {
      setError("Please enter text to calculate tokens.");
      return;
    }
    handleApiCall(
      calculateOpenAITokens,
      setLoadingOpenAI,
      (data) => setOpenAITokenCount(data.tokenCount),
      inputText,
      "cl100k_base"
    );
  }, [inputText, handleApiCall]);

  const onCalculateHFTokens = useCallback(() => {
    if (!inputText) {
      setError("Please enter text to calculate tokens.");
      return;
    }
    const hfModelName = "Xenova/llama-tokenizer";
    handleApiCall(
      calculateHFTokens,
      setLoadingHF,
      (data) => setHFTokenCount(data.tokenCount),
      inputText,
      hfModelName
    );
  }, [inputText, handleApiCall]);

  const onMinifyCodeRemoveSpacesAndComments = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(
      minifyCodeRemoveSpacesAndComments,
      setLoadingMinifyRemoveSpaces,
      (data) => setMinifiedCodeOutput(data.minifiedCode),
      inputText
    );
  }, [inputText, handleApiCall]); // Confirmed this is correct

  const onMinifyCodeRewriteNames = useCallback(() => {
    if (!inputText) {
      setError("Please enter code to minify.");
      return;
    }
    handleApiCall(
      minifyCodeRewriteJavascript,
      setLoadingMinifyJS,
      (data) => setMinifiedCodeOutput(data.minifiedCode),
      inputText
    );
  }, [inputText, handleApiCall]);

  const onMinifyCodeCss = useCallback(() => {
    if (!inputText) {
      setError("Please enter CSS code to minify.");
      return;
    }
    handleApiCall(
      minifyCodeCss,
      setLoadingMinifyCSS,
      (data) => setMinifiedCodeOutput(data.minifiedCode),
      inputText
    );
  }, [inputText, handleApiCall]);

  const onMinifyCodeTypescript = useCallback(() => {
    if (!inputText) {
      setError("Please enter TypeScript code to minify.");
      return;
    }
    handleApiCall(
      minifyCodeTypescript,
      setLoadingMinifyTS,
      (data) => setMinifiedCodeOutput(data.minifiedCode),
      inputText
    );
  }, [inputText, handleApiCall]);

  const onMoveMinifiedToInput = useCallback(() => {
    if (minifiedCodeOutput) {
      setInputText(minifiedCodeOutput);
      setMinifiedCodeOutput(""); // Clear minified output after moving it
      setOpenAITokenCount(null); // Clear token counts as input changed
      setHFTokenCount(null);
    }
  }, [minifiedCodeOutput]);

  // Determine if any token calculation is loading
  const anyTokenLoading = loadingOpenAI || loadingHF;
  // Determine if any minification is loading
  const anyMinificationLoading = loadingMinifyRemoveSpaces || loadingMinifyJS || loadingMinifyCSS || loadingMinifyTS;
  // Determine if any operation at all is loading for the general error message
  const anyLoading = anyTokenLoading || anyMinificationLoading;

  return ( // THIS IS THE LINE 152 MENTIONED IN THE ERROR
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

        {/* Token Calculation Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Token Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onCalculateOpenAITokens}
              disabled={loadingOpenAI || anyMinificationLoading}
            >
              {loadingOpenAI ? "Calculating..." : "Calculate OpenAI Tokens"}
            </button>
            <button
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onCalculateHFTokens}
              disabled={loadingHF || anyMinificationLoading}
            >
              {loadingHF ? "Calculating..." : "Calculate HF Tokens"}
            </button>
          </div>
          {/* Token Count Results (Moved here) */}
          {(openAITokenCount !== null || hfTokenCount !== null) && (
            <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg shadow-md text-center">
              {openAITokenCount !== null && (
                <p className="text-xl font-bold">
                  OpenAI Estimated Token Count: {openAITokenCount}
                </p>
              )}
              {hfTokenCount !== null && (
                <p className="text-xl font-bold mt-2">
                  HF Estimated Token Count: {hfTokenCount}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Minification Buttons Section */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Code Minification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="w-full px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeRemoveSpacesAndComments}
              disabled={loadingMinifyRemoveSpaces || anyTokenLoading}
            >
              {loadingMinifyRemoveSpaces ? "Minifying..." : "Minify Code (Remove Spaces)"}
            </button>
            <button
              className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeRewriteNames}
              disabled={loadingMinifyJS || anyTokenLoading}
            >
              {loadingMinifyJS ? "Minifying..." : "Minify JavaScript"}
            </button>
            <button
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeCss}
              disabled={loadingMinifyCSS || anyTokenLoading}
            >
              {loadingMinifyCSS ? "Minifying..." : "Minify CSS"}
            </button>
            <button
              className="w-full px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
              onClick={onMinifyCodeTypescript}
              disabled={loadingMinifyTS || anyTokenLoading}
            >
              {loadingMinifyTS ? "Minifying..." : "Minify TypeScript"}
            </button>
          </div>
          {/* Minified Code Result (Remains here) */}
          {minifiedCodeOutput && (
            <div className="mt-6">
              <label htmlFor="minified-output" className="block text-lg font-medium mb-2">
                Minified Code:
              </label>
              <textarea
                id="minified-output"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-y min-h-[150px]"
                value={minifiedCodeOutput}
                readOnly
              ></textarea>
              <button
                className="mt-4 w-full px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out"
                onClick={onMoveMinifiedToInput}
              >
                Use Minified Code as Input
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;