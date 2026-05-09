import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiBell, HiLogout, HiCog, HiUser, HiCheck, HiTranslate } from "react-icons/hi";
import { ImSpinner8 } from "react-icons/im";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { useNotifications } from "../../context/NotificationContext";
import { useLanguage } from "../../context/LanguageContext";
import { NOTIF_ICONS } from "../../firebase/notificationService";
import ThemeToggle from "./ThemeToggle";
import Breadcrumbs from "./Breadcrumbs";
import { getInitials, formatDate } from "../../utils/formatters";

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading: notifLoading, readOne, readAll } = useNotifications();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  function handleNotifClick(notif) {
    if (!notif.read) readOne(notif.id);
  }

  function getNotifRole(role) {
    if (!user) return "/dashboard";
    return `/${user.role}/dashboard`;
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 sticky top-0 z-20">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Open menu"
      >
        <HiMenu className="w-5 h-5" />
      </button>

      {/* Breadcrumbs */}
      <div className="flex-1 hidden sm:block">
        <Breadcrumbs />
      </div>
      <div className="flex-1 sm:hidden" />

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Language toggle */}
        <button
          onClick={() => { toggleLanguage(); toast.info(lang === "en" ? "भाषा हिंदी में बदली" : "Language changed to English"); }}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
          title={lang === "en" ? "Switch to Hindi" : "Switch to English"}
        >
          <HiTranslate className="w-4 h-4" />
          <span className="text-xs font-semibold hidden sm:inline">{lang === "en" ? "हिं" : "EN"}</span>
        </button>

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <HiBell className="w-5 h-5" />
            {/* Live unread badge */}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={readAll}
                    className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
                  >
                    <HiCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notification list */}
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
                {notifLoading ? (
                  <li className="flex items-center justify-center py-8">
                    <ImSpinner8 className="w-5 h-5 text-violet-500 animate-spin" />
                  </li>
                ) : notifications.length === 0 ? (
                  <li className="py-10 text-center">
                    <p className="text-sm text-slate-400">No notifications yet</p>
                    <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                      Activity will appear here in real-time
                    </p>
                  </li>
                ) : (
                  notifications.map((notif) => (
                    <li
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`px-4 py-3 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${
                        !notif.read
                          ? "bg-violet-50/60 dark:bg-violet-900/10 border-l-2 border-violet-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <span className="text-lg shrink-0 mt-0.5">
                          {NOTIF_ICONS[notif.type] || "🔔"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.read ? "font-medium text-slate-800 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {notif.triggeredBy && (
                              <span className="text-xs text-slate-400">
                                by {notif.triggeredBy}
                              </span>
                            )}
                            <span className="text-xs text-slate-300 dark:text-slate-600">
                              {notif.createdAt
                                ? formatDate(notif.createdAt)
                                : "Just now"}
                            </span>
                          </div>
                        </div>
                        {/* Unread dot */}
                        {!notif.read && (
                          <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-1.5" />
                        )}
                      </div>
                    </li>
                  ))
                )}
              </ul>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <p className="text-xs text-slate-400 text-center">
                    Showing last {notifications.length} notifications · Updates in real-time
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile dropdown ── */}
        <div className="relative ml-1" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen((p) => !p); setNotifOpen(false); }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Profile menu"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user?.name)}
                </div>
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800 dark:text-white leading-tight">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 capitalize">
                  {user?.role}
                </span>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => { navigate(`/${user?.role}/settings`); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HiUser className="w-4 h-4" /> My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate(`/${user?.role}/settings`); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HiCog className="w-4 h-4" /> Settings
                  </button>
                </li>
              </ul>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiLogout className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
