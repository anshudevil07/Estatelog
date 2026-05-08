import { createContext, useContext, useState, useEffect } from "react";
import { onAuthChange, loginUser, signupUser, logoutUser, getUserProfile, updateUserProfile } from "../firebase/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get full profile (including role) from Firestore
          const profile = await getUserProfile(firebaseUser.uid);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...profile,
          });
        } catch {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, role: "agent" });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function login(email, password) {
    const userData = await loginUser(email, password);
    setUser(userData);
    return userData;
  }

  async function signup(name, email, password, role = "agent") {
    const userData = await signupUser(name, email, password, role);
    setUser(userData);
    return userData;
  }

  async function logout() {
    await logoutUser();
    setUser(null);
  }

  async function updateUser(updates) {
    if (!user?.uid) return;
    await updateUserProfile(user.uid, updates);
    setUser((prev) => ({ ...prev, ...updates }));
  }

  // Role helpers — use these throughout the app
  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isAgent = user?.role === "agent";
  const isAdminOrManager = isAdmin || isManager;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateUser,
      isAdmin,
      isManager,
      isAgent,
      isAdminOrManager,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
