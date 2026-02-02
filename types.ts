export enum EscalationStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  CLOSED = 'closed'
}

export interface Escalation {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  category: string;
  status: EscalationStatus;
  createdAt: Date;
  popiaConsent: boolean;
}

export interface ChatEvent {
  id: string;
  timestamp: Date;
  model: string;
  latency: number;
  confidence: number;
  tokens?: number;
}
