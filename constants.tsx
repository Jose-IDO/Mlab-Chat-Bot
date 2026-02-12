// constants.ts - Constants and seed data

import type { KBEntry } from './types';

export const COLORS = {
  primary: '#98C13C', // mLab Green
  secondary: '#4F6B72', // Slate/Teal
  userBubble: '#A8D44C',
  botBubble: '#FFFFFF',
  textDark: '#1F2937',
  textLight: '#F9FAFB'
};

export const CATEGORIES = ['Programmes', 'Locations', 'Applications', 'Events'] as const;

export const SEED_KB: KBEntry[] = [
  {
    id: '1',
    category: 'Programmes',
    question: 'What is CodeTribe?',
    answer: 'CodeTribe is a dedicated programme for developing the next generation of software developers. It focuses on hands-on coding experience.',
    status: 'approved',
    lastUpdated: new Date()
  },
  {
    id: '2',
    category: 'Locations',
    question: 'Where are mLab offices located?',
    answer: 'mLab has active hubs in Pretoria (Tshwane), Cape Town (Western Cape), Polokwane (Limpopo), and Durban (KwaZulu-Natal).',
    status: 'approved',
    lastUpdated: new Date()
  },
  {
    id: '3',
    category: 'Applications',
    question: 'How do I apply for a programme?',
    answer: 'Applications can be submitted via our official website under the Programmes section. Ensure you have your ID and academic records ready.',
    status: 'approved',
    lastUpdated: new Date()
  },
  {
    id: '4',
    category: 'Events',
    question: 'Are there upcoming hackathons?',
    answer: 'We host regular hackathons throughout the year. Please check our Events page or subscribe to our newsletter for the latest updates.',
    status: 'approved',
    lastUpdated: new Date()
  }
];

/**
 * Application Configuration
 */
export const APP_CONFIG = {
  MAX_ESCALATION_PRIORITY_LEVELS: 3,
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_KB_CONTENT_LENGTH: 5000,
  SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
};

/**
 * Event Types
 */
export const EVENT_TYPES = {
  CONVERSATION_STARTED: 'conversation_started',
  MESSAGE_SENT: 'message_sent',
  KB_ENTRY_CREATED: 'kb_entry_created',
  KB_ENTRY_UPDATED: 'kb_entry_updated',
  KB_ENTRY_DELETED: 'kb_entry_deleted',
  ESCALATION_CREATED: 'escalation_created',
  ESCALATION_UPDATED: 'escalation_updated',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
} as const;