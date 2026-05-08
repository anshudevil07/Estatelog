import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiMail, HiPhone, HiStar, HiLocationMarker, HiBriefcase, HiPlus } from "react-icons/hi";
import { agentService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getInitials } from "../utils/formatters";
import SearchBar from "../components/common/SearchBar";
import { AgentCardSkeleton } from "../components/common/SkeletonLoader";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

export default function AgentsPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    agentService.getAll().then((data) => {
      setAgents(data);
      setLoading(false);
    });
  }, []);

  const filtered = agents.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.location.toLowerCase().includes(q) || a.specialization.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{agents.length} agents on your team</p>
        </div>
        <div className="flex items-center gap-2">
          <SearchBar value={search} onChange={setSearch} placeholder="Search agents..." className="sm:w-64" />
          {/* Only Admin can add team members */}
          {isAdmin && (
            <Button
              icon={<HiPlus className="w-4 h-4" />}
              onClick={() => navigate("/admin/agents/add")}
            >
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Team stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Agents", value: agents.length },
            { label: "Total Sales", value: agents.reduce((s, a) => s + a.salesCount, 0) },
            { label: "Active Deals", value: agents.reduce((s, a) => s + a.activeDeals, 0) },
            { label: "Total Revenue", value: formatCurrency(agents.reduce((s, a) => s + a.revenue, 0)) },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Agent cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <AgentCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No agents found" description="Try a different search term." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }) {
  const roleColors = {
    "Senior Agent": "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400",
    "Agent": "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    "Junior Agent": "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
      {/* Avatar + name */}
      <div className="flex flex-col items-center text-center mb-5">
        <div className="relative mb-3">
          {agent.avatar ? (
            <img src={agent.avatar} alt={agent.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 dark:ring-slate-700" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center ring-4 ring-slate-100 dark:ring-slate-700">
              <span className="text-white text-xl font-bold">{getInitials(agent.name)}</span>
            </div>
          )}
          {/* Online indicator */}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{agent.name}</h3>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mt-1 ${roleColors[agent.role] || roleColors["Agent"]}`}>
          {agent.role}
        </span>
      </div>

      {/* Location + specialization */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center">
          <HiLocationMarker className="w-3.5 h-3.5 shrink-0" />
          <span>{agent.location}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 justify-center">
          <HiBriefcase className="w-3.5 h-3.5 shrink-0" />
          <span>{agent.specialization}</span>
        </div>
      </div>

      {/* Performance metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
        <div className="text-center">
          <p className="text-base font-bold text-slate-900 dark:text-white">{agent.salesCount}</p>
          <p className="text-xs text-slate-400">Sales</p>
        </div>
        <div className="text-center border-x border-slate-200 dark:border-slate-600">
          <p className="text-base font-bold text-slate-900 dark:text-white">{agent.activeDeals}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-slate-900 dark:text-white">{formatCurrency(agent.revenue)}</p>
          <p className="text-xs text-slate-400">Revenue</p>
        </div>
      </div>

      {/* Rating */}
      <div className="flex items-center justify-center gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <HiStar key={i} className={`w-4 h-4 ${i < Math.floor(agent.rating) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}`} />
        ))}
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{agent.rating}</span>
      </div>

      {/* Contact buttons */}
      <div className="flex gap-2">
        <a
          href={`mailto:${agent.email}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <HiMail className="w-3.5 h-3.5" /> Email
        </a>
        <a
          href={`tel:${agent.phone}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <HiPhone className="w-3.5 h-3.5" /> Call
        </a>
      </div>
    </div>
  );
}
