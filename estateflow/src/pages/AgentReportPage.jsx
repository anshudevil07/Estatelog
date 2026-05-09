import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { HiTrendingUp, HiUsers, HiCurrencyRupee, HiStar, HiCalendar } from "react-icons/hi";
import { reportService } from "../firebase/reportService";
import { formatCurrency, getInitials } from "../utils/formatters";
import ChartCard from "../components/common/ChartCard";
import { ChartSkeleton } from "../components/common/SkeletonLoader";
import EmptyState from "../components/common/EmptyState";

const tooltipStyle = {
  background: "#1e293b", border: "none",
  borderRadius: "12px", color: "#f1f5f9", fontSize: "12px",
};

export default function AgentReportPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("revenue");

  useEffect(() => {
    reportService.getAgentPerformance()
      .then(data => {
        setAgents(data);
        if (data.length > 0) setSelected(data[0]);
      })
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...agents].sort((a, b) => {
    if (sortBy === "revenue") return b.revenue - a.revenue;
    if (sortBy === "leads") return b.totalLeads - a.totalLeads;
    if (sortBy === "conversion") return b.conversionRate - a.conversionRate;
    return b.closedDeals - a.closedDeals;
  });

  const revenueChartData = sorted.map(a => ({
    name: a.name.split(" ")[0],
    revenue: a.revenue,
    leads: a.totalLeads,
    deals: a.closedDeals,
  }));

  const radarData = selected ? [
    { metric: "Leads", value: Math.min(selected.totalLeads * 5, 100) },
    { metric: "Closed", value: Math.min(selected.closedLeads * 10, 100) },
    { metric: "Deals", value: Math.min(selected.closedDeals * 10, 100) },
    { metric: "Visits", value: Math.min(selected.visitsCompleted * 8, 100) },
    { metric: "Conversion", value: selected.conversionRate },
  ] : [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Agent Performance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {agents.length} agents · Real-time data
          </p>
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500">
          <option value="revenue">Sort by Revenue</option>
          <option value="leads">Sort by Leads</option>
          <option value="deals">Sort by Deals Closed</option>
          <option value="conversion">Sort by Conversion Rate</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartSkeleton /><ChartSkeleton />
        </div>
      ) : agents.length === 0 ? (
        <EmptyState title="No agent data yet" description="Agent performance will appear once agents start closing deals." />
      ) : (
        <>
          {/* Leaderboard */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white">Leaderboard</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700/50">
                  <tr>
                    {["Rank", "Agent", "Leads", "Closed", "Deals", "Visits", "Conversion", "Revenue"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {sorted.map((agent, i) => (
                    <tr key={agent.id}
                      onClick={() => setSelected(agent)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30 ${selected?.id === agent.id ? "bg-violet-50 dark:bg-violet-900/10" : ""}`}>
                      <td className="px-4 py-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? "bg-amber-100 text-amber-700" :
                          i === 1 ? "bg-slate-100 text-slate-600" :
                          i === 2 ? "bg-orange-100 text-orange-700" :
                          "bg-slate-50 dark:bg-slate-700 text-slate-500"
                        }`}>
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {agent.avatar ? (
                            <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <span className="text-violet-600 text-xs font-bold">{getInitials(agent.name)}</span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap">{agent.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{agent.totalLeads}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{agent.closedLeads}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{agent.closedDeals}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{agent.visitsCompleted}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full max-w-[60px]">
                            <div className="h-full bg-violet-500 rounded-full" style={{ width: `${agent.conversionRate}%` }} />
                          </div>
                          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{agent.conversionRate}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(agent.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <ChartCard title="Revenue by Agent" subtitle="Closed deal value per agent">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => formatCurrency(v)} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [formatCurrency(v), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Radar chart for selected agent */}
            {selected && (
              <ChartCard
                title={`${selected.name} — Performance Radar`}
                subtitle="Click any agent in the table to view their radar"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Radar name={selected.name} dataKey="value" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
                    <Tooltip contentStyle={tooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </div>

          {/* Selected agent detail */}
          {selected && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
                {selected.name} — Detailed Stats
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Leads", value: selected.totalLeads, icon: <HiUsers className="w-5 h-5" />, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
                  { label: "Deals Closed", value: selected.closedDeals, icon: <HiTrendingUp className="w-5 h-5" />, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
                  { label: "Conversion", value: `${selected.conversionRate}%`, icon: <HiStar className="w-5 h-5" />, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
                  { label: "Revenue", value: formatCurrency(selected.revenue), icon: <HiCurrencyRupee className="w-5 h-5" />, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
