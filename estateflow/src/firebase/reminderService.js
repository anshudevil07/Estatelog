// Follow-up Reminder service
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const reminderService = {
  // Get reminders for a user
  async getAll(uid) {
    const q = query(collection(db, "reminders"), where("createdBy", "==", uid));
    const snap = await getDocs(q);
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (a.dueDate?.seconds || 0) - (b.dueDate?.seconds || 0));
  },

  async create(data, uid) {
    const ref = await addDoc(collection(db, "reminders"), {
      ...data,
      createdBy: uid,
      completed: false,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...data, completed: false };
  },

  async markComplete(id) {
    await updateDoc(doc(db, "reminders", id), {
      completed: true,
      completedAt: serverTimestamp(),
    });
  },

  async markIncomplete(id) {
    await updateDoc(doc(db, "reminders", id), { completed: false });
  },

  async delete(id) {
    await deleteDoc(doc(db, "reminders", id));
  },

  async update(id, data) {
    await updateDoc(doc(db, "reminders", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};
