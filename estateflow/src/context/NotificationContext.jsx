// Real-time notification context
// Uses Firestore onSnapshot — updates instantly for all logged-in users

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { subscribeToNotifications, markAsRead, markAllAsRead } from "../firebase/notificationService";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    // Clean up previous listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!user?.role) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Start real-time listener
    const unsub = subscribeToNotifications(user.role, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    unsubscribeRef.current = unsub;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.uid, user?.role]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function readOne(id) {
    await markAsRead(id);
  }

  async function readAll() {
    await markAllAsRead(user?.role);
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      readOne,
      readAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
