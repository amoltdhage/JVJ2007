import { firestore } from './firebase';

// Add or update document without overwriting existing fields
export const addCollection = async (collectionName, id, data) => {
  await firestore()
    .collection(collectionName)
    .doc(id)
    .set(data, { merge: true });
};

// Fetch a document
export const fetchCollection = async (collectionName, id) => {
  const doc = await firestore().collection(collectionName).doc(id).get();
  return doc.exists ? doc.data() : null; // return null if not found
};

// Update specific fields
export const updateCollection = async (collectionName, id, data) => {
  await firestore().collection(collectionName).doc(id).update(data);
};

// Delete a document
export const deleteCollection = async (collectionName, id) => {
  await firestore().collection(collectionName).doc(id).delete();
};

const MAIN_GROUP_ID = 'attending_group'; // fixed group id

export const ensureUserInGroup = async userId => {
  try {
    const groupRef = firestore().collection('groups').doc(MAIN_GROUP_ID);
    const groupDoc = await fetchCollection('groups', MAIN_GROUP_ID);

    if (!groupDoc) {
      await groupRef.set({
        id: MAIN_GROUP_ID,
        name: 'Attending Group',
        members: [userId],
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      const members = groupDoc.members || [];
      if (!members.includes(userId)) {
        await groupRef.update({ members: [...members, userId] });
      }
    }

    console.log("main: ", MAIN_GROUP_ID);
    return MAIN_GROUP_ID;

  } catch (err) {
    console.error("Error in ensureUserInGroup:", err);
    return null;
  }
};


export const sendMessage = async (groupId, userData, text) => {
  const messageRef = firestore()
    .collection('groups')
    .doc(groupId)
    .collection('messages')
    .doc();

  await messageRef.set({
    id: messageRef.id,
    text,
    senderId: userData?.id,
    createdAt: new Date(),
    senderName: userData?.firstName + " " + userData?.lastName
  });
};

export const editMessage = async (groupId, messageId, newText) => {
  await firestore()
    .collection('groups')
    .doc(groupId)
    .collection('messages')
    .doc(messageId)
    .update({
      text: newText,
      updateDate: new Date(),
      edited: true,
    });
};

export const deleteMessage = async (groupId, messageId) => {
  await firestore()
    .collection('groups')
    .doc(groupId)
    .collection('messages')
    .doc(messageId)
    .delete();
};
