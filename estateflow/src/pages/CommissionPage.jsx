import { useState, useEffect } from "react";
import { HiCurrencyRupee, HiUser, HiChevronDown, HiChevronUp, HiPencil, HiCheck } from "react-icons/hi";
import { reportService } from "../firebase/reportService";
import { userService } from "../firebase/firestoreService";
import { useToast } from "../context/ToastContext";
import { formatCurrency, formatFullCurrency, getInitials } from "../utils/formatters";
import EmptyState from "../components/common/EmptyState";
import { StatsCardSkeleton } from "../components/common/SkeletonLoader";

export default function CommissionPage() {
  const toast = useToast();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [editingRate, setEditingRate] = useState(null);
  const [rateInput, setRateInput] = useState("");

  useEffect(() => { loadCommissions(); }, []);

  async function loadCommissions() {
    setLoading(true);
    try {
      const data = await reportService.getCommissions();
      setCommissions(data);
    } catch { toast.error("Failed to load commissions"); }
    finally { setLoading(false); }
  }

  async function handleSaveRate(agentId) {
    const rate = parseFloat(rateInput);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      toast.error("Enter a valid rate between 0 and 100");
      return;
    }
    try {
      await userService.update(agentId, { commissionRate: rate });
      toast.success("Commission rate updated");
      setEditingRate(null);
      loadCommissions();
    } catch { toast.error("Failed to update rate"); }
  }

  const totalCommission = commissions.reduce((s, a) => s + a.commission, 0);
  const totalRevenue = commissions.reduce((s, a) => s + a.totalRevenue, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Commission Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Track agent commissions on closed deals
        </p>
      </div>

      {/* Summary */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => <StatsCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Revenue (Closed Deals)", value: formatCurrency(totalRevenue), color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
            { label: "Total Commission Payable", value: formatCurrency(totalCommission), color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Agents with Closed Deals", value: commissions.filter(a => a.closedDeals > 0).length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl p-5 border border-slate-200 dark:border-slate-700 ${stat.bg}`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Commission table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
      ) : commissions.length === 0 ? (
        <EmptyState title="No commission data" description="Commissions appear when agents close deals in the pipeline." />
      ) : (
        <div className="space-y-3">
          {commissions.map(agent => (
            <div key={agent.agentId} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Agent row */}
              <div className="p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.agentName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <span className="text-violet-600 text-xs font-bold">{getInitials(agent.agentName)}</span>
                    </div>
                  )}
                </div>

                {/* Name + email */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">{agent.agentName}</p>
                  <p className="text-xs text-slate-400 truncate">{agent.email}</p>
                </div>

                {/* Commission rate — editable */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Rate:</span>
                  {editingRate === agent.agentId ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="number" value={rateInput}
                        onChange={e => setRateInput(e.target.value)}
                        className="w-16 text-xs rounded-lg border border-violet-400 px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                        min="0" max="100" step="0.5"
                      />
                      <span className="text-xs text-slate-500">%</span>
                      <button onClick={() => handleSaveRate(agent.agentId)}
                        className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-200 transition-colors">
                        <HiCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{agent.commissionRate}%</span>
                      <button onClick={() => { setEditingRate(agent.agentId); setRateInput(String(agent.commissionRate)); }}
                        className="p-1 rounded text-slate-400 hover:text-violet-600 transition-colors">
                        <HiPencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{agent.closedDeals}</p>
                    <p className="text-xs text-slate-400">Deals</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{formatCurrency(agent.totalRevenue)}</p>
                    <p className="text-xs text-slate-400">Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(agent.commission)}</p>
                    <p className="text-xs text-slate-400">Commission</p>
                  </div>
                </div>

                {/* Expand toggle */}
                {agent.deals.length > 0 && (
                  <button onClick={() => setExpanded(expanded === agent.agentId ? null : agent.agentId)}
                    className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0">
                    {expanded === agent.agentId ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
                  </button>
                )}
              </div>

              {/* Mobile stats */}
              <div className="sm:hidden px-4 pb-3 flex gap-4">
                <div><p className="text-sm font-bold text-slate-900 dark:text-white">{agent.closedDeals}</p><p className="text-xs text-slate-400">Deals</p></div>
                <div><p className="text-sm font-bold text-violet-600 dark:text-violet-400">{formatCurrency(agent.totalRevenue)}</p><p className="text-xs text-slate-400">Revenue</p></div>
                <div><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(agent.commission)}</p><p className="text-xs text-slate-400">Commission</p></div>
              </div>

              {/* Expanded deal breakdown */}
              {expanded === agent.agentId && agent.deals.length > 0 && (
                <div className="border-t border-slate-100 dark:border-slate-700">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        {["Client", "Property", "Deal Value", "Commission"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {agent.deals.map(deal => (
                        <tr key={deal.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                          <td className="px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300">{deal.clientName}</td>
                          <td className="px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400">{deal.propertyName || "—"}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-violet-600 dark:text-violet-400">{formatFullCurrency(deal.value)}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatFullCurrency(deal.commission)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
