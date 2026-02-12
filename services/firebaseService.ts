// firebase.ts - Firebase service compatible with your existing types

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";

import type { KBEntry, Escalation, ChatEvent, Enquiry } from '../types';
import { KBStatus, EscalationStatus, EnquiryStatus } from '../types';
import { SEED_KB } from '../constants';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBHWXmxYKfWOW0r8PDR6gFFLsC15X8Y7Y",
  authDomain: "chatbot-53b57.firebaseapp.com",
  projectId: "chatbot-53b57",
  storageBucket: "chatbot-53b57.firebasestorage.app",
  messagingSenderId: "804155914558",
  appId: "1:804155914558:web:b54a44424315deb68e946f",
  measurementId: "G-ZH73RTPGFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

// Collection names
const COLLECTIONS = {
  KB: 'knowledge_base',
  ESCALATIONS: 'escalations',
  EVENTS: 'chat_events',
  ENQUIRIES: 'enquiries'
};

/**
 * FirebaseService - Real Firestore integration
 */
class FirebaseService {
  // ===== Knowledge Base Methods =====
  // Categories: Locations, Programmes, Applications, Events

  /**
   * Get all Knowledge Base entries
   * @returns All KB entries across all categories (Locations, Programmes, Applications, Events)
   */
  async getKB(): Promise<KBEntry[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.KB));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.data().category as 'Locations' | 'Programmes' | 'Applications' | 'Events',
        question: doc.data().question,
        answer: doc.data().answer,
        status: doc.data().status,
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        ...(doc.data().tags && { tags: doc.data().tags })
      } as KBEntry));
    } catch (error) {
      console.error('Error fetching KB entries:', error);
      return [...SEED_KB];
    }
  }

  /**
   * Get a single Knowledge Base entry by ID
   * @param id - The KB entry ID
   * @returns The KB entry or null if not found
   */
  async getKBEntry(id: string): Promise<KBEntry | null> {
    try {
      const docRef = doc(db, COLLECTIONS.KB, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          category: docSnap.data().category as 'Locations' | 'Programmes' | 'Applications' | 'Events',
          question: docSnap.data().question,
          answer: docSnap.data().answer,
          status: docSnap.data().status,
          lastUpdated: docSnap.data().lastUpdated?.toDate() || new Date(),
          ...(docSnap.data().tags && { tags: docSnap.data().tags })
        } as KBEntry;
      }
      return null;
    } catch (error) {
      console.error('Error fetching KB entry:', error);
      throw new Error(`Failed to fetch KB entry with id: ${id}`);
    }
  }

  /**
   * Get KB entries filtered by status
   * @param status - The status to filter by (approved, pending, unapproved)
   * @returns KB entries with the specified status
   */
  async getKBByStatus(status: KBStatus): Promise<KBEntry[]> {
    try {
      const q = query(collection(db, COLLECTIONS.KB), where('status', '==', status));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.data().category as 'Locations' | 'Programmes' | 'Applications' | 'Events',
        question: doc.data().question,
        answer: doc.data().answer,
        status: doc.data().status,
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        ...(doc.data().tags && { tags: doc.data().tags })
      } as KBEntry));
    } catch (error) {
      console.error('Error fetching KB entries by status:', error);
      throw new Error(`Failed to fetch KB entries with status: ${status}`);
    }
  }

  /**
   * Get KB entries filtered by category
   * @param category - The category to filter by (Locations, Programmes, Applications, Events)
   * @returns KB entries in the specified category
   */
  async getKBByCategory(category: 'Locations' | 'Programmes' | 'Applications' | 'Events'): Promise<KBEntry[]> {
    try {
      const q = query(collection(db, COLLECTIONS.KB), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        category: doc.data().category as 'Locations' | 'Programmes' | 'Applications' | 'Events',
        question: doc.data().question,
        answer: doc.data().answer,
        status: doc.data().status,
        lastUpdated: doc.data().lastUpdated?.toDate() || new Date(),
        ...(doc.data().tags && { tags: doc.data().tags })
      } as KBEntry));
    } catch (error) {
      console.error('Error fetching KB entries by category:', error);
      throw new Error(`Failed to fetch KB entries with category: ${category}`);
    }
  }

  /**
   * Add a new Knowledge Base entry
   * @param entry - The KB entry data (category must be: Locations, Programmes, Applications, or Events)
   * @returns The created KB entry with auto-generated ID and PENDING status
   */
  async addKBEntry(entry: Omit<KBEntry, 'id' | 'lastUpdated' | 'status'>): Promise<KBEntry> {
    try {
      // Validate category
      const validCategories: ('Locations' | 'Programmes' | 'Applications' | 'Events')[] = [
        'Locations', 'Programmes', 'Applications', 'Events'
      ];
      
      if (!validCategories.includes(entry.category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
      
      const newEntry = {
        category: entry.category,
        question: entry.question,
        answer: entry.answer,
        status: KBStatus.PENDING,
        lastUpdated: serverTimestamp(),
        ...(entry.tags && { tags: entry.tags })
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.KB), newEntry);
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      return {
        id: docRef.id,
        category: entry.category,
        question: entry.question,
        answer: entry.answer,
        status: KBStatus.PENDING,
        lastUpdated: new Date(),
        ...(entry.tags && { tags: entry.tags })
      };
    } catch (error) {
      console.error('Error adding KB entry:', error);
      throw new Error('Failed to add knowledge base entry');
    }
  }

  /**
   * Update the status of a Knowledge Base entry
   * @param id - The KB entry ID
   * @param status - The new status (approved, pending, or unapproved)
   */
  async updateKBStatus(id: string, status: KBStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.KB, id);
      await updateDoc(docRef, {
        status,
        lastUpdated: serverTimestamp()
      });
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      console.log(`✅ KB entry ${id} status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating KB status:', error);
      throw error;
    }
  }

  /**
   * Update a Knowledge Base entry
   * @param id - The KB entry ID
   * @param updates - Partial updates (can update category, question, answer, status, or tags)
   * @returns The updated KB entry
   */
  async updateKBEntry(id: string, updates: Partial<Omit<KBEntry, 'id'>>): Promise<KBEntry> {
    try {
      const docRef = doc(db, COLLECTIONS.KB, id);
      
      // Validate category if being updated
      if (updates.category) {
        const validCategories: ('Locations' | 'Programmes' | 'Applications' | 'Events')[] = [
          'Locations', 'Programmes', 'Applications', 'Events'
        ];
        
        if (!validCategories.includes(updates.category)) {
          throw new Error(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
        }
      }
      
      await updateDoc(docRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(docRef);
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      console.log(`✅ KB entry ${id} updated successfully`);
      
      return {
        id: updatedDoc.id,
        category: updatedDoc.data()?.category as 'Locations' | 'Programmes' | 'Applications' | 'Events',
        question: updatedDoc.data()?.question,
        answer: updatedDoc.data()?.answer,
        status: updatedDoc.data()?.status,
        lastUpdated: updatedDoc.data()?.lastUpdated?.toDate() || new Date(),
        ...(updatedDoc.data()?.tags && { tags: updatedDoc.data()?.tags })
      } as KBEntry;
    } catch (error) {
      console.error('Error updating KB entry:', error);
      throw error;
    }
  }

  /**
   * Delete a Knowledge Base entry
   * @param id - The KB entry ID to delete
   */
  async deleteKBEntry(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.KB, id));
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      console.log(`✅ KB entry ${id} deleted successfully`);
    } catch (error) {
      console.error('Error deleting KB entry:', error);
      throw error;
    }
  }

  /**
   * Get KB entries for Locations category
   * @returns All KB entries in the Locations category
   */
  async getLocationsKB(): Promise<KBEntry[]> {
    return this.getKBByCategory('Locations');
  }

  /**
   * Get KB entries for Programmes category
   * @returns All KB entries in the Programmes category
   */
  async getProgrammesKB(): Promise<KBEntry[]> {
    return this.getKBByCategory('Programmes');
  }

  /**
   * Get KB entries for Applications category
   * @returns All KB entries in the Applications category
   */
  async getApplicationsKB(): Promise<KBEntry[]> {
    return this.getKBByCategory('Applications');
  }

  /**
   * Get KB entries for Events category
   * @returns All KB entries in the Events category
   */
  async getEventsKB(): Promise<KBEntry[]> {
    return this.getKBByCategory('Events');
  }

  /**
   * Search KB entries by question or answer text
   * @param searchTerm - The term to search for
   * @param category - Optional category filter
   * @returns KB entries matching the search term
   */
  async searchKB(searchTerm: string, category?: 'Locations' | 'Programmes' | 'Applications' | 'Events'): Promise<KBEntry[]> {
    try {
      const entries = category ? await this.getKBByCategory(category) : await this.getKB();
      
      const lowerSearchTerm = searchTerm.toLowerCase();
      
      return entries.filter(entry => 
        entry.question.toLowerCase().includes(lowerSearchTerm) ||
        entry.answer.toLowerCase().includes(lowerSearchTerm) ||
        (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm)))
      );
    } catch (error) {
      console.error('Error searching KB:', error);
      throw new Error('Failed to search knowledge base');
    }
  }

  /**
   * Get KB statistics by category
   * @returns Statistics for each category
   */
  async getKBStatsByCategory() {
    try {
      const allEntries = await this.getKB();
      
      const categories: ('Locations' | 'Programmes' | 'Applications' | 'Events')[] = [
        'Locations', 'Programmes', 'Applications', 'Events'
      ];
      
      const stats = categories.map(category => {
        const categoryEntries = allEntries.filter(e => e.category === category);
        
        return {
          category,
          total: categoryEntries.length,
          approved: categoryEntries.filter(e => e.status === KBStatus.APPROVED).length,
          pending: categoryEntries.filter(e => e.status === KBStatus.PENDING).length,
          unapproved: categoryEntries.filter(e => e.status === KBStatus.UNAPPROVED).length
        };
      });
      
      return stats;
    } catch (error) {
      console.error('Error fetching KB stats by category:', error);
      throw new Error('Failed to fetch KB statistics by category');
    }
  }

  // ===== Escalation Methods =====

  async getEscalations(status?: EscalationStatus): Promise<Escalation[]> {
    try {
      let q;
      if (status) {
        q = query(collection(db, COLLECTIONS.ESCALATIONS), where('status', '==', status));
      } else {
        q = collection(db, COLLECTIONS.ESCALATIONS);
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      } as Escalation));
    } catch (error) {
      console.error('Error fetching escalations:', error);
      throw new Error('Failed to fetch escalations');
    }
  }

  async getEscalation(id: string): Promise<Escalation | null> {
    try {
      const docRef = doc(db, COLLECTIONS.ESCALATIONS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date()
        } as Escalation;
      }
      return null;
    } catch (error) {
      console.error('Error fetching escalation:', error);
      throw new Error(`Failed to fetch escalation with id: ${id}`);
    }
  }

  async createEscalation(data: Omit<Escalation, 'id' | 'status' | 'createdAt'>): Promise<Escalation> {
    try {
      const newEsc = {
        ...data,
        status: EscalationStatus.OPEN,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.ESCALATIONS), newEsc);
      
      console.log('✅ Escalation created successfully with ID:', docRef.id);
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      return {
        id: docRef.id,
        ...data,
        status: EscalationStatus.OPEN,
        createdAt: new Date()
      };
    } catch (error) {
      console.error('❌ Error creating escalation:', error);
      throw new Error('Failed to create escalation');
    }
  }

  async updateEscalationStatus(id: string, status: EscalationStatus): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ESCALATIONS, id);
      await updateDoc(docRef, { status });
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
    } catch (error) {
      console.error('Error updating escalation status:', error);
      throw error;
    }
  }

  async updateEscalation(id: string, updates: Partial<Omit<Escalation, 'id' | 'createdAt'>>): Promise<Escalation> {
    try {
      const docRef = doc(db, COLLECTIONS.ESCALATIONS, id);
      await updateDoc(docRef, updates);
      
      const updatedDoc = await getDoc(docRef);
      
      await this.logEvent({
        model: 'system',
        latency: 0,
        confidence: 1.0
      });
      
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data()?.createdAt?.toDate() || new Date()
      } as Escalation;
    } catch (error) {
      console.error('Error updating escalation:', error);
      throw error;
    }
  }

  // ===== ENQUIRIES Methods (UPDATED) =====

  /**
   * Log a user enquiry/conversation
   */
  async logEnquiry(data: Omit<Enquiry, 'id' | 'status' | 'createdAt' | 'resolvedAt'>): Promise<Enquiry> {
    try {
      const newEnquiry = {
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        category: data.category,
        confidence: data.confidence,
        responseTime: data.responseTime,
        status: EnquiryStatus.NEW,
        createdAt: serverTimestamp(),
        // Optional fields
        ...(data.userId && { userId: data.userId }),
        ...(data.wasHelpful !== undefined && { wasHelpful: data.wasHelpful }),
        ...(data.kbUsed && { kbUsed: data.kbUsed }),
        ...(data.escalationId && { escalationId: data.escalationId }),
        ...(data.metadata && { metadata: data.metadata })
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.ENQUIRIES), newEnquiry);
      
      console.log('📝 Enquiry logged with ID:', docRef.id);
      
      return {
        id: docRef.id,
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        category: data.category,
        confidence: data.confidence,
        responseTime: data.responseTime,
        status: EnquiryStatus.NEW,
        createdAt: new Date(),
        // Optional fields
        ...(data.userId && { userId: data.userId }),
        ...(data.wasHelpful !== undefined && { wasHelpful: data.wasHelpful }),
        ...(data.kbUsed && { kbUsed: data.kbUsed }),
        ...(data.escalationId && { escalationId: data.escalationId }),
        ...(data.metadata && { metadata: data.metadata })
      };
    } catch (error) {
      console.error('Error logging enquiry:', error);
      // Don't throw - logging failures shouldn't break the chat
      return {
        id: 'local-' + Date.now(),
        sessionId: data.sessionId,
        query: data.query,
        response: data.response,
        category: data.category,
        confidence: data.confidence,
        responseTime: data.responseTime,
        status: EnquiryStatus.NEW,
        createdAt: new Date(),
        // Optional fields
        ...(data.userId && { userId: data.userId }),
        ...(data.wasHelpful !== undefined && { wasHelpful: data.wasHelpful }),
        ...(data.kbUsed && { kbUsed: data.kbUsed }),
        ...(data.escalationId && { escalationId: data.escalationId }),
        ...(data.metadata && { metadata: data.metadata })
      };
    }
  }

  /**
   * Get all enquiries with optional filters
   */
  async getEnquiries(filters?: {
    status?: EnquiryStatus;
    sessionId?: string;
    userId?: string;
    limitCount?: number;
  }): Promise<Enquiry[]> {
    try {
      let q = query(collection(db, COLLECTIONS.ENQUIRIES), orderBy('createdAt', 'desc'));
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters?.sessionId) {
        q = query(q, where('sessionId', '==', filters.sessionId));
      }
      
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      if (filters?.limitCount) {
        q = query(q, limit(filters.limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        sessionId: doc.data().sessionId,
        query: doc.data().query,
        response: doc.data().response,
        category: doc.data().category,
        confidence: doc.data().confidence,
        responseTime: doc.data().responseTime,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        ...(doc.data().resolvedAt && { resolvedAt: doc.data().resolvedAt.toDate() }),
        ...(doc.data().userId && { userId: doc.data().userId }),
        ...(doc.data().wasHelpful !== undefined && { wasHelpful: doc.data().wasHelpful }),
        ...(doc.data().kbUsed && { kbUsed: doc.data().kbUsed }),
        ...(doc.data().escalationId && { escalationId: doc.data().escalationId }),
        ...(doc.data().metadata && { metadata: doc.data().metadata })
      } as Enquiry));
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      throw new Error('Failed to fetch enquiries');
    }
  }

  /**
   * Get a single enquiry by ID
   */
  async getEnquiry(id: string): Promise<Enquiry | null> {
    try {
      const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          sessionId: docSnap.data().sessionId,
          query: docSnap.data().query,
          response: docSnap.data().response,
          category: docSnap.data().category,
          confidence: docSnap.data().confidence,
          responseTime: docSnap.data().responseTime,
          status: docSnap.data().status,
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          ...(docSnap.data().resolvedAt && { resolvedAt: docSnap.data().resolvedAt.toDate() }),
          ...(docSnap.data().userId && { userId: docSnap.data().userId }),
          ...(docSnap.data().wasHelpful !== undefined && { wasHelpful: docSnap.data().wasHelpful }),
          ...(docSnap.data().kbUsed && { kbUsed: docSnap.data().kbUsed }),
          ...(docSnap.data().escalationId && { escalationId: docSnap.data().escalationId }),
          ...(docSnap.data().metadata && { metadata: docSnap.data().metadata })
        } as Enquiry;
      }
      return null;
    } catch (error) {
      console.error('Error fetching enquiry:', error);
      throw new Error(`Failed to fetch enquiry with id: ${id}`);
    }
  }

  /**
   * Update enquiry
   */
  async updateEnquiry(id: string, updates: Partial<Omit<Enquiry, 'id' | 'createdAt'>>): Promise<Enquiry> {
    try {
      const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
      
      const updateData: any = { ...updates };
      
      if (updates.status === EnquiryStatus.RESOLVED && !updates.resolvedAt) {
        updateData.resolvedAt = serverTimestamp();
      }
      
      await updateDoc(docRef, updateData);
      
      const updatedDoc = await getDoc(docRef);
      
      return {
        id: updatedDoc.id,
        sessionId: updatedDoc.data()?.sessionId,
        query: updatedDoc.data()?.query,
        response: updatedDoc.data()?.response,
        category: updatedDoc.data()?.category,
        confidence: updatedDoc.data()?.confidence,
        responseTime: updatedDoc.data()?.responseTime,
        status: updatedDoc.data()?.status,
        createdAt: updatedDoc.data()?.createdAt?.toDate() || new Date(),
        ...(updatedDoc.data()?.resolvedAt && { resolvedAt: updatedDoc.data()?.resolvedAt.toDate() }),
        ...(updatedDoc.data()?.userId && { userId: updatedDoc.data()?.userId }),
        ...(updatedDoc.data()?.wasHelpful !== undefined && { wasHelpful: updatedDoc.data()?.wasHelpful }),
        ...(updatedDoc.data()?.kbUsed && { kbUsed: updatedDoc.data()?.kbUsed }),
        ...(updatedDoc.data()?.escalationId && { escalationId: updatedDoc.data()?.escalationId }),
        ...(updatedDoc.data()?.metadata && { metadata: updatedDoc.data()?.metadata })
      } as Enquiry;
    } catch (error) {
      console.error('Error updating enquiry:', error);
      throw error;
    }
  }

  /**
   * Mark enquiry as helpful/not helpful
   */
  async markEnquiryFeedback(id: string, wasHelpful: boolean): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ENQUIRIES, id);
      await updateDoc(docRef, { 
        wasHelpful,
        status: wasHelpful ? EnquiryStatus.RESOLVED : EnquiryStatus.IN_PROGRESS
      });
      
      console.log(`Enquiry ${id} marked as ${wasHelpful ? 'helpful' : 'not helpful'}`);
    } catch (error) {
      console.error('Error marking enquiry feedback:', error);
      throw error;
    }
  }

  /**
   * Link enquiry to escalation
   */
  async linkEnquiryToEscalation(enquiryId: string, escalationId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.ENQUIRIES, enquiryId);
      await updateDoc(docRef, { 
        escalationId,
        status: EnquiryStatus.ESCALATED
      });
      
      console.log(`Enquiry ${enquiryId} linked to escalation ${escalationId}`);
    } catch (error) {
      console.error('Error linking enquiry to escalation:', error);
      throw error;
    }
  }

  /**
   * Get enquiries by session (conversation history)
   */
  async getEnquiriesBySession(sessionId: string): Promise<Enquiry[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ENQUIRIES),
        where('sessionId', '==', sessionId),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        sessionId: doc.data().sessionId,
        query: doc.data().query,
        response: doc.data().response,
        category: doc.data().category,
        confidence: doc.data().confidence,
        responseTime: doc.data().responseTime,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        ...(doc.data().resolvedAt && { resolvedAt: doc.data().resolvedAt.toDate() }),
        ...(doc.data().userId && { userId: doc.data().userId }),
        ...(doc.data().wasHelpful !== undefined && { wasHelpful: doc.data().wasHelpful }),
        ...(doc.data().kbUsed && { kbUsed: doc.data().kbUsed }),
        ...(doc.data().escalationId && { escalationId: doc.data().escalationId }),
        ...(doc.data().metadata && { metadata: doc.data().metadata })
      } as Enquiry));
    } catch (error) {
      console.error('Error fetching enquiries by session:', error);
      throw new Error('Failed to fetch enquiries by session');
    }
  }

  /**
   * Get unresolved enquiries
   */
  async getUnresolvedEnquiries(limitCount: number = 50): Promise<Enquiry[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ENQUIRIES),
        where('status', 'in', [EnquiryStatus.NEW, EnquiryStatus.IN_PROGRESS]),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        sessionId: doc.data().sessionId,
        query: doc.data().query,
        response: doc.data().response,
        category: doc.data().category,
        confidence: doc.data().confidence,
        responseTime: doc.data().responseTime,
        status: doc.data().status,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        ...(doc.data().resolvedAt && { resolvedAt: doc.data().resolvedAt.toDate() }),
        ...(doc.data().userId && { userId: doc.data().userId }),
        ...(doc.data().wasHelpful !== undefined && { wasHelpful: doc.data().wasHelpful }),
        ...(doc.data().kbUsed && { kbUsed: doc.data().kbUsed }),
        ...(doc.data().escalationId && { escalationId: doc.data().escalationId }),
        ...(doc.data().metadata && { metadata: doc.data().metadata })
      } as Enquiry));
    } catch (error) {
      console.error('Error fetching unresolved enquiries:', error);
      throw new Error('Failed to fetch unresolved enquiries');
    }
  }

  // ===== Event/Log Methods =====

  async logEvent(event: Omit<ChatEvent, 'id' | 'timestamp'>): Promise<ChatEvent> {
    try {
      const newEvent = {
        ...event,
        timestamp: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), newEvent);
      
      return {
        id: docRef.id,
        ...event,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error logging event:', error);
      return {
        id: 'local-' + Date.now(),
        ...event,
        timestamp: new Date()
      };
    }
  }

  async getEvents(): Promise<ChatEvent[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ChatEvent));
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch events');
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<ChatEvent[]> {
    try {
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);
      
      const q = query(
        collection(db, COLLECTIONS.EVENTS),
        where('timestamp', '>=', startTimestamp),
        where('timestamp', '<=', endTimestamp)
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      } as ChatEvent));
    } catch (error) {
      console.error('Error fetching events by date range:', error);
      throw new Error('Failed to fetch events by date range');
    }
  }

  // ===== Metrics Methods =====

  async getMetrics() {
    try {
      const [events, escalations, kbEntries, enquiries] = await Promise.all([
        this.getEvents(),
        this.getEscalations(),
        this.getKB(),
        this.getEnquiries()
      ]);

      const totalConversations = enquiries.length;
      const escalationCount = escalations.length;
      const deflectionRate = totalConversations > 0 
        ? ((totalConversations - escalationCount) / totalConversations * 100).toFixed(1)
        : '0';

      const ratedEnquiries = enquiries.filter(e => e.wasHelpful !== undefined);
      const helpfulEnquiries = enquiries.filter(e => e.wasHelpful === true);
      const satisfactionRate = ratedEnquiries.length > 0
        ? ((helpfulEnquiries.length / ratedEnquiries.length) * 100).toFixed(1)
        : '0';

      const avgResponseTime = enquiries.length > 0
        ? Math.round(enquiries.reduce((sum, e) => sum + (e.responseTime || 0), 0) / enquiries.length)
        : 0;

      return {
        totalConversations,
        totalEnquiries: enquiries.length,
        resolvedEnquiries: enquiries.filter(e => e.status === EnquiryStatus.RESOLVED).length,
        unresolvedEnquiries: enquiries.filter(e => 
          e.status === EnquiryStatus.NEW || e.status === EnquiryStatus.IN_PROGRESS
        ).length,
        escalations: escalationCount,
        openEscalations: escalations.filter(e => e.status === EscalationStatus.OPEN).length,
        assignedEscalations: escalations.filter(e => e.status === EscalationStatus.ASSIGNED).length,
        closedEscalations: escalations.filter(e => e.status === EscalationStatus.CLOSED).length,
        deflectionRate,
        p95Latency: this.calculateP95Latency(events),
        avgResponseTime,
        satisfactionRate,
        kbEntries: kbEntries.length,
        approvedKBEntries: kbEntries.filter(e => e.status === KBStatus.APPROVED).length,
        pendingKBEntries: kbEntries.filter(e => e.status === KBStatus.PENDING).length,
        unapprovedKBEntries: kbEntries.filter(e => e.status === KBStatus.UNAPPROVED).length
      };
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw new Error('Failed to fetch metrics');
    }
  }

  private calculateP95Latency(events: ChatEvent[]): number {
    if (events.length === 0) return 2400;
    
    const latencies = events.map(e => e.latency).sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    return latencies[p95Index] || 2400;
  }

  // ===== Utility Methods =====

  async initializeData(): Promise<void> {
    try {
      const kbSnapshot = await getDocs(collection(db, COLLECTIONS.KB));
      
      if (kbSnapshot.empty) {
        console.log('Initializing database with seed data...');
        
        for (const entry of SEED_KB) {
          await addDoc(collection(db, COLLECTIONS.KB), {
            ...entry,
            lastUpdated: serverTimestamp()
          });
        }
        
        console.log('✅ Database initialized successfully');
      } else {
        console.log('Database already initialized');
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw new Error('Failed to initialize database');
    }
  }

  async exportData() {
    const [kb, escalations, events, enquiries] = await Promise.all([
      this.getKB(),
      this.getEscalations(),
      this.getEvents(),
      this.getEnquiries()
    ]);

    return {
      kb,
      escalations,
      events,
      enquiries,
      exportedAt: new Date()
    };
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();

// Export class for testing
export { FirebaseService };