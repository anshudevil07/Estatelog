import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  HiViewGrid, HiUsers, HiOfficeBuilding,
  HiCog, HiX, HiChevronLeft, HiChevronRight,
  HiUserCircle, HiLogout, HiViewBoards, HiBell, HiCalendar, HiDownload,
} from "react-icons/hi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getInitials } from "../utils/formatters";
import Navbar from "../components/common/Navbar";

const agentNav = [
  { path: "/agent/dashboard", label: "My Dashboard", icon: <HiViewGrid className="w-5 h-5" /> },
  { path: "/agent/leads", label: "My Leads", icon: <HiUsers className="w-5 h-5" /> },
  { path: "/agent/clients", label: "My Clients", icon: <HiUserCircle className="w-5 h-5" /> },
  { path: "/agent/pipeline", label: "My Pipeline", icon: <HiViewBoards className="w-5 h-5" /> },
  { path: "/agent/visits", label: "Site Visits", icon: <HiCalendar className="w-5 h-5" /> },
  { path: "/agent/reminders", label: "Reminders", icon: <HiBell className="w-5 h-5" /> },
  { path: "/agent/export-import", label: "Export / Import", icon: <HiDownload className="w-5 h-5" /> },
  { path: "/agent/properties", label: "Properties", icon: <HiOfficeBuilding className="w-5 h-5" /> },
  { path: "/agent/settings", label: "Settings", icon: <HiCog className="w-5 h-5" /> },
];

export default function AgentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    toast.success("Logged out successfully");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      <aside className={`fixed top-0 left-0 h-full z-40 flex flex-col bg-slate-900 dark:bg-slate-950 border-r border-slate-800 transition-all duration-300 ${collapsed ? "w-[72px]" : "w-[260px]"} ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className={`flex items-center h-16 px-4 border-b border-slate-800 shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <span className="text-white font-bold text-base">EstateFlow</span>
                <div className="flex items-center gap-1">
                  <HiUserCircle className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 text-xs font-medium">Agent</span>
                </div>
              </div>
            </div>
          )}
          {collapsed && <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center"><span className="text-white font-bold text-sm">E</span></div>}
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-white"><HiX className="w-5 h-5" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {!collapsed && <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Agent Panel</p>}
          <ul className="space-y-1">
            {agentNav.map((item) => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-violet-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"} ${collapsed ? "justify-center" : ""}`}>
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={`p-3 border-t border-slate-800 shrink-0 space-y-1 ${collapsed ? "flex flex-col items-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl">
              <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-700 shrink-0">
                {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">{getInitials(user?.name)}</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-blue-400">Agent</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors w-full ${collapsed ? "justify-center" : ""}`}>
            <HiLogout className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button onClick={() => setCollapsed((p) => !p)} className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 items-center justify-center text-slate-300 hover:bg-slate-600 transition-colors z-10">
          {collapsed ? <HiChevronRight className="w-3.5 h-3.5" /> : <HiChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      <div className={`flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}`}>
        <Navbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 md:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
