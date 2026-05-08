import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { dashboardService } from "../services/api";
import { formatCurrency } from "../utils/formatters";
import ChartCard from "../components/common/ChartCard";
import { ChartSkeleton } from "../components/common/SkeletonLoader";

const COLORS = ["#6366f1", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

// Custom pie label
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("12m");

  useEffect(() => {
    async function load() {
      const [rev, sales, leads, types, activity] = await Promise.all([
        dashboardService.getRevenueData(),
        dashboardService.getPropertySalesData(),
        dashboardService.getLeadsGrowthData(),
        dashboardService.getPropertyTypeData(),
        dashboardService.getActivityData(),
      ]);
      setRevenueData(rev);
      setSalesData(sales);
      setLeadsData(leads);
      setTypeData(types);
      setActivityData(activity);
      setLoading(false);
    }
    load();
  }, []);

  const displayRevenue = period === "6m" ? revenueData.slice(-6) : revenueData;
  const displaySales = period === "6m" ? salesData.slice(-6) : salesData;
  const displayLeads = period === "6m" ? leadsData.slice(-6) : leadsData;

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalSold = salesData.reduce((s, d) => s + d.sold, 0);
  const totalLeads = leadsData.reduce((s, d) => s + d.leads, 0);
  const conversionRate = totalLeads > 0 ? ((leadsData.reduce((s, d) => s + d.converted, 0) / totalLeads) * 100).toFixed(1) : 0;

  const tooltipStyle = { background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Performance overview and insights</p>
        </div>
        <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
          {["6m", "12m"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? "bg-violet-600 text-white" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              {p === "6m" ? "6 Months" : "12 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI summary */}
      {!loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), sub: "This year", color: "text-violet-600 dark:text-violet-400" },
            { label: "Properties Sold", value: totalSold, sub: "This year", color: "text-blue-600 dark:text-blue-400" },
            { label: "Total Leads", value: totalLeads, sub: "This year", color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Conversion Rate", value: `${conversionRate}%`, sub: "Lead to sale", color: "text-amber-600 dark:text-amber-400" },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{kpi.label}</p>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {loading ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ChartSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Revenue trend */}
            <ChartCard title="Revenue Trend" subtitle={`Monthly revenue — last ${period === "6m" ? "6" : "12"} months`}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={displayRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${(v / 1000).toFixed(0)}k`, undefined]} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2.5} fill="url(#revGrad2)" />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Property type distribution */}
            <ChartCard title="Property Type Distribution" subtitle="By number of listings">
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={240}>
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} dataKey="value" labelLine={false} label={PieLabel}>
                      {typeData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {typeData.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{item.name}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Monthly sales */}
            <ChartCard title="Monthly Property Sales" subtitle="Listed vs sold comparison">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={displaySales} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="listed" name="Listed" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sold" name="Sold" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Lead conversion */}
            <ChartCard title="Lead Conversion" subtitle="New leads vs converted">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={displayLeads} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="leads" name="New Leads" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="converted" name="Converted" stroke="#10b981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Weekly activity */}
          <ChartCard title="Weekly Activity" subtitle="Page views and inquiries by day">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="views" name="Views" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                <Bar dataKey="inquiries" name="Inquiries" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}
