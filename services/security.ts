
// Security Service: Handles configuration retrieval.
// Sensitive prompts and API keys have been moved to the server-side proxy (api/gemini.ts).

// This file is now a placeholder or can be used for non-sensitive public configuration.

export const getApiKey = () => {
  // API Key is no longer accessed on the client.
  // It is securely stored in Vercel Environment Variables and accessed by the serverless function.
  return "";
};

export const getSystemInstruction = () => {
  // System instructions are now injected on the server side.
  return "";
};

export const getToolkitInstruction = (mode: string) => {
  // Toolkit instructions are now handled on the server side.
  return "";
};
