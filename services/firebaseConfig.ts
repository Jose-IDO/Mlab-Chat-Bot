// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFcCk6aiEWtIkQygSC4f294kck8evm3AM",
  authDomain: "mlab-chat-bot.firebaseapp.com",
  projectId: "mlab-chat-bot",
  storageBucket: "mlab-chat-bot.firebasestorage.app",
  messagingSenderId: "134375233692",
  appId: "1:134375233692:web:3774f963474543f1fb7559"
};

export const saveMessage = async (
  text: string,
  sender: "user" | "ai"
) => {
  try {
    await addDoc(collection(db, "messages"), {
      text: text,
      sender: sender,
      createdAt: serverTimestamp()
    });

    console.log("Message saved to Firebase");

  } catch (error) {
    console.error("Error saving message:", error);
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);