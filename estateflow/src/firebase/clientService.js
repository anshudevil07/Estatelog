// Client Management service
import {
  collection, doc, getDocs, getDoc, addDoc,
  updateDoc, deleteDoc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const clientService = {
  async getAll(role, agentName) {
    let snap;
    if (role === "agent" && agentName) {
      const q = query(collection(db, "clients"), where("assignedTo", "==", agentName));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, "clients"));
    }
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  async getById(id) {
    const snap = await getDoc(doc(db, "clients", id));
    if (!snap.exists()) throw new Error("Client not found");
    return docToObj(snap);
  },

  async create(data) {
    const ref = await addDoc(collection(db, "clients"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await updateDoc(doc(db, "clients", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  },

  async delete(id) {
    await deleteDoc(doc(db, "clients", id));
  },
};
