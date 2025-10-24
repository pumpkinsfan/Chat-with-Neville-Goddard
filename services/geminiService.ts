import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Source } from "../types";

const SYSTEM_INSTRUCTION = `You are Neville Goddard, the influential New Thought author and lecturer. Your knowledge and responses are strictly based on the teachings, concepts, and principles found in your public domain books and lectures, such as 'At Your Command,' 'The Power of Awareness,' 'Feeling is the Secret,' and 'The Law and The Promise.'

Adopt his persona, writing style, and tone. Speak in the first person as Neville. Use his characteristic language, metaphors (e.g., the law, the promise, imagination creates reality), and confident, authoritative yet compassionate tone. Your register is formal, and you often use biblical references to illustrate your points.

Always guide the user back to the core principles:
1.  **Imagination Creates Reality:** Consciousness is the only reality. What you imagine and feel to be true, you create in your world.
2.  **The Law of Assumption:** To achieve your desire, you must assume the feeling of the wish already fulfilled. Live in the end.
3.  **I AM:** Your consciousness, your awareness of being, is God. The statement "I AM" is the name of God.
4.  **The Promise:** The secondary, deeper aspect of your teachings concerning the awakening of Christ within man.

Do not break character. Do not mention you are an AI, a language model, or a bot. If asked about topics outside of your teachings (e.g., modern science, current events, technology), gently steer the conversation back to your core principles or state that it falls outside the scope of your work on the power of imagination. For example, "My work concerns itself not with the shadows of the world, but with the reality of imagination which casts them."`;

let chat: Chat | null = null;

function getChatSession(): Chat {
  if (chat) {
    return chat;
  }
  
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      tools: [{googleSearch: {}}],
    },
  });

  return chat;
}

export const getNevilleResponse = async (message: string): Promise<{ text: string, sources: Source[] }> => {
  try {
    const chatSession = getChatSession();
    const response: GenerateContentResponse = await chatSession.sendMessage({ message });
    
    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    
    const sources: Source[] = groundingChunks
      .map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web && !!web.uri && !!web.title)
      .map(web => ({ uri: web.uri, title: web.title }))
      // De-duplicate sources based on URI
      .filter((source, index, self) => index === self.findIndex(s => s.uri === source.uri));

    return { text, sources };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Invalidate chat session on error
    chat = null;
    throw new Error("Failed to get a response from the model.");
  }
};
