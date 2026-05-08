// Firestore database service
// All CRUD operations for properties, leads, agents, users

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Convert Firestore doc snapshot to plain JS object
function docToObj(snap) {
  return { id: snap.id, ...snap.data() };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPERTIES
// ═══════════════════════════════════════════════════════════════════════════════

export const propertyService = {
  async getAll() {
    // Simple query — no composite index needed
    const snap = await getDocs(collection(db, "properties"));
    const items = snap.docs.map(docToObj);
    // Sort client-side to avoid needing Firestore index
    return items.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  },

  async getById(id) {
    const snap = await getDoc(doc(db, "properties", id));
    if (!snap.exists()) throw new Error("Property not found");
    return docToObj(snap);
  },

  async create(data) {
    const ref = await addDoc(collection(db, "properties"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await updateDoc(doc(db, "properties", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  },

  async delete(id) {
    await deleteDoc(doc(db, "properties", id));
    return { success: true };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// LEADS
// ═══════════════════════════════════════════════════════════════════════════════

export const leadService = {
  // Get leads — agents only see their own, admin/manager see all
  // Uses simple queries + client-side sort to avoid composite index errors
  async getAll(role, agentName) {
    let snap;

    if (role === "agent" && agentName) {
      // Only filter by assignedTo — no orderBy to avoid composite index requirement
      const q = query(
        collection(db, "leads"),
        where("assignedTo", "==", agentName)
      );
      snap = await getDocs(q);
    } else {
      // Admin/manager — get all leads
      snap = await getDocs(collection(db, "leads"));
    }

    const items = snap.docs.map(docToObj);

    // Sort client-side by createdAt descending
    return items.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  },

  async getById(id) {
    const snap = await getDoc(doc(db, "leads", id));
    if (!snap.exists()) throw new Error("Lead not found");
    return docToObj(snap);
  },

  async create(data) {
    const ref = await addDoc(collection(db, "leads"), {
      ...data,
      createdAt: serverTimestamp(),
      lastContact: serverTimestamp(),
    });
    return { id: ref.id, ...data };
  },

  async update(id, data) {
    await updateDoc(doc(db, "leads", id), {
      ...data,
      lastContact: serverTimestamp(),
    });
    return { id, ...data };
  },

  async delete(id) {
    await deleteDoc(doc(db, "leads", id));
    return { success: true };
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// USERS / AGENTS
// ═══════════════════════════════════════════════════════════════════════════════

export const userService = {
  async getAll() {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map(docToObj);
  },

  async getAgents() {
    const q = query(collection(db, "users"), where("role", "==", "agent"));
    const snap = await getDocs(q);
    return snap.docs.map(docToObj);
  },

  async getById(id) {
    const snap = await getDoc(doc(db, "users", id));
    if (!snap.exists()) throw new Error("User not found");
    return docToObj(snap);
  },

  async update(id, data) {
    await updateDoc(doc(db, "users", id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deactivate(id) {
    await updateDoc(doc(db, "users", id), { active: false });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════

export const analyticsService = {
  async getDashboardStats() {
    const [propertiesSnap, leadsSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, "properties")),
      getDocs(collection(db, "leads")),
      getDocs(query(collection(db, "users"), where("role", "==", "agent"))),
    ]);

    const properties = propertiesSnap.docs.map(docToObj);
    const leads = leadsSnap.docs.map(docToObj);

    const soldProperties = properties.filter((p) => p.status === "Sold");
    const totalRevenue = soldProperties.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    return {
      totalProperties: properties.length,
      activeLeads: leads.filter((l) => l.status !== "Closed").length,
      monthlyRevenue: totalRevenue,
      totalSales: soldProperties.length,
      totalAgents: usersSnap.size,
    };
  },
};
