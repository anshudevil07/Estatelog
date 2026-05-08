// Utility functions — all currency in Indian Rupees (₹)

/**
 * Format amount as short ₹ value (e.g. ₹1.2Cr, ₹45L, ₹5K)
 */
export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
  return `₹${num.toLocaleString("en-IN")}`;
}

/**
 * Format full currency with commas in Indian format
 */
export function formatFullCurrency(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format a Firestore timestamp or date string to readable format
 */
export function formatDate(value) {
  if (!value) return "—";
  // Handle Firestore Timestamp objects
  const date = value?.toDate ? value.toDate() : new Date(value);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format number with Indian comma system (1,00,000)
 */
export function formatNumber(num) {
  return Number(num || 0).toLocaleString("en-IN");
}

/**
 * Get initials from a full name
 */
export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/**
 * Truncate text to a given length
 */
export function truncate(text, length = 50) {
  if (!text) return "";
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

/**
 * Get Tailwind color classes for status badges
 */
export function getStatusColor(status) {
  const colors = {
    Available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Sold: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    New: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    Contacted: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
    Interested: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Closed: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400",
  };
  return colors[status] || "bg-gray-100 text-gray-600";
}

/**
 * Format percentage change
 */
export function formatChange(value) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value}%`;
}

/**
 * Get role badge color
 */
export function getRoleColor(role) {
  const colors = {
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    manager: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
    agent: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };
  return colors[role] || "bg-gray-100 text-gray-600";
}
