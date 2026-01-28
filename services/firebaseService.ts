
import { KBEntry, Escalation, ChatEvent, KBStatus, EscalationStatus } from '../types';
import { SEED_KB } from '../constants';

// Simulated Local Storage / Persistence for Demo
class FirebaseService {
  private kb: KBEntry[] = [...SEED_KB];
  private escalations: Escalation[] = [];
  private events: ChatEvent[] = [];

  // Knowledge Base
  async getKB(): Promise<KBEntry[]> {
    return this.kb;
  }

  async addKBEntry(entry: Omit<KBEntry, 'id' | 'lastUpdated' | 'status'>): Promise<KBEntry> {
    const newEntry: KBEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      status: KBStatus.PENDING,
      lastUpdated: new Date()
    };
    this.kb.push(newEntry);
    return newEntry;
  }

  async updateKBStatus(id: string, status: KBStatus): Promise<void> {
    const entry = this.kb.find(e => e.id === id);
    if (entry) entry.status = status;
  }

  // Escalations
  async getEscalations(): Promise<Escalation[]> {
    return this.escalations;
  }

  async createEscalation(data: Omit<Escalation, 'id' | 'status' | 'createdAt'>): Promise<Escalation> {
    const newEsc: Escalation = {
      ...data,
      id: `ESC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: EscalationStatus.OPEN,
      createdAt: new Date()
    };
    this.escalations.push(newEsc);
    return newEsc;
  }

  async updateEscalationStatus(id: string, status: EscalationStatus): Promise<void> {
    const esc = this.escalations.find(e => e.id === id);
    if (esc) esc.status = status;
  }

  // Events/Logs
  async logEvent(event: Omit<ChatEvent, 'id' | 'timestamp'>): Promise<void> {
    this.events.push({
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    });
  }

  async getMetrics() {
    return {
      totalConversations: this.events.length,
      escalations: this.escalations.length,
      p95Latency: 2400, // Hardcoded for simulation
      deflectionRate: this.events.length > 0 ? ((this.events.length - this.escalations.length) / this.events.length * 100).toFixed(1) : 0
    };
  }
}

export const firebaseService = new FirebaseService();
