// types.ts - Complete type definitions with Enquiries

// ===== Chat Types =====

export const ChatRole = {
  BOT: 'bot',
  USER: 'user',
  SYSTEM: 'system'
} as const;

export type ChatRole = typeof ChatRole[keyof typeof ChatRole];

export interface Message {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  type?: 'text' | 'options' | 'escalation' | 'end';
}

// ===== Knowledge Base Types =====

export const KBStatus = {
  APPROVED: 'approved',
  PENDING: 'pending',
  UNAPPROVED: 'unapproved'
} as const;

export type KBStatus = typeof KBStatus[keyof typeof KBStatus];

export interface KBEntry {
  id: string;
  category: 'Locations' | 'Programmes' | 'Applications' | 'Events';
  question: string;
  answer: string;
  status: KBStatus;
  lastUpdated: Date;
  tags?: string[]; // Optional: for better search
}

// ===== Escalation Types =====

export const EscalationStatus = {
  OPEN: 'open',
  ASSIGNED: 'assigned',
  CLOSED: 'closed'
} as const;

export type EscalationStatus = typeof EscalationStatus[keyof typeof EscalationStatus];

export interface Escalation {
  id: string;
  fullName: string;
  email: string;
  phone?: string; // Made optional to match your original
  message: string;
  category: string;
  status: EscalationStatus;
  createdAt: Date;
  popiaConsent: boolean;
  assignedTo?: string;
  notes?: string;
}

// ===== Chat Event Types =====

export interface ChatEvent {
  id: string;
  timestamp: Date;
  model: string;
  latency: number;
  confidence: number;
  tokens?: number;
  userId?: string;
  sessionId?: string;
}

// ===== NEW: Enquiry Types =====

export const EnquiryStatus = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated'
} as const;

export type EnquiryStatus = typeof EnquiryStatus[keyof typeof EnquiryStatus];

export interface Enquiry {
  id: string;
  userId?: string;
  sessionId: string;
  query: string; // The user's question/message
  response: string; // The bot's response
  wasHelpful?: boolean; // User feedback
  category?: 'Locations' | 'Programmes' | 'Applications' | 'Events' | string; // Auto-categorized or manual
  confidence: number; // AI confidence score (0.0 - 1.0)
  responseTime: number; // Milliseconds
  kbUsed?: string[]; // KB entry IDs that were referenced
  status: EnquiryStatus;
  createdAt: Date;
  resolvedAt?: Date;
  escalationId?: string; // If escalated, link to escalation
  metadata?: {
    userAgent?: string;
    location?: string;
    language?: string;
  };
}