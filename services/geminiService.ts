import { SourceText, ToolkitMode, Language, Message } from "../types";


// Helper to remove control characters but keep punctuation
const sanitizeInput = (text: string): string => {
  return text.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, "").trim();
};

export const sendMessageStream = async function* (
  message: string,
  history: Message[],
  source: SourceText = 'All Scriptures', 
  mode: ToolkitMode = 'General Wisdom',
  language: Language = Language.ENGLISH
) {
  const cleanMessage = sanitizeInput(message);
  
  // Filter history to only send necessary fields and valid roles
  const formattedHistory = history
    .filter(msg => msg.role === 'user' || (msg.role === 'model' && !msg.text.startsWith("Ask relevant")))
    .map(msg => ({
      role: msg.role,
      text: msg.text
    }));

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'chat',
        payload: {
          message: cleanMessage,
          history: formattedHistory,
          source,
          mode,
          language
        }
      })
    });

    if (!response.ok) throw new Error('Network response was not ok');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      yield chunk;
    }
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
};

export const generateFollowUpQuestions = async (previousResponse: string): Promise<string[]> => {
  if (previousResponse.startsWith("Ask relevant") || previousResponse.startsWith("I can't act") || previousResponse.startsWith("Please rephrase") || previousResponse.startsWith("This inquiry appears")) return [];
  
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_questions',
        payload: { context: previousResponse }
      })
    });
    const data = await response.json();
    const text = data.text || "";
    return text.split('|').map((q: string) => q.trim()).filter((q: string) => q.length > 0).slice(0, 3);
  } catch (error) {
    console.error("Follow-up generation failed:", error);
    return [];
  }
};

export const generateIllustrations = async (storyText: string): Promise<string[]> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'illustrate',
        payload: { text: storyText }
      })
    });
    const data = await response.json();
    return data.images || [];
  } catch (error) {
    console.error("Error generating illustrations:", error);
    return [];
  }
};

export const translateForTTS = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'tts',
        payload: { text, lang: targetLanguage }
      })
    });
    const data = await response.json();
    return data.text || text;
  } catch (error) {
    return text;
  }
};

export const summarizeContent = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'summarize',
        payload: { text }
      })
    });
    const data = await response.json();
    return data.text || "Summary unavailable.";
  } catch (error) {
    console.error("Summarization failed:", error);
    throw error;
  }
};

export const initializeChat = () => {
  // No-op as state is managed on server per request or via history
};
