// Client notes/timeline service — activity log per client
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const clientNoteService = {
  async getByClient(clientId) {
    const q = query(collection(db, "clientNotes"), where("clientId", "==", clientId));
    const snap = await getDocs(q);
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  async create(clientId, text, type = "note", addedBy = "") {
    const ref = await addDoc(collection(db, "clientNotes"), {
      clientId,
      text,
      type, // "note" | "call" | "meeting" | "email" | "payment" | "visit"
      addedBy,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, clientId, text, type, addedBy };
  },

  async delete(id) {
    await deleteDoc(doc(db, "clientNotes", id));
  },
};
