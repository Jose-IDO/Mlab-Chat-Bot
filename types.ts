export interface ChatEvent {
  id: string;
  timestamp: Date;
  model: string;
  latency: number;
  confidence: number;
  tokens?: number;
}
