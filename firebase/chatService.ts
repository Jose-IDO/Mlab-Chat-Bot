import { db } from "../services/firebaseConfig";
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  arrayUnion,
  serverTimestamp
} from "firebase/firestore";

export const saveMessage = async (
  userId: string,
  text: string,
  sender: string
) => {

  const conversationRef = doc(
    db,
    "conversations",
    userId
  );

  const messageObject = {
    sender,
    text,
    createdAt: new Date()
  };

  const snap = await getDoc(conversationRef);

  if (!snap.exists()) {

    await setDoc(conversationRef, {
      userId,
      createdAt: serverTimestamp(),
      messages: [messageObject]
    });

  } else {

    await updateDoc(conversationRef, {
      messages: arrayUnion(messageObject)
    });

  }

};
