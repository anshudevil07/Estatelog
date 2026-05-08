import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiUsers, HiCheckCircle, HiClock, HiPlus,
  HiPhone, HiMail, HiRefresh, HiExclamationCircle,
} from "react-icons/hi";
import { leadService } from "../../firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";
import StatusBadge from "../../components/common/StatusBadge";
import { StatsCardSkeleton } from "../../components/common/SkeletonLoader";
import Button from "../../components/common/Button";

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadLeads = useCallback(async (silent = false) => {
    // Wait until user profile is fully loaded with a name
    if (!user?.uid) return;

    // user.name might be undefined if Firestore profile hasn't loaded yet
    // In that case we still fetch — just with empty name (returns empty, which is correct)
    const agentName = user?.name || "";

    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await leadService.getAll("agent", agentName);
      setLeads(data);
    } catch (err) {
      console.error("AgentDashboard loadLeads error:", err);
      setError(err.message || "Failed to load leads");
      setLeads([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, user?.name]);

  // Load when user profile is ready
  useEffect(() => {
    if (user?.uid) {
      loadLeads();
    }
  }, [loadLeads]);

  // Re-fetch silently when navigating back to this page
  useEffect(() => {
    if (user?.uid && !loading) {
      loadLeads(true);
    }
  }, [location.pathname]);

  const myStats = {
    total: leads.length,
    new: leads.filter((l) => l.status === "New").length,
    interested: leads.filter((l) => l.status === "Interested").length,
    closed: leads.filter((l) => l.status === "Closed").length,
  };

  const statCards = [
    {
      label: "My Leads",
      value: myStats.total,
      color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
      icon: <HiUsers className="w-5 h-5" />,
    },
    {
      label: "New",
      value: myStats.new,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      icon: <HiPlus className="w-5 h-5" />,
    },
    {
      label: "Interested",
      value: myStats.interested,
      color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
      icon: <HiClock className="w-5 h-5" />,
    },
    {
      label: "Closed",
      value: myStats.closed,
      color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
      icon: <HiCheckCircle className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome, <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name || "Agent"}</span>.
            {" "}Showing leads assigned to you.
          </p>
        </div>
        <button
          onClick={() => loadLeads(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
        >
          <HiRefresh className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <HiExclamationCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load leads</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => loadLeads()}
            className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => navigate("/agent/leads")}>
          Add New Lead
        </Button>
        <Button variant="secondary" onClick={() => navigate("/agent/leads")}>
          View All My Leads
        </Button>
      </div>

      {/* Leads list */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            My Assigned Leads
          </h3>
          <span className="text-xs text-slate-400">
            {refreshing ? "Updating..." : `${leads.length} total`}
          </span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <HiUsers className="w-7 h-7 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium text-sm mb-1">
              No leads yet
            </p>
            <p className="text-slate-400 text-xs mb-5">
              Add a lead or ask your manager to assign one to you.
            </p>
            <Button
              icon={<HiPlus className="w-4 h-4" />}
              onClick={() => navigate("/agent/leads")}
            >
              Add Your First Lead
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {leads.slice(0, 8).map((lead) => (
              <li
                key={lead.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {lead.name}
                    </p>
                    <StatusBadge status={lead.status} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {lead.propertyInterest || "—"} · {lead.budget || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={`mailto:${lead.email}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                    title={`Email ${lead.name}`}
                  >
                    <HiMail className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    title={`Call ${lead.name}`}
                  >
                    <HiPhone className="w-4 h-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}

        {leads.length > 8 && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => navigate("/agent/leads")}
              className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline"
            >
              View all {leads.length} leads →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
