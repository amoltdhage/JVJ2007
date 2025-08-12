import { firestore } from "./firebase";

// Add or update document without overwriting existing fields
export const addCollection = async (collectionName, id, data) => {
  await firestore().collection(collectionName).doc(id).set(data, { merge: true });
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