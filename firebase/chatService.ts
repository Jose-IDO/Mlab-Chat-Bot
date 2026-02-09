import { db } from "../services/firebaseConfig";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

const CONVERSATION_ID = "default_conversation";

export const saveMessage = async (
  text: string,
  sender: "user" | "ai"
) => {

  const conversationRef = doc(db, "conversations", CONVERSATION_ID);

  const messageObject = {
    sender: sender,
    text: text,
    createdAt: new Date()
  };

  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists()) {

    // create new conversation
    await setDoc(conversationRef, {
      createdAt: serverTimestamp(),
      messages: [messageObject]
    });

  } else {

    // add message to existing conversation
    await updateDoc(conversationRef, {
      messages: arrayUnion(messageObject)
    });

  }

};
