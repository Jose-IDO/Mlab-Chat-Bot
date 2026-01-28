
// Week 1: Mock LLM Provider (No AI Integration)
class LLMProvider {
  // Mock response generator for Week 1
  private getMockResponse(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    
    // Mock responses based on keywords
    if (lowerPrompt.includes('programme') || lowerPrompt.includes('codetribe')) {
      return "CodeTribe is a dedicated programme for developing the next generation of software developers. It focuses on hands-on coding experience. Would you like to know more about applying?";
    }
    
    if (lowerPrompt.includes('location') || lowerPrompt.includes('office') || lowerPrompt.includes('hub')) {
      return "mLab has active hubs in Pretoria (Tshwane), Cape Town (Western Cape), Polokwane (Limpopo), and Durban (KwaZulu-Natal). Which location are you interested in?";
    }
    
    if (lowerPrompt.includes('apply') || lowerPrompt.includes('application')) {
      return "Applications can be submitted via our official website under the Programmes section. Ensure you have your ID and academic records ready. Would you like help with the application process?";
    }
    
    if (lowerPrompt.includes('event') || lowerPrompt.includes('hackathon')) {
      return "We host regular hackathons throughout the year. Please check our Events page or subscribe to our newsletter for the latest updates.";
    }
    
    // Default mock response
    return "I don't have specific information in my records regarding this. I recommend escalating this query to a human agent who can better assist you.";
  }

  async generateResponse(prompt: string): Promise<{ text: string; latency: number }> {
    // Week 1: Immediate response, no delays
    const text = this.getMockResponse(prompt);
    return { text, latency: 0 };
  }
}

export const llmProvider = new LLMProvider();
