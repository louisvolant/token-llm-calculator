// frontend/src/app/layout.tsx
import "./globals.css";
import { Inter, Roboto_Mono } from "next/font/google";
import { Providers } from "../context/ThemeProvider";
import { LanguageProvider } from "../context/LanguageContext";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });

// --- REWRITTEN METADATA ---
export const metadata = {
  // Main title that appears in browser tab
  title: {
    default: "Token LLM Calculator - Estimate & Minify Code",
    template: "%s | Token LLM Calculator", // For pages that set their own title
  },
  // Site description for search engines
  description: "An online tool to estimate token counts for OpenAI and Hugging Face (Mistral, Llama) models, and to minify code by removing spaces or rewriting names.",
  // Keywords for SEO
  keywords: ["LLM", "Token Calculator", "OpenAI", "Hugging Face", "Mistral", "Llama", "NLP", "Code Minifier", "Prompt Engineering", "AI"],
  // Author information
  authors: [{ name: "Louis Volant", url: "https://www.louisvolant.com" }],
  // Favicon (from public directory)
  icons: {
    icon: "/icon_calculator.png", // Path to your favicon in the public directory
    shortcut: "/icon_calculator.png",
    apple: "/icon_calculator.png", // For Apple touch icon
  },
  // Open Graph metadata for social media sharing
  openGraph: {
    title: "Token LLM Calculator - Estimate & Minify Code",
    description: "Estimate token counts for AI models and minify your code.",
    url: "https://token-llm-calculator.louisvolant.com", // Replace with your actual domain
    siteName: "Token LLM Calculator",
    images: [
      {
        url: "https://token-llm-calculator.louisvolant.com/og-image.png", // Path to your Open Graph image in public
        width: 1200,
        height: 630,
        alt: "Token LLM Calculator Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "Token LLM Calculator - Estimate & Minify Code",
    description: "Estimate token counts for AI models and minify your code.",
    creator: "@yourtwitterhandle", // Your Twitter handle
    images: ["https://token-llm-calculator.louisvolant.com/twitter-image.png"], // Path to your Twitter card image
  },
  // Canonical URL (important for SEO)
  alternates: {
    canonical: "https://token-llm-calculator.louisvolant.com", // Replace with your actual domain
  },
};
// --- END REWRITTEN METADATA ---

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={`${inter.className} ${robotoMono.className} flex flex-col min-h-screen`}>
        <LanguageProvider>
          <Providers>
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}