class LLMProvider {
  private apiKey: string;
  private systemPrompt: string;

  constructor() {
    // IMPORTANT: Get a NEW API key - this one is publicly visible!
    this.apiKey = 'AIzaSyAFJKVjzPQzlf9stf84bA-VGzT23ZBh5Hs';
    
    // Updated system prompt - more direct and confident
    this.systemPrompt = `You are a helpful mLab customer support assistant for https://mlab.co.za/. 

Your job is to answer customer questions directly and confidently using the knowledge base information provided.

IMPORTANT RULES:
1. Always try to answer the question using the knowledge base context
2. Be specific and give complete answers
3. Don't be overly cautious - if the information is in the knowledge base, answer it!
4. Use friendly, simple language
5. ONLY suggest talking to a human agent if the knowledge base truly has NO information about the question
6. Never say "I don't have enough information" if there IS relevant information in the context`;
  }

  async generateResponse(prompt: string, context: string = ""): Promise<{ text: string; latency: number }> {
    const start = Date.now();
    
    try {
      // Simplified prompt structure - more direct
      let fullPrompt = `${this.systemPrompt}\n\n`;
      
      if (context && context.trim()) {
        fullPrompt += `KNOWLEDGE BASE INFORMATION:\n${context}\n\n`;
      }
      
      fullPrompt += `CUSTOMER QUESTION: ${prompt}\n\n`;
      fullPrompt += `Answer the customer's question directly using the knowledge base information above. Be helpful and specific.`;

      // Using gemini-2.5-flash
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("API Error:", data);
        return { 
          text: `I apologize, but I'm having trouble right now. Please try again or contact our support team.`, 
          latency: Date.now() - start 
        };
      }

      console.log("Success! API Response:", data);

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                   "I'm sorry, I couldn't generate a response. Please try again.";

      return { text, latency: Date.now() - start };
      
    } catch (error: any) {
      console.error("LLM Error:", error);
      return { 
        text: "I'm having trouble right now. Please try again or contact our support team.", 
        latency: Date.now() - start 
      };
    }
  }
}

export const llmProvider = new LLMProvider();