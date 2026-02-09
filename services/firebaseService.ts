
import { Escalation, ChatEvent, EscalationStatus } from '../types';

// Simulated Local Storage / Persistence for Demo
class FirebaseService {
  private escalations: Escalation[] = [];
  private events: ChatEvent[] = [];

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

  // Events/Logs (Week 1: Not used, but kept for future)
  async logEvent(event: Omit<ChatEvent, 'id' | 'timestamp'>): Promise<void> {
    this.events.push({
      ...event,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    });
  }
}

export const firebaseService = new FirebaseService();
