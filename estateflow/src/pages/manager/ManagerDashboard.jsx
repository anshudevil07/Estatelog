import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HiOfficeBuilding, HiUsers, HiCurrencyRupee, HiTrendingUp, HiPlus } from "react-icons/hi";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { analyticsService } from "../../firebase/firestoreService";
import { useAuth } from "../../context/AuthContext";
import { formatCurrency, formatNumber } from "../../utils/formatters";
import StatsCard from "../../components/common/StatsCard";
import ChartCard from "../../components/common/ChartCard";
import { StatsCardSkeleton, ChartSkeleton } from "../../components/common/SkeletonLoader";
import RecentActivity from "../../components/dashboard/RecentActivity";
import { propertySalesData, leadsGrowthData } from "../../data/mockData";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardStats()
      .then(setStats)
      .catch(() => setStats({ totalProperties: 0, activeLeads: 0, monthlyRevenue: 0, totalSales: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const tooltipStyle = { background: "#1e293b", border: "none", borderRadius: "12px", color: "#f1f5f9", fontSize: "12px" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manager Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Welcome, {user?.name}. Manage your team's leads and properties.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => <StatsCardSkeleton key={i} />) : (
          <>
            <StatsCard title="Total Properties" value={formatNumber(stats.totalProperties)} change={12.5} icon={<HiOfficeBuilding className="w-5 h-5" />} color="violet" />
            <StatsCard title="Active Leads" value={formatNumber(stats.activeLeads)} change={8.3} icon={<HiUsers className="w-5 h-5" />} color="blue" />
            <StatsCard title="Total Revenue" value={formatCurrency(stats.monthlyRevenue)} change={16.7} icon={<HiCurrencyRupee className="w-5 h-5" />} color="emerald" />
            <StatsCard title="Properties Sold" value={formatNumber(stats.totalSales)} change={5.2} icon={<HiTrendingUp className="w-5 h-5" />} color="amber" />
          </>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Add Property", path: "/manager/properties", color: "bg-violet-600 hover:bg-violet-700" },
          { label: "Add Lead", path: "/manager/leads", color: "bg-blue-600 hover:bg-blue-700" },
          { label: "View Agents", path: "/manager/agents", color: "bg-emerald-600 hover:bg-emerald-700" },
          { label: "Analytics", path: "/manager/analytics", color: "bg-amber-600 hover:bg-amber-700" },
        ].map((a) => (
          <button key={a.label} onClick={() => navigate(a.path)}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium transition-all hover:scale-105 ${a.color}`}>
            <HiPlus className="w-4 h-4" />{a.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {loading ? <><ChartSkeleton /><ChartSkeleton /></> : (
          <>
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
          </>
        )}
      </div>

      {/* Recent activity — real-time from Firestore */}
      <RecentActivity limit={5} role="manager" />
    </div>
  );
}
