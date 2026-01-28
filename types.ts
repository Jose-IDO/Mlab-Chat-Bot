
export enum ChatRole {
  BOT = 'bot',
  USER = 'user',
  SYSTEM = 'system'
}

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  type?: 'text' | 'options' | 'escalation' | 'end';
}

export enum KBStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  UNAPPROVED = 'unapproved'
}

export interface KBEntry {
  id: string;
  // Corrected 'Location' to 'Locations' to match the actual data and UI usage.
  category: 'Locations' | 'Programmes' | 'Applications' | 'Events';
  question: string;
  answer: string;
  status: KBStatus;
  lastUpdated: Date;
}

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
