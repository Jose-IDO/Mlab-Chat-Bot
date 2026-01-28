
import { GoogleGenAI } from "@google/genai";

class LLMProvider {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async generateResponse(prompt: string, context: string = ""): Promise<{ text: string; latency: number }> {
    const start = Date.now();
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context from Knowledge Base: ${context}\n\nUser Question: ${prompt}`,
        config: {
          systemInstruction: "You are a friendly mLab AI Support agent. Answer based on the context provided. If the answer is not in the context, politely suggest escalating to a human agent. Use simple language.",
          temperature: 0.7,
        }
      });
      
      const latency = Date.now() - start;
      return { 
        text: response.text || "I'm sorry, I couldn't generate a response. Would you like to speak to an agent?", 
        latency 
      };
    } catch (error) {
      console.error("LLM Error:", error);
      return { text: "Error connecting to AI service. Please try again.", latency: Date.now() - start };
    }
  }
}

export const llmProvider = new LLMProvider();
