import { useEffect, useState } from "react";
import { firestore } from "../Services/firebase"; // ✅ RN Firebase instance

export const useGroupMessages = (groupId) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = firestore()
      .collection("groups")
      .doc(groupId)
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot((querySnapshot) => {
        const msgs = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            ...data,
            edited: data.edited || false,
          };
        });
        setMessages(msgs);
      });

    return () => unsubscribe();
  }, [groupId]);

  return messages;
};