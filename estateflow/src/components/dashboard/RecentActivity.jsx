// RecentActivity — reads real-time data from Firestore notifications
// Used on Admin and Manager dashboards

import { useNavigate } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import { useNotifications } from "../../context/NotificationContext";
import { NOTIF_ICONS } from "../../firebase/notificationService";
import { formatDate } from "../../utils/formatters";

// Skeleton row for loading state
function ActivitySkeleton() {
  return (
    <li className="px-5 py-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
      </div>
    </li>
  );
}

export default function RecentActivity({ limit = 6, role = "admin" }) {
  const { notifications, loading } = useNotifications();
  const navigate = useNavigate();

  // Show only the most recent N notifications
  const activities = notifications.slice(0, limit);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            Recent Activity
          </h3>
          {/* Live indicator dot */}
          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
        <button
          onClick={() => navigate(`/${role}/analytics`)}
          className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline font-medium"
        >
          View all <HiArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Activity list */}
      <ul className="divide-y divide-slate-100 dark:divide-slate-700">
        {loading ? (
          // Skeleton while loading
          Array.from({ length: 4 }).map((_, i) => <ActivitySkeleton key={i} />)
        ) : activities.length === 0 ? (
          // Empty state
          <li className="px-5 py-10 text-center">
            <p className="text-sm text-slate-400">No activity yet</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              Actions like adding leads or properties will appear here
            </p>
          </li>
        ) : (
          activities.map((activity) => (
            <li
              key={activity.id}
              className={`px-5 py-3 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                !activity.read ? "bg-violet-50/40 dark:bg-violet-900/5" : ""
              }`}
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base shrink-0 mt-0.5">
                {NOTIF_ICONS[activity.type] || "🔔"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug truncate ${
                  !activity.read
                    ? "font-medium text-slate-800 dark:text-white"
                    : "text-slate-600 dark:text-slate-400"
                }`}>
                  {activity.message}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  {activity.triggeredBy && (
                    <span className="text-xs text-slate-400">
                      by {activity.triggeredBy}
                    </span>
                  )}
                  <span className="text-xs text-slate-300 dark:text-slate-600">
                    · {activity.createdAt ? formatDate(activity.createdAt) : "Just now"}
                  </span>
                </div>
              </div>

              {/* Unread dot */}
              {!activity.read && (
                <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-2" />
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
