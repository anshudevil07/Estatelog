import { useState, useEffect } from "react";
import {
  HiOfficeBuilding, HiUsers, HiCurrencyDollar, HiTrendingUp,
  HiPlus, HiEye, HiDocumentReport, HiUserAdd,
} from "react-icons/hi";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { dashboardService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, formatNumber, formatDate } from "../utils/formatters";
import StatsCard from "../components/common/StatsCard";
import ChartCard from "../components/common/ChartCard";
import { StatsCardSkeleton, ChartSkeleton } from "../components/common/SkeletonLoader";
import StatusBadge from "../components/common/StatusBadge";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [s, rev, sales, leads, acts] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRevenueData(),
          dashboardService.getPropertySalesData(),
          dashboardService.getLeadsGrowthData(),
          dashboardService.getRecentActivities(),
        ]);
        setStats(s);
        setRevenueData(rev);
        setSalesData(sales);
        setLeadsData(leads);
        setActivities(acts);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const quickActions = [
    { label: "Add Property", icon: <HiPlus className="w-5 h-5" />, path: "/properties", color: "bg-violet-600 hover:bg-violet-700" },
    { label: "Add Lead", icon: <HiUserAdd className="w-5 h-5" />, path: "/leads", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "View Analytics", icon: <HiDocumentReport className="w-5 h-5" />, path: "/analytics", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "View Agents", icon: <HiEye className="w-5 h-5" />, path: "/agents", color: "bg-amber-600 hover:bg-amber-700" },
  ];

  const activityIcons = {
    sale: "💰", lead: "👤", property: "🏠", agent: "🤝",
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Good morning, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Here's what's happening with your portfolio today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard
              title="Total Properties"
              value={formatNumber(stats.totalProperties)}
              change={stats.propertiesChange}
              icon={<HiOfficeBuilding className="w-5 h-5" />}
              color="violet"
            />
            <StatsCard
              title="Active Leads"
              value={formatNumber(stats.activeLeads)}
              change={stats.leadsChange}
              icon={<HiUsers className="w-5 h-5" />}
              color="blue"
            />
            <StatsCard
              title="Monthly Revenue"
              value={formatCurrency(stats.monthlyRevenue)}
              change={stats.revenueChange}
              icon={<HiCurrencyDollar className="w-5 h-5" />}
              color="emerald"
            />
            <StatsCard
              title="Total Sales"
              value={formatNumber(stats.totalSales)}
              change={stats.salesChange}
              icon={<HiTrendingUp className="w-5 h-5" />}
              color="amber"
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue chart — takes 2 cols */}
        {loading ? (
          <>
            <div className="xl:col-span-2"><ChartSkeleton /></div>
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard
              title="Revenue Analytics"
              subtitle="Monthly revenue vs target"
              className="xl:col-span-2"
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" }}
                    formatter={(v) => [`$${(v / 1000).toFixed(0)}k`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Property sales */}
            <ChartCard title="Property Sales" subtitle="Listed vs sold this year">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={salesData.slice(-6)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" }} />
                  <Bar dataKey="listed" name="Listed" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sold" name="Sold" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Leads growth chart */}
        {loading ? (
          <>
            <div className="xl:col-span-2"><ChartSkeleton /></div>
            <ChartSkeleton />
          </>
        ) : (
          <>
            <ChartCard title="Leads Growth" subtitle="New leads vs conversions" className="xl:col-span-2">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={leadsData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line type="monotone" dataKey="leads" name="New Leads" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="converted" name="Converted" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-all hover:scale-105 ${action.color}`}
                  >
                    {action.icon}
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">Recent Activity</h3>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/4" />
                  </div>
                </li>
              ))
            : activities.map((act) => (
                <li key={act.id} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base shrink-0">
                    {activityIcons[act.type] || "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{act.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{act.time}</p>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
}
