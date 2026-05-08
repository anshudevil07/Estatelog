// Firebase configuration for EstateFlow
// Project: estateflow-e2ae9

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWFZgyzqn3bHmti8_wuq9tdn87TJCOjEk",
  authDomain: "estateflow-e2ae9.firebaseapp.com",
  projectId: "estateflow-e2ae9",
  storageBucket: "estateflow-e2ae9.firebasestorage.app",
  messagingSenderId: "352190440178",
  appId: "1:352190440178:web:4ee84790e971f35ced666b",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Auth instance — used for login/signup/logout
export const auth = getAuth(app);

// Firestore instance — used for all database operations
export const db = getFirestore(app);

export default app;
