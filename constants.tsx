
import React from 'react';

export const COLORS = {
  primary: '#98C13C', // mLab Green
  secondary: '#4F6B72', // Slate/Teal
  userBubble: '#A8D44C',
  botBubble: '#FFFFFF',
  textDark: '#1F2937',
  textLight: '#F9FAFB'
};

// Updated 'Application' to 'Applications' to match KBEntry category type.
export const CATEGORIES = ['Programmes', 'Locations', 'Applications', 'Events'];

export const SEED_KB: any[] = [
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
    // Updated 'Application' to 'Applications' to match fixed type definitions.
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
