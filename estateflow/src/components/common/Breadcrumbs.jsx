import { Link, useLocation } from "react-router-dom";
import { HiChevronRight, HiHome } from "react-icons/hi";

// Map route segments to readable labels
const routeLabels = {
  dashboard: "Dashboard",
  properties: "Properties",
  leads: "Leads",
  agents: "Agents",
  analytics: "Analytics",
  settings: "Settings",
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      <Link
        to="/dashboard"
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        aria-label="Home"
      >
        <HiHome className="w-4 h-4" />
      </Link>

      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment;

        return (
          <span key={path} className="flex items-center gap-1.5">
            <HiChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
            {isLast ? (
              <span className="font-medium text-slate-700 dark:text-slate-200">
                {label}
              </span>
            ) : (
              <Link
                to={path}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
