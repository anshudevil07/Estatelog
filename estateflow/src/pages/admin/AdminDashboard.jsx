import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiOfficeBuilding, HiUsers, HiCurrencyRupee, HiTrendingUp,
  HiUserGroup, HiPlus, HiDocumentReport,
} from "react-icons/hi";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { analyticsService } from "../../firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import StatsCard from "../../components/common/StatsCard";
import ChartCard from "../../components/common/ChartCard";
import { StatsCardSkeleton, ChartSkeleton } from "../../components/common/SkeletonLoader";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { revenueData, propertySalesData, leadsGrowthData } from "../../data/mockData";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(setStats)
      .catch(() => setStats({ totalProperties: 0, activeLeads: 0, monthlyRevenue: 0, totalSales: 0, totalAgents: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const tooltipStyle = { background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" };

  const quickActions = [
    { label: "Add Property", icon: <HiPlus />, path: "/admin/properties", color: "bg-violet-600 hover:bg-violet-700" },
    { label: "Add Lead", icon: <HiUsers />, path: "/admin/leads", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Manage Agents", icon: <HiUserGroup />, path: "/admin/agents", color: "bg-emerald-600 hover:bg-emerald-700" },
    { label: "Analytics", icon: <HiDocumentReport />, path: "/admin/analytics", color: "bg-amber-600 hover:bg-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome back, {user?.name}. Here's your company overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <StatsCardSkeleton key={i} />)
        ) : (
          <>
            <StatsCard title="Total Properties" value={formatNumber(stats.totalProperties)} change={12.5} icon={<HiOfficeBuilding className="w-5 h-5" />} color="violet" />
            <StatsCard title="Active Leads" value={formatNumber(stats.activeLeads)} change={8.3} icon={<HiUsers className="w-5 h-5" />} color="blue" />
            <StatsCard title="Total Revenue" value={formatCurrency(stats.monthlyRevenue)} change={16.7} icon={<HiCurrencyRupee className="w-5 h-5" />} color="emerald" />
            <StatsCard title="Properties Sold" value={formatNumber(stats.totalSales)} change={5.2} icon={<HiTrendingUp className="w-5 h-5" />} color="amber" />
            <StatsCard title="Total Agents" value={formatNumber(stats.totalAgents)} change={2.1} icon={<HiUserGroup className="w-5 h-5" />} color="violet" />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {loading ? (
          <><div className="xl:col-span-2"><ChartSkeleton /></div><ChartSkeleton /></>
        ) : (
          <>
            <ChartCard title="Revenue Analytics" subtitle="Monthly revenue trend (₹)" className="xl:col-span-2">
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
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 100000}L`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${(v / 100000).toFixed(1)}L`, undefined]} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
                  <Line type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Quick actions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button key={action.label} onClick={() => navigate(action.path)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl text-white transition-all hover:scale-105 ${action.color}`}>
                    <span className="text-xl">{action.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sales + Leads charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ChartCard title="Property Sales" subtitle="Listed vs sold per month">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propertySalesData.slice(-6)} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="listed" name="Listed" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sold" name="Sold" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leads Growth" subtitle="New leads vs converted">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={leadsGrowthData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Line type="monotone" dataKey="leads" name="New Leads" stroke="#6366f1" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="converted" name="Converted" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity — real-time from Firestore */}
      <RecentActivity limit={6} role="admin" />
    </div>
  );
}
