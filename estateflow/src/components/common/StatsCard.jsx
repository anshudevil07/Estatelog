import { HiTrendingUp, HiTrendingDown } from "react-icons/hi";

export default function StatsCard({ title, value, change, icon, color = "violet", prefix = "" }) {
  const isPositive = change >= 0;

  const colorMap = {
    violet: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.violet}`}>
          {icon}
        </div>
      </div>

      <p className="text-2xl font-bold text-slate-900 dark:text-white mb-1.5">
        {prefix}{value}
      </p>

      <div className="flex items-center gap-1">
        {isPositive ? (
          <HiTrendingUp className="w-4 h-4 text-emerald-500" />
        ) : (
          <HiTrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-xs font-medium ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
          {isPositive ? "+" : ""}{change}%
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
      </div>
    </div>
  );
}
