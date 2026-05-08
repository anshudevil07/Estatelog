import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMenu, HiBell, HiLogout, HiCog, HiUser } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import ThemeToggle from "./ThemeToggle";
import Breadcrumbs from "./Breadcrumbs";
import { getInitials } from "../../utils/formatters";

const notifications = [
  { id: 1, text: "New lead: Sophia Chen assigned to you", time: "2h ago", unread: true },
  { id: 2, text: "Property 'Sunset Ridge Villa' has a new inquiry", time: "4h ago", unread: true },
  { id: 3, text: "James Carter closed a deal — $1.25M", time: "1d ago", unread: false },
  { id: 4, text: "Monthly report is ready to view", time: "2d ago", unread: false },
];

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount] = useState(notifications.filter((n) => n.unread).length);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLogout() {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-4 sticky top-0 z-20">
      {/* Hamburger — mobile */}
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

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((p) => !p); setProfileOpen(false); }}
            className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <HiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Notifications</h3>
                <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${n.unread ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300">{n.text}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                  </li>
                ))}
              </ul>
              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                <button className="text-xs text-violet-600 dark:text-violet-400 font-medium hover:underline">
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
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
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HiUser className="w-4 h-4" />
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <HiCog className="w-4 h-4" />
                    Settings
                  </button>
                </li>
              </ul>
              <div className="border-t border-slate-100 dark:border-slate-800 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiLogout className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
