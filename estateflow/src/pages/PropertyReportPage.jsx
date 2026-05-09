import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { HiOfficeBuilding, HiCheckCircle, HiClock, HiCurrencyRupee } from "react-icons/hi";
import { reportService } from "../firebase/reportService";
import { formatCurrency, formatFullCurrency } from "../utils/formatters";
import ChartCard from "../components/common/ChartCard";
import { ChartSkeleton, StatsCardSkeleton } from "../components/common/SkeletonLoader";
import StatusBadge from "../components/common/StatusBadge";
import EmptyState from "../components/common/EmptyState";

const PIE_COLORS = ["#7c3aed", "#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const tooltipStyle = {
  background: "#1e293b", border: "none",
  borderRadius: "12px", color: "#f1f5f9", fontSize: "12px",
};

function CustomPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function PropertyReportPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportService.getPropertyReport()
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Report</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Overview of your property portfolio</p>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <StatsCardSkeleton key={i} />)}
        </div>
      ) : !report ? (
        <EmptyState title="No property data" description="Add properties to see reports." />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Properties", value: report.total, icon: <HiOfficeBuilding className="w-5 h-5" />, color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400" },
              { label: "Available", value: report.available, icon: <HiClock className="w-5 h-5" />, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
              { label: "Sold", value: report.sold, icon: <HiCheckCircle className="w-5 h-5" />, color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" },
              { label: "Total Portfolio Value", value: formatCurrency(report.totalValue), icon: <HiCurrencyRupee className="w-5 h-5" />, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" },
            ].map(stat => (
              <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Status breakdown */}
            <ChartCard title="Status Breakdown" subtitle="Properties by current status">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Available", value: report.available },
                        { name: "Sold", value: report.sold },
                        { name: "Pending", value: report.pending },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={85}
                      dataKey="value" labelLine={false} label={CustomPieLabel}
                    >
                      {["#7c3aed", "#10b981", "#f59e0b"].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {[
                    { label: "Available", value: report.available, color: "#7c3aed" },
                    { label: "Sold", value: report.sold, color: "#10b981" },
                    { label: "Pending", value: report.pending, color: "#f59e0b" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-sm text-slate-600 dark:text-slate-400 flex-1">{item.label}</span>
                      <span className="text-sm font-bold text-slate-800 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Revenue from sold</p>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(report.soldValue)}</p>
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Type breakdown */}
            <ChartCard title="Property Types" subtitle="Count by property type">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.byType} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Properties" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top properties by inquiries */}
          {report.topProperties.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-base font-semibold text-slate-800 dark:text-white">Top Properties by Inquiries</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      {["Property", "Location", "Price", "Status", "Inquiries", "Visits"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {report.topProperties.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.image && <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />}
                            <span className="text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">{p.location}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-violet-600 dark:text-violet-400 whitespace-nowrap">{formatFullCurrency(p.price)}</td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {p.inquiries}
                            {p.inquiries > 0 && <span className="text-xs text-violet-500">🔥</span>}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{p.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
