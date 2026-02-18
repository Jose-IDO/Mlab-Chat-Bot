const API_URL = 'http://localhost:3001/api/generate';

class LLMProvider {
  async generateResponse(
    prompt: string, 
    context: string = '', 
    provider: 'auto' | 'groq' | 'gemini' = 'auto'
  ): Promise<{ text: string; latency: number; provider: string }> {
    const start = Date.now();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          provider // 'auto', 'groq', or 'gemini'
        })
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        text: data.text || 'Sorry, I could not generate a response.',
        latency: data.latency || (Date.now() - start),
        provider: data.provider || 'unknown'
      };
    } catch (error) {
      console.error('Error calling backend API:', error);
      return {
        text: 'Sorry, I encountered an error. Please try again later.',
        latency: Date.now() - start,
        provider: 'error'
      };
    }
  }
}

export const llmProvider = new LLMProvider();