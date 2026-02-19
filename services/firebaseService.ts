import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Escalation, ChatEvent, EscalationStatus } from '../types';
import { getFirebaseApp } from './firebase';
import { getFirestore } from 'firebase/firestore';

const ESCALATIONS_COLLECTION = 'escalations';

// In-memory fallback when Firebase is not configured
const inMemoryEscalations: Escalation[] = [];

class FirebaseService {
  private events: ChatEvent[] = [];

  // Escalations
  async getEscalations(): Promise<Escalation[]> {
    return inMemoryEscalations;
  }

  async createEscalation(data: Omit<Escalation, 'id' | 'status' | 'createdAt'>): Promise<Escalation> {
    const app = getFirebaseApp();
    if (app) {
      const db = getFirestore(app);
      const docRef = await addDoc(collection(db, ESCALATIONS_COLLECTION), {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone ?? null,
        message: data.message,
        category: data.category,
        status: EscalationStatus.OPEN,
        createdAt: serverTimestamp(),
        popiaConsent: data.popiaConsent
      });
      return {
        id: docRef.id,
        ...data,
        status: EscalationStatus.OPEN,
        createdAt: new Date()
      };
    }
    const newEsc: Escalation = {
      ...data,
      id: `ESC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      status: EscalationStatus.OPEN,
      createdAt: new Date()
    };
    inMemoryEscalations.push(newEsc);
    return newEsc;
  }

  async updateEscalationStatus(id: string, status: EscalationStatus): Promise<void> {
    const esc = inMemoryEscalations.find(e => e.id === id);
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
