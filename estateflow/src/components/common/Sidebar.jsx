import { NavLink, useLocation } from "react-router-dom";
import {
  HiViewGrid,
  HiOfficeBuilding,
  HiUsers,
  HiUserGroup,
  HiChartBar,
  HiCog,
  HiX,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/formatters";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: <HiViewGrid className="w-5 h-5" /> },
  { path: "/properties", label: "Properties", icon: <HiOfficeBuilding className="w-5 h-5" /> },
  { path: "/leads", label: "Leads", icon: <HiUsers className="w-5 h-5" /> },
  { path: "/agents", label: "Agents", icon: <HiUserGroup className="w-5 h-5" /> },
  { path: "/analytics", label: "Analytics", icon: <HiChartBar className="w-5 h-5" /> },
  { path: "/settings", label: "Settings", icon: <HiCog className="w-5 h-5" /> },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 flex flex-col
          bg-slate-900 dark:bg-slate-950
          border-r border-slate-800
          transition-all duration-300 ease-in-out
          ${collapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">EstateFlow</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
          )}

          {/* Mobile close */}
          <button
            onClick={onMobileClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!collapsed && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </p>
          )}
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onMobileClose}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150 group
                    ${isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User profile at bottom */}
        {user && (
          <div className={`p-3 border-t border-slate-800 shrink-0 ${collapsed ? "flex justify-center" : ""}`}>
            {collapsed ? (
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-700">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors">
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-700 shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">
                      {getInitials(user.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 items-center justify-center text-slate-300 hover:bg-slate-600 transition-colors z-10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <HiChevronRight className="w-3.5 h-3.5" />
          ) : (
            <HiChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </aside>
    </>
  );
}
