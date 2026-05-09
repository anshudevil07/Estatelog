import { useState, useEffect } from "react";
import { HiFilter, HiRefresh } from "react-icons/hi";
import { reportService } from "../firebase/reportService";
import { NOTIF_ICONS } from "../firebase/notificationService";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import EmptyState from "../components/common/EmptyState";

const TYPE_LABELS = {
  lead_added: "Lead Added",
  lead_updated: "Lead Updated",
  lead_assigned: "Lead Assigned",
  lead_closed: "Lead Closed",
  property_added: "Property Added",
  property_updated: "Property Updated",
  property_sold: "Property Sold",
  property_deleted: "Property Deleted",
};

const TYPE_COLORS = {
  lead_added: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
  lead_updated: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  lead_assigned: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400",
  lead_closed: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  property_added: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  property_updated: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  property_sold: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  property_deleted: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
};

export default function ActivityLogPage() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [limit, setLimit] = useState(50);

  useEffect(() => { loadLog(); }, [limit]);

  async function loadLog() {
    setLoading(true);
    try {
      const data = await reportService.getActivityLog(limit);
      setActivities(data);
    } catch { toast.error("Failed to load activity log"); }
    finally { setLoading(false); }
  }

  const filtered = activities.filter(a => {
    const matchSearch = !search || a.message?.toLowerCase().includes(search.toLowerCase()) || a.triggeredBy?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by date
  const grouped = {};
  filtered.forEach(a => {
    const date = a.createdAt?.toDate
      ? a.createdAt.toDate().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
      : "Unknown date";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(a);
  });

  const uniqueTypes = [...new Set(activities.map(a => a.type).filter(Boolean))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Activity Log</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Complete audit trail of all actions — {activities.length} entries
          </p>
        </div>
        <button onClick={loadLog} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
          <HiRefresh className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by message or user..." className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setTypeFilter("all")}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${typeFilter === "all" ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
            All Types
          </button>
          {uniqueTypes.map(type => (
            <button key={type} onClick={() => setTypeFilter(type)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${typeFilter === type ? "bg-violet-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"}`}>
              {TYPE_LABELS[type] || type}
            </button>
          ))}
        </div>
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No activity found" description="Actions like adding leads, properties, and closing deals will appear here." />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {date}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>

              {/* Activity items */}
              <div className="space-y-2">
                {items.map(activity => {
                  const time = activity.createdAt?.toDate
                    ? activity.createdAt.toDate().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <div key={activity.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex items-start gap-3 hover:shadow-sm transition-shadow">
                      {/* Icon */}
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-lg shrink-0 mt-0.5">
                        {NOTIF_ICONS[activity.type] || "🔔"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-snug">{activity.message}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {activity.type && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[activity.type] || "bg-slate-100 text-slate-600"}`}>
                              {TYPE_LABELS[activity.type] || activity.type}
                            </span>
                          )}
                          {activity.triggeredBy && (
                            <span className="text-xs text-slate-400">by {activity.triggeredBy}</span>
                          )}
                          {time && (
                            <span className="text-xs text-slate-300 dark:text-slate-600">{time}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Load more */}
          {activities.length >= limit && (
            <div className="text-center">
              <button onClick={() => setLimit(l => l + 50)}
                className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Load more entries
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
