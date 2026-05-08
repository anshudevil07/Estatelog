// Real-time notification service using Firestore onSnapshot
// Notifications are written when key actions happen across the app

import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  writeBatch,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Notification types and their icons (used in UI)
export const NOTIF_TYPES = {
  LEAD_ADDED: "lead_added",
  LEAD_UPDATED: "lead_updated",
  LEAD_ASSIGNED: "lead_assigned",
  LEAD_CLOSED: "lead_closed",
  PROPERTY_ADDED: "property_added",
  PROPERTY_UPDATED: "property_updated",
  PROPERTY_SOLD: "property_sold",
  PROPERTY_DELETED: "property_deleted",
};

export const NOTIF_ICONS = {
  lead_added: "👤",
  lead_updated: "✏️",
  lead_assigned: "🤝",
  lead_closed: "✅",
  property_added: "🏠",
  property_updated: "📝",
  property_sold: "💰",
  property_deleted: "🗑️",
};

// ─── Write a notification to Firestore ───────────────────────────────────────
export async function createNotification({ type, message, triggeredBy, targetRole = "all" }) {
  try {
    await addDoc(collection(db, "notifications"), {
      type,
      message,
      triggeredBy,   // name of the user who did the action
      targetRole,    // "all" | "admin" | "manager" | "agent"
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // Notification failure should never break the main action
    console.warn("Failed to create notification:", err.message);
  }
}

// ─── Listen to real-time notifications ───────────────────────────────────────
// Returns an unsubscribe function — call it on component unmount
export function subscribeToNotifications(userRole, callback) {
  // Fetch last 20 notifications relevant to this user's role
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(q, (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Filter: show "all" notifications + role-specific ones
    const filtered = all.filter(
      (n) => n.targetRole === "all" || n.targetRole === userRole
    );

    callback(filtered);
  });
}

// ─── Mark a single notification as read ──────────────────────────────────────
export async function markAsRead(notificationId) {
  try {
    await updateDoc(doc(db, "notifications", notificationId), { read: true });
  } catch (err) {
    console.warn("markAsRead failed:", err.message);
  }
}

// ─── Mark all notifications as read ──────────────────────────────────────────
export async function markAllAsRead(userRole) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("read", "==", false)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (err) {
    console.warn("markAllAsRead failed:", err.message);
  }
}
