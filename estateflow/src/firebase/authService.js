// Firebase Authentication service
// Handles login, signup, logout, and password reset

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

// ─── Login ────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  // Fetch user profile from Firestore (includes role)
  const profile = await getUserProfile(result.user.uid);
  return { uid: result.user.uid, email: result.user.email, ...profile };
}

// ─── Signup ───────────────────────────────────────────────────────────────────
export async function signupUser(name, email, password, role = "agent") {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  const uid = result.user.uid;

  // Save user profile to Firestore
  await setDoc(doc(db, "users", uid), {
    name,
    email,
    role, // "admin" | "manager" | "agent"
    avatar: "",
    phone: "",
    createdAt: serverTimestamp(),
    active: true,
  });

  return { uid, email, name, role };
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ─── Get user profile from Firestore ─────────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// ─── Update user profile ──────────────────────────────────────────────────────
export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ─── Change password ──────────────────────────────────────────────────────────
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}

// ─── Password reset email ─────────────────────────────────────────────────────
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

// ─── Auth state listener ──────────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
