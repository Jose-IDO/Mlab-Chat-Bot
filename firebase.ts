// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

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

// ✅ Initialize Firestore
export const db = getFirestore(app);
