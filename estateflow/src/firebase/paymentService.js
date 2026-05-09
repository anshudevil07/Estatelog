// Payment tracking service for clients
import {
  collection, doc, getDocs, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

export const PAYMENT_STATUSES = ["Paid", "Pending", "Overdue", "Partial"];

export const paymentService = {
  // Get all payments for a client
  async getByClient(clientId) {
    const q = query(
      collection(db, "payments"),
      where("clientId", "==", clientId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map(docToObj);
    return items.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  },

  async create(data) {
    const ref = await addDoc(collection(db, "payments"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await updateDoc(doc(db, "payments", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id) {
    await deleteDoc(doc(db, "payments", id));
  },

  // Compute payment summary for a client
  getSummary(payments) {
    const total = payments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const paid = payments
      .filter(p => p.status === "Paid")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const pending = payments
      .filter(p => p.status === "Pending" || p.status === "Partial")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const overdue = payments
      .filter(p => p.status === "Overdue")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    return { total, paid, pending, overdue, balance: total - paid };
  },
};
