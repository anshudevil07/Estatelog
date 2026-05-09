// Property Visit Scheduling service
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const VISIT_STATUSES = ["Requested", "Confirmed", "Completed", "Cancelled"];

export const visitService = {
  async getAll(role, agentName) {
    let snap;
    if (role === "agent" && agentName) {
      const q = query(collection(db, "visits"), where("agentName", "==", agentName));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, "visits"));
    }
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (a.visitDate?.seconds || 0) - (b.visitDate?.seconds || 0));
  },

  async create(data) {
    const ref = await addDoc(collection(db, "visits"), {
      ...data,
      status: "Requested",
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...data, status: "Requested" };
  },

  async updateStatus(id, status) {
    await updateDoc(doc(db, "visits", id), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  async update(id, data) {
    await updateDoc(doc(db, "visits", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, "visits", id));
  },
};
