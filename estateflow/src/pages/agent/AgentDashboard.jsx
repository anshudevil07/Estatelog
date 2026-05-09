import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HiUsers, HiCheckCircle, HiClock, HiPlus,
  HiPhone, HiMail, HiRefresh, HiExclamationCircle,
  HiUserCircle, HiEye,
} from "react-icons/hi";
import { leadService } from "../../firebase/firestoreService";
import { clientService } from "../../firebase/clientService";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/formatters";
import StatusBadge from "../../components/common/StatusBadge";
import { StatsCardSkeleton } from "../../components/common/SkeletonLoader";
import Button from "../../components/common/Button";

export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (silent = false) => {
    if (!user?.uid) return;
    const agentName = user?.name || "";

    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      // Load both leads and clients assigned to this agent in parallel
      const [leadsData, clientsData] = await Promise.all([
        leadService.getAll("agent", agentName),
        clientService.getAll("agent", agentName),
      ]);
      setLeads(leadsData);
      setClients(clientsData);
    } catch (err) {
      console.error("AgentDashboard load error:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid, user?.name]);

  useEffect(() => {
    if (user?.uid) loadData();
  }, [loadData]);

  // Silent refresh when navigating back to dashboard
  useEffect(() => {
    if (user?.uid && !loading) loadData(true);
  }, [location.pathname]);

  const myStats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "New").length,
    interestedLeads: leads.filter(l => l.status === "Interested").length,
    closedLeads: leads.filter(l => l.status === "Closed").length,
    totalClients: clients.length,
  };

  const statCards = [
    { label: "My Leads", value: myStats.totalLeads, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400", icon: <HiUsers className="w-5 h-5" /> },
    { label: "My Clients", value: myStats.totalClients, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", icon: <HiUserCircle className="w-5 h-5" /> },
    { label: "Interested", value: myStats.interestedLeads, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400", icon: <HiClock className="w-5 h-5" /> },
    { label: "Closed", value: myStats.closedLeads, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", icon: <HiCheckCircle className="w-5 h-5" /> },
  ];

  const typeColors = {
    Buyer: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    Seller: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
    Investor: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    Tenant: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome, <span className="font-medium text-slate-700 dark:text-slate-300">{user?.name || "Agent"}</span>.
            {" "}Showing your assigned leads and clients.
          </p>
        </div>
        <button
          onClick={() => loadData(true)}
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
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Failed to load data</p>
            <p className="text-xs text-red-500 mt-0.5">{error}</p>
          </div>
          <button onClick={() => loadData()} className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          statCards.map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button icon={<HiPlus className="w-4 h-4" />} onClick={() => navigate("/agent/leads")}>Add Lead</Button>
        <Button variant="secondary" icon={<HiPlus className="w-4 h-4" />} onClick={() => navigate("/agent/clients")}>Add Client</Button>
        <Button variant="secondary" onClick={() => navigate("/agent/leads")}>View All Leads</Button>
        <Button variant="secondary" onClick={() => navigate("/agent/clients")}>View All Clients</Button>
      </div>

      {/* Two column layout — Leads + Clients */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* ── My Assigned Leads ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <HiUsers className="w-4 h-4 text-violet-500" /> My Leads
            </h3>
            <span className="text-xs text-slate-400">{refreshing ? "Updating..." : `${leads.length} total`}</span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-slate-400 text-sm mb-3">No leads assigned yet</p>
              <Button size="sm" icon={<HiPlus className="w-3.5 h-3.5" />} onClick={() => navigate("/agent/leads")}>Add Lead</Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {leads.slice(0, 6).map(lead => (
                <li key={lead.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{lead.name}</p>
                      <StatusBadge status={lead.status} />
                    </div>
                    <p className="text-xs text-slate-400 truncate">{lead.propertyInterest || "—"} · {lead.budget || "—"}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <a href={`mailto:${lead.email}`} className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"><HiMail className="w-3.5 h-3.5" /></a>
                    <a href={`tel:${lead.phone}`} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><HiPhone className="w-3.5 h-3.5" /></a>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {leads.length > 6 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => navigate("/agent/leads")} className="text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline">
                View all {leads.length} leads →
              </button>
            </div>
          )}
        </div>

        {/* ── My Assigned Clients ── */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <HiUserCircle className="w-4 h-4 text-blue-500" /> My Clients
            </h3>
            <span className="text-xs text-slate-400">{refreshing ? "Updating..." : `${clients.length} total`}</span>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : clients.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-slate-400 text-sm mb-1">No clients assigned yet</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mb-3">
                Ask your admin or manager to assign clients to you
              </p>
              <Button size="sm" icon={<HiPlus className="w-3.5 h-3.5" />} onClick={() => navigate("/agent/clients")}>Add Client</Button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {clients.slice(0, 6).map(client => (
                <li key={client.id} className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">{getInitials(client.name)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{client.name}</p>
                        {client.type && (
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${typeColors[client.type] || "bg-slate-100 text-slate-600"}`}>
                            {client.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{client.propertyInterest || "—"} · {client.budget || "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={() => navigate(`/agent/clients/${client.id}`)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                      title="View profile"
                    >
                      <HiEye className="w-3.5 h-3.5" />
                    </button>
                    {client.phone && (
                      <a href={`tel:${client.phone}`} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><HiPhone className="w-3.5 h-3.5" /></a>
                    )}
                    {client.email && (
                      <a href={`mailto:${client.email}`} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><HiMail className="w-3.5 h-3.5" /></a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {clients.length > 6 && (
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => navigate("/agent/clients")} className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
                View all {clients.length} clients →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
