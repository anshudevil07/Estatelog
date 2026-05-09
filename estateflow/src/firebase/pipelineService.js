// Deal Pipeline service — Kanban board for lead stages
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

const STAGES = ["New Lead", "Site Visit", "Negotiation", "Agreement", "Closed"];

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export { STAGES };

export const pipelineService = {
  // Get all deals — agents see only theirs
  async getAll(role, agentName) {
    let snap;
    if (role === "agent" && agentName) {
      const q = query(collection(db, "pipeline"), where("assignedTo", "==", agentName));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(collection(db, "pipeline"));
    }
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
  },

  async create(data) {
    const ref = await addDoc(collection(db, "pipeline"), {
      ...data,
      stage: data.stage || "New Lead",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, ...data };
  },

  async updateStage(id, stage) {
    await updateDoc(doc(db, "pipeline", id), {
      stage,
      updatedAt: serverTimestamp(),
    });
  },

  async update(id, data) {
    await updateDoc(doc(db, "pipeline", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, "pipeline", id));
  },
};
